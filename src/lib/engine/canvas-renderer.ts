import { getBrowser, closeBrowser } from "@/lib/engine/pdf-generator";

export async function canvasJsonToPdf(
  canvasJson: Record<string, unknown>,
  width: number,
  height: number
): Promise<Buffer> {
  const html = buildFabricHtml(canvasJson, width, height);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    await page.waitForFunction("window.__fabricReady === true", { timeout: 15000 });

    const pdfBuffer = await page.pdf({
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

function buildFabricHtml(canvasJson: Record<string, unknown>, width: number, height: number): string {
  const jsonStr = JSON.stringify(canvasJson).replace(/<\/script>/gi, "<\\/script>");
  
  // Extract customFonts from canvasJson
  const customFonts = (canvasJson.customFonts as any[]) || [];
  let fontStyles = "";
  let fontLinks = "";

  customFonts.forEach((font: any) => {
    if (font.type === "google") {
      fontLinks += `<link rel="stylesheet" href="${font.url}">\n`;
    } else if (font.type === "upload") {
      let format = "truetype";
      if (font.url.includes("data:font/otf") || font.url.includes("data:application/x-font-opentype")) {
        format = "opentype";
      } else if (font.url.includes("data:font/woff2")) {
        format = "woff2";
      } else if (font.url.includes("data:font/woff")) {
        format = "woff";
      }
      fontStyles += `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.url}') format('${format}');
        }
      `;
    }
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${width}px; height: ${height}px; overflow: hidden; }
    canvas { display: block; }
    ${fontStyles}
  </style>
  ${fontLinks}
  <script src="https://cdn.jsdelivr.net/npm/fabric@7/dist/index.min.js"></script>
</head>
<body>
  <canvas id="c" width="${width}" height="${height}"></canvas>
  <script>
    (async function() {
      try {
        const canvas = new fabric.Canvas('c', { width: ${width}, height: ${height} });
        const json = ${jsonStr};
        await canvas.loadFromJSON(json);
        if (document.fonts) {
          await document.fonts.ready;
        }
        canvas.renderAll();
        window.__fabricReady = true;
      } catch(e) {
        console.error(e);
        window.__fabricReady = true;
      }
    })();
  </script>
</body>
</html>`;
}

export { closeBrowser };
