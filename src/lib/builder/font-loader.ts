import JSZip from "jszip";

export interface CustomFont {
  name: string;
  url: string;
  type: "google" | "upload";
}

/**
 * Registers a font (Google Font link or Base64 uploaded asset) dynamically in the document.
 */
export async function loadFont(font: CustomFont): Promise<void> {
  if (typeof window === "undefined") return;

  if (font.type === "google") {
    return new Promise<void>((resolve) => {
      const id = `google-font-${font.name.replace(/\s+/g, "-").toLowerCase()}`;
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = font.url;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Avoid blocking if link is invalid
      document.head.appendChild(link);
    });
  } else if (font.type === "upload") {
    try {
      // Check if this font face is already loaded under the exact name
      const alreadyLoaded = Array.from(document.fonts.values()).some(
        (face) => face.family.toLowerCase() === font.name.toLowerCase()
      );
      if (alreadyLoaded) return;

      const fontFace = new FontFace(font.name, `url(${font.url})`);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
    } catch (err) {
      console.error(`Failed to load uploaded font ${font.name}:`, err);
    }
  }
}

/**
 * Registers multiple custom fonts in parallel.
 */
export async function loadAllCustomFonts(fonts: CustomFont[]): Promise<void> {
  await Promise.all(fonts.map((f) => loadFont(f)));
}

/**
 * Parses a Google Font user input (name, URL or spec link) and constructs a clean embedding URL.
 */
export function parseGoogleFontUrl(input: string): { name: string; url: string } | null {
  let familyName = "";
  let normalizedUrl = "";

  const val = input.trim();
  if (!val) return null;

  // Case 1: Full stylesheet API link
  // e.g. https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
  if (val.includes("fonts.googleapis.com/css2")) {
    try {
      const urlObj = new URL(val);
      const familyParam = urlObj.searchParams.get("family");
      if (familyParam) {
        // e.g., "Roboto:wght@400"
        const part = familyParam.split(":")[0];
        familyName = decodeURIComponent(part).replace(/\+/g, " ");
        normalizedUrl = val;
      }
    } catch (e) {
      console.error("Failed to parse Google Font URL:", e);
    }
  }
  // Case 2: Google Fonts web link
  // e.g. https://fonts.google.com/specimen/Playfair+Display
  else if (val.includes("fonts.google.com/specimen/")) {
    try {
      const urlObj = new URL(val);
      const pathParts = urlObj.pathname.split("/");
      const specimenIndex = pathParts.indexOf("specimen");
      if (specimenIndex !== -1 && pathParts[specimenIndex + 1]) {
        const part = pathParts[specimenIndex + 1];
        familyName = decodeURIComponent(part).replace(/\+/g, " ");
        normalizedUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(part)}:wght@300;400;500;600;700;800&display=swap`;
      }
    } catch (e) {
      console.error("Failed to parse Google Font URL path:", e);
    }
  }
  // Case 3: Simple Font Name
  // e.g. "Dancing Script"
  else {
    familyName = val;
    const urlPart = val.replace(/\s+/g, "+");
    normalizedUrl = `https://fonts.googleapis.com/css2?family=${urlPart}:wght@300;400;500;600;700;800&display=swap`;
  }

  if (!familyName || !normalizedUrl) return null;

  return { name: familyName, url: normalizedUrl };
}

/**
 * Extracts fonts from a ZIP archive and outputs base64-encoded custom font instances.
 */
export async function extractFontsFromZip(file: File): Promise<CustomFont[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const fontFiles: { name: string; file: JSZip.JSZipObject }[] = [];

  loadedZip.forEach((relativePath, fileObj) => {
    if (/\.(ttf|otf|woff2?)$/i.test(relativePath) && !fileObj.dir) {
      fontFiles.push({ name: relativePath.split("/").pop()!, file: fileObj });
    }
  });

  if (fontFiles.length === 0) {
    throw new Error("No font files (.ttf, .otf, .woff, .woff2) found in the zip archive.");
  }

  const importedFonts: CustomFont[] = [];
  for (const fontFile of fontFiles) {
    const buffer = await fontFile.file.async("arraybuffer");
    const ext = fontFile.name.split(".").pop()?.toLowerCase();
    let mimeType = "font/ttf";
    if (ext === "otf") mimeType = "font/otf";
    else if (ext === "woff") mimeType = "font/woff";
    else if (ext === "woff2") mimeType = "font/woff2";

    const blob = new Blob([buffer], { type: mimeType });
    const reader = new FileReader();
    const base64Url = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Clean font name (e.g. MyFont-Bold.ttf -> MyFont-Bold)
    const fontName = fontFile.name.replace(/\.[^/.]+$/, "");
    importedFonts.push({
      name: fontName,
      url: base64Url,
      type: "upload",
    });
  }

  return importedFonts;
}
