// import { NextResponse } from "next/server";
// import sharp from "sharp";
// import { v4 as uuidv4 } from "uuid";

// const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);

// function allowedFile(filename) {
//   const ext = filename.split(".").pop()?.toLowerCase();
//   return ext && ALLOWED_EXTENSIONS.has(ext);
// }

// function escapeXml(unsafe) {
//   if (!unsafe) return "";
//   return unsafe
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&apos;");
// }

// function wrapText(text, maxCharsPerLine) {
//   // Split text on explicit newlines first
//   const segments = text
//     .split(/\n/)
//     .filter((segment) => segment.trim().length > 0);
//   const lines = [];

//   // Apply word-based wrapping to each segment
//   segments.forEach((segment) => {
//     const words = segment.split(/\s+/).filter((word) => word.length > 0);
//     let currentLine = "";
//     words.forEach((word) => {
//       if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
//         currentLine = (currentLine + " " + word).trim();
//       } else {
//         if (currentLine) lines.push(currentLine);
//         currentLine = word;
//       }
//     });
//     if (currentLine) lines.push(currentLine);
//   });

//   console.log("Line break analysis:", {
//     originalText: text,
//     maxCharsPerLine,
//     linesFound: lines.length,
//     lines,
//   });
//   return lines;
// }

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const imageFile = formData.get("image");
//     const watermarkText = formData.get("watermark_text");
//     const overlayImage = formData.get("overlay_image");
//     const watermarkX = parseInt(formData.get("watermark_x")) || 0;
//     const watermarkY = parseInt(formData.get("watermark_y")) || 0;
//     const watermarkSize = parseInt(formData.get("watermark_size")) || 30;
//     const watermarkColor = formData.get("watermark_color") || "#ffffff";
//     const borderWidth = parseInt(formData.get("border_width")) || 0;
//     const borderColor = formData.get("border_color") || "#000000";
//     const borderType = formData.get("border_type") || "solid";
//     const contrast = parseFloat(formData.get("contrast")) || 100;
//     const grayscale = parseFloat(formData.get("grayscale")) || 0;
//     const overlayCanvasX = parseFloat(formData.get("overlay_x")) || 0;
//     const overlayCanvasY = parseFloat(formData.get("overlay_y")) || 0;
//     const overlayWidth = parseInt(formData.get("overlay_width")) || 100;
//     const overlayOpacity = parseFloat(formData.get("overlay_opacity")) || 0.5;
//     const overlayBorderRadius =
//       parseInt(formData.get("overlay_border_radius")) || 0;

//     if (!imageFile || !allowedFile(imageFile.name)) {
//       return NextResponse.json(
//         { error: "Invalid or missing image file" },
//         { status: 400 }
//       );
//     }

//     const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
//     const canvasWidth = 525;
//     const canvasHeight = 744;

//     let sharpImage = sharp(imageBuffer).resize({
//       width: canvasWidth,
//       height: canvasHeight,
//       fit: "cover",
//       position: "center",
//       background: { r: 0, g: 0, b: 0, alpha: 0 },
//       withoutEnlargement: true,
//     });

//     let watermarkedBuffer = await sharpImage.toBuffer();
//     let metadata = await sharp(watermarkedBuffer).metadata();
//     let compositeOperations = [];

//     // Watermark text
//     if (watermarkText) {
//       const fontSize = Math.max(10, Math.min(watermarkSize, 100));
//       const padding = 60; // Increased padding to ensure text stays away from edges
//       const approxCharWidth = fontSize * 0.65; // More generous multiplier for Arial
//       const maxCharsPerLine = Math.floor(
//         (canvasWidth - padding * 2) / approxCharWidth
//       );
//       const textLines = wrapText(watermarkText, maxCharsPerLine);

//       console.log("Line break analysis:", {
//         originalText: watermarkText,
//         maxCharsPerLine,
//         linesFound: textLines.length,
//         lines: textLines,
//       });

//       const lineHeight = fontSize * 1.5; // Match frontend lineHeight: '1.5'
//       const totalHeight = lineHeight * textLines.length;

//       // Calculate maximum text width more accurately
//       const maxLineWidth = Math.max(
//         ...textLines.map((line) => line.length * approxCharWidth)
//       );
//       const textWidth = Math.min(maxLineWidth, canvasWidth - padding * 2);
//       const svgWidth = Math.ceil(textWidth + padding * 2); // Include padding in SVG width
//       const svgHeight = Math.ceil(totalHeight + fontSize * 0.5); // Extra space for descenders

//       const textSvg = `
//         <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
//           <text
//             x="${svgWidth / 2}"
//             y="${svgHeight / 2}"
//             font-family="Arial, sans-serif"
//             font-size="${fontSize}"
//             fill="${grayscale > 0 ? "#000000" : watermarkColor}"
//             text-anchor="middle"
//             dominant-baseline="middle"
//           >
//             ${textLines
//               .map(
//                 (line, index) =>
//                   `<tspan x="${svgWidth / 2}" dy="${
//                     index === 0
//                       ? (-(textLines.length - 1) * lineHeight) / 2
//                       : lineHeight
//                   }">${escapeXml(line)}</tspan>`
//               )
//               .join("")}
//           </text>
//         </svg>
//       `;
//       const textBuffer = Buffer.from(textSvg);

//       const finalTop = Math.max(
//         padding,
//         Math.min(watermarkY - svgHeight / 2, canvasHeight - svgHeight - padding)
//       );
//       const finalLeft = Math.max(
//         padding,
//         Math.min(watermarkX - svgWidth / 2, canvasWidth - svgWidth - padding)
//       );

//       console.log("Watermark text positioning:", {
//         watermarkX,
//         watermarkY,
//         finalTop,
//         finalLeft,
//         svgWidth,
//         svgHeight,
//         canvasWidth,
//         canvasHeight,
//       });

//       compositeOperations.push({
//         input: textBuffer,
//         top: Math.round(finalTop),
//         left: Math.round(finalLeft),
//         blend: "over",
//       });
//     }

//     // Overlay image
//     if (overlayImage && allowedFile(overlayImage.name)) {
//       console.log("Processing overlay image:", {
//         overlayX: overlayCanvasX,
//         overlayY: overlayCanvasY,
//         overlayWidth,
//         overlayOpacity,
//         overlayBorderRadius,
//       });

//       const overlayBuffer = Buffer.from(await overlayImage.arrayBuffer());
//       const targetOverlayWidth = Math.min(overlayWidth, canvasWidth);
//       const targetOverlayHeight = targetOverlayWidth; // 1:1 aspect ratio

//       let overlayResized = await sharp(overlayBuffer)
//         .resize({
//           width: targetOverlayWidth,
//           height: targetOverlayHeight,
//           fit: "fill",
//           background: { r: 0, g: 0, b: 0, alpha: 0 },
//         })
//         .png({ quality: 100 })
//         .toBuffer();

//       if (overlayBorderRadius > 0) {
//         const overlayMetadata = await sharp(overlayResized).metadata();
//         console.log("Applying overlay border radius:", {
//           overlayBorderRadius,
//           overlayWidth: overlayMetadata.width,
//           overlayHeight: overlayMetadata.height,
//         });
//         const maskSvg = `
//           <svg width="${overlayMetadata.width}" height="${overlayMetadata.height}" xmlns="http://www.w3.org/2000/svg">
//             <rect x="0" y="0" width="${overlayMetadata.width}" height="${overlayMetadata.height}"
//               rx="${overlayBorderRadius}" ry="${overlayBorderRadius}" fill="white"/>
//           </svg>
//         `;
//         const maskBuffer = Buffer.from(maskSvg);
//         overlayResized = await sharp(overlayResized)
//           .composite([{ input: maskBuffer, blend: "dest-in" }])
//           .png({ quality: 100 })
//           .toBuffer();
//       }

//       const overlayMetadata = await sharp(overlayResized).metadata();
//       const finalTop = overlayCanvasY - overlayMetadata.height / 2;
//       const finalLeft = overlayCanvasX - overlayMetadata.width / 2;

//       console.log("Overlay composite positioning:", {
//         overlayX: overlayCanvasX,
//         overlayY: overlayCanvasY,
//         finalTop,
//         finalLeft,
//         overlayWidth: overlayMetadata.width,
//         overlayHeight: overlayMetadata.height,
//         canvas: { width: canvasWidth, height: canvasHeight },
//       });

//       compositeOperations.push({
//         input: overlayResized,
//         top: Math.max(
//           0,
//           Math.min(Math.round(finalTop), canvasHeight - overlayMetadata.height)
//         ),
//         left: Math.max(
//           0,
//           Math.min(Math.round(finalLeft), canvasWidth - overlayMetadata.width)
//         ),
//         blend: "over",
//         opacity: overlayOpacity,
//       });
//     }

//     // Apply composites
//     if (compositeOperations.length > 0) {
//       watermarkedBuffer = await sharp(watermarkedBuffer)
//         .composite(compositeOperations)
//         .png()
//         .toBuffer();
//       metadata = await sharp(watermarkedBuffer).metadata();
//     }

//     // Border
//     if (borderWidth > 0) {
//       const borderSvg = `
//         <svg width="${metadata.width + borderWidth * 2}" height="${
//         metadata.height + borderWidth * 2
//       }">
//           <rect
//             x="0"
//             y="0"
//             width="${metadata.width + borderWidth * 2}"
//             height="${metadata.height + borderWidth * 2}"
//             fill="none"
//             stroke="${borderColor}"
//             stroke-width="${borderWidth * 2}"
//             stroke-dasharray="${
//               borderType === "dashed"
//                 ? "10,5"
//                 : borderType === "dotted"
//                 ? "2,2"
//                 : "none"
//             }"
//           />
//         </svg>
//       `;
//       const borderBuffer = Buffer.from(borderSvg);
//       watermarkedBuffer = await sharp({
//         create: {
//           width: metadata.width + borderWidth * 2,
//           height: metadata.height + borderWidth * 2,
//           channels: 4,
//           background: { r: 0, g: 0, b: 0, alpha: 0 },
//         },
//       })
//         .composite([
//           { input: watermarkedBuffer, top: borderWidth, left: borderWidth },
//           { input: borderBuffer, top: 0, left: 0 },
//         ])
//         .png({ quality: 100, compressionLevel: 0 })
//         .toBuffer();
//       metadata = await sharp(watermarkedBuffer).metadata();
//     }

//     // Contrast and grayscale
//     if (contrast !== 100 || grayscale > 0) {
//       let finalImage = sharp(watermarkedBuffer);
//       if (contrast !== 100) {
//         const contrastFactor = (contrast / 100) * 0.75 + 0.25;
//         finalImage = finalImage.linear(contrastFactor, 0);
//       }
//       if (grayscale > 0) {
//         finalImage = finalImage.grayscale();
//       }
//       watermarkedBuffer = await finalImage.toBuffer();
//     }

//     const outputBuffer = await sharp(watermarkedBuffer)
//       .png({ quality: 100 })
//       .toBuffer();

//     const base64Image = `data:image/png;base64,${outputBuffer.toString(
//       "base64"
//     )}`;
//     const watermarkedFilename = `card_${uuidv4()}_${imageFile.name}`;

//     return NextResponse.json({
//       success: true,
//       image_data: base64Image,
//       watermarked_filename: watermarkedFilename,
//     });
//   } catch (error) {
//     console.error("Card processing error:", error);
//     return NextResponse.json(
//       {
//         error:
//           "An error occurred while processing the card: Failed to process.",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

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
    process.env.FONTCONFIG_PATH = "/var/task/.next/static/fonts";
    process.env.FONTCONFIG_FILE = "/var/task/.next/static/fonts/fonts.conf";
    console.log("Fontconfig paths:", {
      FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
      FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
    });

    const formData = await request.formData();
    const imageFile = formData.get("image");
    const watermarkText = formData.get("watermark_text");
    const overlayImage = formData.get("overlay_image");
    const watermarkX = parseInt(formData.get("watermark_x")) || 0;
    const watermarkY = parseInt(formData.get("watermark_y")) || 0;
    const watermarkSize = parseInt(formData.get("watermark_size")) || 30;
    const watermarkColor = formData.get("watermark_color") || "#ffffff";
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

    console.log("Received inputs:", {
      imageFile: { exists: !!imageFile, name: imageFile?.name },
      watermarkText,
      overlayImage: { exists: !!overlayImage, name: overlayImage?.name },
    });

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
    const canvasWidth = 525;
    const canvasHeight = 744;

    let sharpImage = sharp(imageBuffer).resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: "cover",
      position: "center",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true,
    });

    let watermarkedBuffer = await sharpImage.toBuffer();
    let metadata = await sharp(watermarkedBuffer).metadata();
    let compositeOperations = [];

    // Watermark text
    if (watermarkText) {
      const fontSize = Math.max(10, Math.min(watermarkSize, 100));
      const padding = 60;
      const approxCharWidth = fontSize * 0.65;
      const maxCharsPerLine = Math.floor(
        (canvasWidth - padding * 2) / approxCharWidth
      );
      const textLines = wrapText(watermarkText, maxCharsPerLine);

      const lineHeight = fontSize * 1.5;
      const totalHeight = lineHeight * textLines.length;
      const maxLineWidth = Math.max(
        ...textLines.map((line) => line.length * approxCharWidth)
      );
      const textWidth = Math.min(maxLineWidth, canvasWidth - padding * 2);
      const svgWidth = Math.ceil(textWidth + padding * 2);
      const svgHeight = Math.ceil(totalHeight + fontSize * 0.5);

      const textSvg = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
          <style>
            @font-face {
              font-family: 'OpenSans';
              src: url('/var/task/.next/static/fonts/OpenSans-Regular.ttf') format('truetype');
            }
          </style>
          <text
            x="${svgWidth / 2}"
            y="${svgHeight / 2}"
            font-family="'OpenSans', sans-serif"
            font-size="${fontSize}"
            fill="${grayscale > 0 ? "#000000" : watermarkColor}"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            ${textLines
              .map(
                (line, index) =>
                  `<tspan x="${svgWidth / 2}" dy="${
                    index === 0
                      ? (-(textLines.length - 1) * lineHeight) / 2
                      : lineHeight
                  }">${escapeXml(line)}</tspan>`
              )
              .join("")}
          </text>
        </svg>
      `;
      const textBuffer = Buffer.from(textSvg);

      const finalTop = Math.max(
        padding,
        Math.min(watermarkY - svgHeight / 2, canvasHeight - svgHeight - padding)
      );
      const finalLeft = Math.max(
        padding,
        Math.min(watermarkX - svgWidth / 2, canvasWidth - svgWidth - padding)
      );

      compositeOperations.push({
        input: textBuffer,
        top: Math.round(finalTop),
        left: Math.round(finalLeft),
        blend: "over",
      });
    }

    // Overlay image
    if (
      overlayImage &&
      overlayImage instanceof File &&
      allowedFile(overlayImage.name)
    ) {
      const overlayBuffer = Buffer.from(await overlayImage.arrayBuffer());
      let overlayMetadata = await sharp(overlayBuffer).metadata();
      const aspectRatio = overlayMetadata.width / overlayMetadata.height;
      let targetOverlayWidth = Math.min(overlayWidth, canvasWidth);
      let targetOverlayHeight = Math.round(targetOverlayWidth / aspectRatio);

      if (
        targetOverlayWidth > canvasWidth ||
        targetOverlayHeight > canvasHeight
      ) {
        const scale = Math.min(
          canvasWidth / targetOverlayWidth,
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
        .toFormat(overlayMetadata.format)
        .toBuffer();

      if (overlayBorderRadius > 0) {
        const overlayMetadataResized = await sharp(overlayResized).metadata();
        const maskSvg = `
          <svg width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}"
              rx="${overlayBorderRadius}" ry="${overlayBorderRadius}" fill="white"/>
          </svg>
        `;
        const maskBuffer = Buffer.from(maskSvg);
        overlayResized = await sharp(overlayResized)
          .composite([{ input: maskBuffer, blend: "dest-in" }])
          .toFormat(overlayMetadata.format)
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
          Math.min(finalLeft, canvasWidth - overlayMetadataResized.width)
        ),
        blend: "over",
        opacity: overlayOpacity,
      });
    }

    // Apply composites
    if (compositeOperations.length > 0) {
      watermarkedBuffer = await sharp(watermarkedBuffer)
        .composite(compositeOperations)
        .toBuffer();
    }

    // Border
    if (borderWidth > 0) {
      const borderSvg = `
        <svg width="${canvasWidth}" height="${canvasHeight}">
          <rect
            x="${borderWidth / 2}"
            y="${borderWidth / 2}"
            width="${canvasWidth - borderWidth}"
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
      watermarkedBuffer = await sharp(watermarkedBuffer)
        .composite([{ input: Buffer.from(borderSvg), top: 0, left: 0 }])
        .png()
        .toBuffer();
    }

    // Contrast and grayscale
    if (contrast !== 100 || grayscale > 0) {
      let finalImage = sharp(watermarkedBuffer);
      if (contrast !== 100) {
        finalImage = finalImage.linear((contrast / 100) * 0.75 + 0.25, 0);
      }
      if (grayscale > 0) {
        finalImage = finalImage.grayscale();
      }
      watermarkedBuffer = await finalImage.toBuffer();
    }

    const outputBuffer = await sharp(watermarkedBuffer).png().toBuffer();
    const base64Image = `data:image/png;base64,${outputBuffer.toString(
      "base64"
    )}`;
    const watermarkedFilename = `watermarked_${uuidv4()}_${imageFile.name}`;

    return NextResponse.json({
      success: true,
      image_data: base64Image,
      watermarked_filename: watermarkedFilename,
    });
  } catch (error) {
    console.error("Watermark processing error:", error);
    return NextResponse.json(
      {
        error: `An error occurred while processing the watermark: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
