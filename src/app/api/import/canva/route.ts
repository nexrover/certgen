import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clampViewportDimensions,
  extractCanvaDimensionsFromHtml,
  resolveCanvaDimensions,
} from "@/lib/canva-import";
import { getBrowser } from "@/lib/engine/pdf-generator";

const requestSchema = z.object({
  url: z.string().trim().min(1, "Invalid URL provided."),
});

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function buildTargetUrl(designId: string, possibleKey?: string): string {
  if (possibleKey && possibleKey !== "view" && possibleKey !== "edit") {
    return `https://www.canva.com/design/${designId}/${possibleKey}/view?embed`;
  }
  return `https://www.canva.com/design/${designId}/view?embed`;
}

async function resolveDesignUrl(url: string): Promise<string | null> {
  let resolvedUrl = url;
  let designIdMatch = resolvedUrl.match(/design\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?/);

  if (!designIdMatch) {
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": USER_AGENT },
      });
      if (headResponse.url) {
        resolvedUrl = headResponse.url;
        designIdMatch = resolvedUrl.match(/design\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?/);
      }
    } catch (headError) {
      console.warn("HEAD request to resolve redirect failed, falling back to GET:", headError);
    }

    if (!designIdMatch) {
      try {
        const getResponse = await fetch(url, {
          method: "GET",
          redirect: "follow",
          headers: { "User-Agent": USER_AGENT },
        });
        if (getResponse.url) {
          resolvedUrl = getResponse.url;
          designIdMatch = resolvedUrl.match(/design\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?/);
        }
      } catch (getError) {
        console.error("GET request to resolve redirect failed:", getError);
      }
    }
  }

  if (!designIdMatch) return null;

  return buildTargetUrl(designIdMatch[1], designIdMatch[2]);
}

function extractOgImageUrl(html: string): string | null {
  const ogImageMatch =
    html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ??
    html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);

  if (!ogImageMatch?.[1]) return null;
  return ogImageMatch[1].replace(/&amp;/g, "&");
}

export async function POST(req: Request) {
  let browser;
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const targetUrl = await resolveDesignUrl(parsed.data.url);
    if (!targetUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Canva URL. Please make sure it contains the design ID or is a valid public short link.",
        },
        { status: 400 }
      );
    }

    // Attempt 1: Fetch and parse HTML for og:image (fast & lightweight)
    try {
      const response = await fetch(targetUrl, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        const html = await response.text();
        const imageUrl = extractOgImageUrl(html);

        if (imageUrl) {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            const dimensions = resolveCanvaDimensions({
              imageBuffer: buffer,
              html,
              imageUrl,
            });

            if (!dimensions) {
              return NextResponse.json(
                { success: false, error: "Could not determine Canva design dimensions." },
                { status: 422 }
              );
            }

            const base64 = buffer.toString("base64");
            return NextResponse.json({
              success: true,
              type: "scraped",
              width: dimensions.width,
              height: dimensions.height,
              dataUrl: `data:${contentType};base64,${base64}`,
            });
          }
        }
      }
    } catch (scrapingError) {
      console.warn("Fast scraping failed, falling back to Puppeteer:", scrapingError);
    }

    // Attempt 2: Puppeteer fallback — viewport matches design aspect ratio
    try {
      browser = await getBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);

      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      const html = await page.content();
      const designDimensions =
        extractCanvaDimensionsFromHtml(html) ?? { width: 1280, height: 720 };
      const viewport = clampViewportDimensions(designDimensions.width, designDimensions.height);

      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 2,
      });

      await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const clip = await page.evaluate(() => {
        const selectors = [
          "main canvas",
          "[data-testid='design-canvas']",
          "canvas",
          "[role='img']",
        ];

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 100) {
            return {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          }
        }
        return null;
      });

      const screenshotBuffer = await page.screenshot({
        type: "png",
        fullPage: false,
        ...(clip ? { clip } : {}),
      });

      await page.close();

      const buffer = Buffer.from(screenshotBuffer);
      const imageDimensions = resolveCanvaDimensions({
        imageBuffer: buffer,
        html,
      });
      const dimensions = imageDimensions ?? designDimensions;

      const base64 = buffer.toString("base64");
      return NextResponse.json({
        success: true,
        type: "puppeteer",
        width: dimensions.width,
        height: dimensions.height,
        dataUrl: `data:image/png;base64,${base64}`,
      });
    } catch (puppeteerError: unknown) {
      console.error("Puppeteer import failed:", puppeteerError);
      const errorMessage =
        typeof puppeteerError === "object" &&
        puppeteerError !== null &&
        "message" in puppeteerError
          ? String((puppeteerError as { message: string }).message)
          : String(puppeteerError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to render Canva template. Please make sure the link is public. Details: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Canva import endpoint error:", error);
    const errMsg =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: string }).message)
        : String(error);
    return NextResponse.json(
      { success: false, error: errMsg || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
