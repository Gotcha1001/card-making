import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);

function allowedFile(filename) {
  if (!filename || typeof filename !== "string") {
    console.warn("Invalid filename:", filename);
    return false;
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && ALLOWED_EXTENSIONS.has(ext);
}

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxCharsPerLine) {
  const segments = text
    .split(/\n/)
    .filter((segment) => segment.trim().length > 0);
  const lines = [];
  segments.forEach((segment) => {
    const words = segment.split(/\s+/).filter((word) => word.length > 0);
    let currentLine = "";
    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
  });
  console.log("Line break analysis:", {
    originalText: text,
    maxCharsPerLine,
    linesFound: lines.length,
    lines,
  });
  return lines;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  try {
    const fontConfigPath = path.join(process.cwd(), "public/fonts");
    const fontConfigFile = path.join(fontConfigPath, "fonts.conf");
    process.env.FONTCONFIG_PATH = fontConfigPath;
    process.env.FONTCONFIG_FILE = fontConfigFile;
    console.log("Fontconfig paths:", {
      FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
      FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
    });

    const fontFile = path.join(fontConfigPath, "OpenSans-Regular.ttf");
    if (!fs.existsSync(fontConfigFile) || !fs.existsSync(fontFile)) {
      console.error("Font configuration or font file missing:", {
        fontConfigFile: fs.existsSync(fontConfigFile),
        fontFile: fs.existsSync(fontFile),
      });
      return NextResponse.json(
        { error: "Font configuration or font file missing" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image");
    const overlayImage = formData.get("overlay_image");
    const borderWidth = parseInt(formData.get("border_width")) || 0;
    const borderColor = formData.get("border_color") || "#000000";
    const borderType = formData.get("border_type") || "solid";
    const contrast = parseFloat(formData.get("contrast")) || 100;
    const grayscale = parseFloat(formData.get("grayscale")) || 0;
    const overlayCanvasX = parseFloat(formData.get("overlay_x")) || 0;
    const overlayCanvasY = parseFloat(formData.get("overlay_y")) || 0;
    const overlayWidth = parseInt(formData.get("overlay_width")) || 100;
    const overlayOpacity = parseFloat(formData.get("overlay_opacity")) || 0.5;
    const overlayBorderRadius =
      parseInt(formData.get("overlay_border_radius")) || 0;
    const poem = formData.get("poem") || "";
    const greeting = formData.get("greeting") || "";
    const poemFontSize = parseInt(formData.get("poem_font_size")) || 24;
    const poemColor = formData.get("poem_color") || "#333333";
    const occasion = formData.get("occasion") || "card";

    if (
      !imageFile ||
      !(imageFile instanceof File) ||
      !allowedFile(imageFile.name)
    ) {
      console.error("Invalid image file:", { imageFile });
      return NextResponse.json(
        { error: "Invalid or missing image file" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const panelWidth = 525;
    const canvasWidth = 1050;
    let canvasHeight = 744;

    let sharpImage = sharp(imageBuffer);
    let metadata = await sharpImage.metadata();

    if (poem || greeting) {
      const padding = 60;
      const fontSize = Math.max(10, Math.min(poemFontSize, 60));
      const greetingFontSize = fontSize * 1.2;
      const approxCharWidth = fontSize * 0.6;
      const maxCharsPerLine = Math.floor(
        (panelWidth - padding * 2) / approxCharWidth
      );
      const lineHeight = fontSize * 1.5;

      const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
      const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

      const greetingHeight = greetingLines.length * lineHeight;
      const poemHeight = poemLines.length * lineHeight;
      const greetingY = padding;
      const poemY =
        greetingLines.length > 0
          ? padding + greetingHeight + greetingFontSize
          : padding;
      const totalTextHeight = poemY + poemHeight + padding;

      canvasHeight = Math.ceil(Math.max(744, totalTextHeight));
    }

    sharpImage = sharpImage.resize({
      width: panelWidth,
      height: canvasHeight,
      fit: "cover",
      position: "center",
    });

    let mainImageBuffer = await sharpImage.toBuffer();
    metadata = await sharp(mainImageBuffer).metadata();

    let compositeOperations = [];

    if (
      overlayImage &&
      overlayImage instanceof File &&
      allowedFile(overlayImage.name) &&
      !imageFile.name.includes("watermarked")
    ) {
      const overlayBuffer = Buffer.from(await overlayImage.arrayBuffer());
      let overlayMetadata = await sharp(overlayBuffer).metadata();
      const aspectRatio = overlayMetadata.width / overlayMetadata.height;
      let targetOverlayWidth = Math.min(overlayWidth, panelWidth);
      let targetOverlayHeight = Math.round(targetOverlayWidth / aspectRatio);

      if (
        targetOverlayWidth > panelWidth ||
        targetOverlayHeight > canvasHeight
      ) {
        const scale = Math.min(
          panelWidth / targetOverlayWidth,
          canvasHeight / targetOverlayHeight
        );
        targetOverlayWidth = Math.round(targetOverlayWidth * scale);
        targetOverlayHeight = Math.round(targetOverlayHeight * scale);
      }

      let overlayResized = await sharp(overlayBuffer)
        .resize({
          width: targetOverlayWidth,
          height: targetOverlayHeight,
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      if (overlayBorderRadius > 0) {
        const overlayMetadataResized = await sharp(overlayResized).metadata();
        const maskSvg = `
          <svg width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}">
            <rect x="0" y="0" width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}"
              rx="${overlayBorderRadius}" ry="${overlayBorderRadius}" fill="white" fill-opacity="1"/>
          </svg>
        `;
        const maskBuffer = Buffer.from(maskSvg);
        overlayResized = await sharp(overlayResized)
          .composite([{ input: maskBuffer, blend: "dest-in" }])
          .ensureAlpha(1)
          .toFormat("png")
          .toBuffer();
      }

      const overlayMetadataResized = await sharp(overlayResized).metadata();
      const finalTop = Math.round(
        overlayCanvasY - overlayMetadataResized.height / 2
      );
      const finalLeft = Math.round(
        overlayCanvasX - overlayMetadataResized.width / 2
      );

      compositeOperations.push({
        input: overlayResized,
        top: Math.max(
          0,
          Math.min(finalTop, canvasHeight - overlayMetadataResized.height)
        ),
        left: Math.max(
          0,
          Math.min(finalLeft, panelWidth - overlayMetadataResized.width)
        ),
        blend: "over",
        opacity: overlayOpacity,
      });
    }

    if (compositeOperations.length > 0) {
      mainImageBuffer = await sharp(mainImageBuffer)
        .composite(compositeOperations)
        .toBuffer();
    }

    if (borderWidth > 0) {
      const borderSvg = `
        <svg width="${panelWidth}" height="${canvasHeight}">
          <rect
            x="${borderWidth / 2}"
            y="${borderWidth / 2}"
            width="${panelWidth - borderWidth}"
            height="${canvasHeight - borderWidth}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="${borderWidth}"
            stroke-dasharray="${
              borderType === "dashed"
                ? "10,5"
                : borderType === "dotted"
                ? "2,2"
                : "none"
            }"
          />
        </svg>
      `;
      mainImageBuffer = await sharp(mainImageBuffer)
        .composite([{ input: Buffer.from(borderSvg), top: 0, left: 0 }])
        .png()
        .toBuffer();
    }

    if (contrast !== 100 || grayscale > 0) {
      let finalImage = sharp(mainImageBuffer);
      if (contrast !== 100)
        finalImage = finalImage.linear((contrast / 100) * 0.75 + 0.25, 0);
      if (grayscale > 0) finalImage = finalImage.grayscale();
      mainImageBuffer = await finalImage.toBuffer();
    }

    let textBuffer = null;
    if (poem || greeting) {
      const padding = 60;
      const fontSize = Math.max(10, Math.min(60, poemFontSize));
      const greetingFontSize = fontSize * 1.2;
      const approxCharWidth = fontSize * 0.65;
      const maxCharsPerLine = Math.floor(
        (panelWidth - 2 * padding) / approxCharWidth
      );
      const lineHeight = fontSize * 1.5;

      const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
      const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

      const greetingY = padding;
      const poemY =
        greetingLines.length > 0
          ? padding + greetingLines.length * lineHeight + greetingFontSize
          : padding;

      const textSvg = `
        <svg width="${panelWidth}" height="${canvasHeight}">
          <style>
            @font-face {
              font-family: 'OpenSans';
              src: url('file://${fontFile}') format('truetype');
            }
          </style>
          <rect x="0" y="0" width="${panelWidth}" height="${canvasHeight}" fill="#f9f9f9"/>
          ${
            greetingLines.length > 0
              ? `
            <text
              x="${panelWidth / 2}"
              y="${greetingY}"
              font-family="'OpenSans', sans-serif"
              font-size="${greetingFontSize}"
              font-weight="bold"
              fill="${grayscale > 0 ? "#000000" : poemColor}"
              text-anchor="middle"
              dominant-baseline="hanging"
            >
              ${greetingLines
                .map(
                  (line, index) =>
                    `<tspan x="${panelWidth / 2}" dy="${
                      index === 0 ? 0 : lineHeight
                    }">${escapeXml(line)}</tspan>`
                )
                .join("")}
            </text>
          `
              : ""
          }
          ${
            poemLines.length > 0
              ? `
            <text
              x="${panelWidth / 2}"
              y="${poemY}"
              font-family="'OpenSans', sans-serif"
              font-size="${fontSize}"
              fill="${grayscale > 0 ? "#000000" : poemColor}"
              text-anchor="middle"
              dominant-baseline="hanging"
            >
              ${poemLines
                .map(
                  (line, index) =>
                    `<tspan x="${panelWidth / 2}" dy="${
                      index === 0 ? 0 : lineHeight
                    }">${escapeXml(line)}</tspan>`
                )
                .join("")}
            </text>
          `
              : ""
          }
        </svg>
      `;
      textBuffer = Buffer.from(textSvg);
    }

    const finalBuffer = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: mainImageBuffer, top: 0, left: 0 },
        ...(textBuffer
          ? [{ input: textBuffer, top: 0, left: panelWidth }]
          : []),
      ])
      .png()
      .toBuffer();

    const outputBuffer = await sharp(finalBuffer).png().toBuffer();
    const base64Image = `data:image/png;base64,${outputBuffer.toString(
      "base64"
    )}`;
    const watermarkedFilename = `card_${uuidv4()}_${imageFile.name}`;

    return NextResponse.json({
      success: true,
      image_data: base64Image,
      watermarked_filename: watermarkedFilename,
    });
  } catch (error) {
    console.error("Card processing error:", error);
    return NextResponse.json(
      {
        error: `An error occurred while processing the card: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
