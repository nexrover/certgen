export interface CanvaDimensions {
  width: number;
  height: number;
}

/** Read pixel dimensions from a PNG or JPEG buffer without external dependencies. */
export function getImageDimensionsFromBuffer(buffer: Buffer): CanvaDimensions | null {
  if (buffer.length < 24) return null;

  // PNG: width/height at bytes 16–23 (big-endian)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG: scan markers for SOF0/SOF2
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  return null;
}

/** Parse og:image:width / og:image:height meta tags from Canva HTML. */
export function extractCanvaDimensionsFromHtml(html: string): CanvaDimensions | null {
  const widthMatch =
    html.match(/property=["']og:image:width["']\s+content=["'](\d+)["']/i) ??
    html.match(/content=["'](\d+)["']\s+property=["']og:image:width["']/i);
  const heightMatch =
    html.match(/property=["']og:image:height["']\s+content=["'](\d+)["']/i) ??
    html.match(/content=["'](\d+)["']\s+property=["']og:image:height["']/i);

  if (!widthMatch || !heightMatch) return null;

  const width = Number.parseInt(widthMatch[1], 10);
  const height = Number.parseInt(heightMatch[1], 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

/** Parse width-N/height-N segments commonly found in Canva CDN URLs. */
export function extractDimensionsFromUrl(url: string): CanvaDimensions | null {
  const match = url.match(/width-(\d+)\/height-(\d+)/i);
  if (!match) return null;

  const width = Number.parseInt(match[1], 10);
  const height = Number.parseInt(match[2], 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

/**
 * Resolve the best available design dimensions.
 * Priority: actual image pixels → HTML meta → URL pattern.
 */
export function resolveCanvaDimensions(
  sources: {
    imageBuffer?: Buffer;
    html?: string;
    imageUrl?: string;
  }
): CanvaDimensions | null {
  if (sources.imageBuffer) {
    const fromBuffer = getImageDimensionsFromBuffer(sources.imageBuffer);
    if (fromBuffer) return fromBuffer;
  }

  if (sources.html) {
    const fromHtml = extractCanvaDimensionsFromHtml(sources.html);
    if (fromHtml) return fromHtml;
  }

  if (sources.imageUrl) {
    const fromUrl = extractDimensionsFromUrl(sources.imageUrl);
    if (fromUrl) return fromUrl;
  }

  return null;
}

/** Clamp viewport dimensions while preserving aspect ratio. */
export function clampViewportDimensions(
  width: number,
  height: number,
  maxEdge = 1920
): CanvaDimensions {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };

  const scale = maxEdge / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
