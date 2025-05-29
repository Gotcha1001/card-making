// import { NextResponse } from "next/server";
// import sharp from "sharp";
// import { v4 as uuidv4 } from "uuid";

// const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);

// function allowedFile(filename) {
//   if (!filename || typeof filename !== "string") {
//     console.warn("Invalid filename:", filename);
//     return false;
//   }
//   const ext = filename.split(".").pop()?.toLowerCase();
//   return ext && ALLOWED_EXTENSIONS.has(ext);
// }

// function escapeXml(unsafe) {
//   if (!unsafe) return "";
//   return unsafe
//     .replace(/&/g, "&")
//     .replace(/</g, "<")
//     .replace(/>/g, ">")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

// function wrapText(text, maxCharsPerLine) {
//   const segments = text
//     .split(/\n/)
//     .filter((segment) => segment.trim().length > 0);
//   const lines = [];
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
//     const overlayImage = formData.get("overlay_image"); // Get single overlay image
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
//     const poem = formData.get("poem") || "";
//     const greeting = formData.get("greeting") || "";
//     const poemFontSize = parseInt(formData.get("poem_font_size")) || 24;
//     const poemColor = formData.get("poem_color") || "#333333";
//     const occasion = formData.get("occasion") || "card";

//     // Log received files and text
//     console.log("Received imageFile:", {
//       exists: !!imageFile,
//       isFile: imageFile instanceof File,
//       name: imageFile?.name,
//       type: imageFile?.type,
//       size: imageFile?.size,
//     });
//     console.log("Received overlayImage:", {
//       exists: !!overlayImage,
//       isFile: overlayImage instanceof File,
//       name: overlayImage?.name,
//       type: overlayImage?.type,
//       size: overlayImage?.size,
//     });
//     console.log("Received text fields:", {
//       poem,
//       greeting,
//       poemFontSize,
//       poemColor,
//     });

//     // Validate image file
//     if (
//       !imageFile ||
//       !(imageFile instanceof File) ||
//       !allowedFile(imageFile.name)
//     ) {
//       console.error("Invalid image file:", { imageFile });
//       return NextResponse.json(
//         { error: "Invalid or missing image file" },
//         { status: 400 }
//       );
//     }

//     const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
//     console.log("Image buffer size:", imageBuffer.length);
//     const panelWidth = 525;
//     const canvasWidth = 1050; // Two panels side-by-side

//     let sharpImage = sharp(imageBuffer);
//     let metadata = await sharpImage.metadata();
//     console.log("Main Image metadata:", metadata);

//     // Calculate text panel height first to determine canvas height
//     let canvasHeight = 744; // Default height
//     let textBuffer = null;
//     if (poem || greeting) {
//       console.log("Calculating text panel height...");
//       const padding = 40;
//       let fontSize = Math.max(10, Math.min(poemFontSize, 60));
//       const greetingFontSize = fontSize * 1.2;
//       const approxCharWidth = fontSize * 0.6;
//       const maxCharsPerLine = Math.floor(
//         (panelWidth - padding * 2) / approxCharWidth
//       );
//       const lineHeight = fontSize * 1.5;

//       const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
//       const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

//       // Calculate required text height
//       const greetingHeight = greetingLines.length * lineHeight;
//       const poemHeight = poemLines.length * lineHeight;
//       const greetingY = padding;
//       const poemY =
//         greetingLines.length > 0
//           ? padding + greetingHeight + greetingFontSize
//           : padding;
//       const totalTextHeight = poemY + poemHeight + padding; // Bottom padding

//       console.log("Text panel height calculation:", {
//         greetingLines: greetingLines.length,
//         poemLines: poemLines.length,
//         greetingHeight,
//         poemHeight,
//         greetingY,
//         poemY,
//         totalTextHeight,
//       });

//       // Set canvas height to accommodate text
//       canvasHeight = Math.ceil(Math.max(744, totalTextHeight));
//       console.log("Set canvas height:", canvasHeight);
//     }

//     // Resize main image to match canvas height exactly
//     sharpImage = sharpImage.resize({
//       width: panelWidth,
//       height: canvasHeight,
//       fit: "fill",
//       position: "center",
//       background: { r: 255, g: 255, b: 255, alpha: 1 },
//       withoutEnlargement: false,
//     });

//     let mainImageBuffer = await sharpImage.toBuffer();
//     metadata = await sharp(mainImageBuffer).metadata();

//     // If the image is significantly smaller than the canvas, try to fill the space better
//     if (
//       metadata.width < panelWidth * 0.9 ||
//       metadata.height < canvasHeight * 0.9
//     ) {
//       console.log(
//         "Image is smaller than expected, adjusting resize parameters..."
//       );
//       // Calculate the aspect ratio of the original image
//       const originalMetadata = await sharp(imageBuffer).metadata();
//       const aspectRatio = originalMetadata.width / originalMetadata.height;

//       // Calculate new dimensions to fill width while maintaining aspect ratio
//       const newWidth = panelWidth;
//       const newHeight = Math.round(newWidth / aspectRatio);

//       sharpImage = sharp(imageBuffer).resize({
//         width: newWidth,
//         height: newHeight,
//         fit: "fill",
//         position: "center",
//         background: { r: 255, g: 255, b: 255, alpha: 1 },
//         withoutEnlargement: false,
//       });
//       mainImageBuffer = await sharpImage.toBuffer();
//     }

//     let mainImageHeight = metadata.height; // Should exactly match canvasHeight

//     let compositeOperations = [];

//     // Overlay image
//     if (
//       overlayImage &&
//       overlayImage instanceof File &&
//       allowedFile(overlayImage.name) &&
//       !imageFile.name.includes("watermarked") // Skip overlay processing for already watermarked images
//     ) {
//       console.log("Processing overlay image:", {
//         overlayX: overlayCanvasX,
//         overlayY: overlayCanvasY,
//         overlayWidth,
//         overlayOpacity,
//         overlayBorderRadius,
//       });

//       const overlayBuffer = Buffer.from(await overlayImage.arrayBuffer());
//       console.log("Overlay buffer size:", overlayBuffer.length);

//       try {
//         let overlayMetadata = await sharp(overlayBuffer).metadata();
//         console.log("Overlay Image metadata:", overlayMetadata);

//         // Preserve aspect ratio
//         const aspectRatio = overlayMetadata.width / overlayMetadata.height;
//         let targetOverlayWidth = Math.min(overlayWidth, panelWidth);
//         let targetOverlayHeight = Math.round(targetOverlayWidth / aspectRatio);

//         // Ensure overlay fits within main image
//         if (
//           targetOverlayWidth > panelWidth ||
//           targetOverlayHeight > mainImageHeight
//         ) {
//           const scale = Math.min(
//             panelWidth / targetOverlayWidth,
//             mainImageHeight / targetOverlayHeight
//           );
//           targetOverlayWidth = Math.round(targetOverlayWidth * scale);
//           targetOverlayHeight = Math.round(targetOverlayHeight * scale);
//           console.log("Scaled down overlay to fit main image:", {
//             targetOverlayWidth,
//             targetOverlayHeight,
//           });
//         }

//         let overlayResized = await sharp(overlayBuffer)
//           .resize({
//             width: targetOverlayWidth,
//             height: targetOverlayHeight,
//             fit: "contain",
//             background: { r: 0, g: 0, b: 0, alpha: 0 },
//           })
//           .toFormat(overlayMetadata.format)
//           .toBuffer();

//         if (overlayBorderRadius > 0) {
//           console.log("Applying border radius to overlay...");
//           const overlayMetadataResized = await sharp(overlayResized).metadata();
//           console.log(
//             "Overlay resized metadata for mask:",
//             overlayMetadataResized
//           );
//           const maskSvg = `
//             <svg width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}" xmlns="http://www.w3.org/2000/svg">
//               <rect x="0" y="0" width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}"
//                 rx="${overlayBorderRadius}" ry="${overlayBorderRadius}" fill="white"/>
//             </svg>
//           `;
//           const maskBuffer = Buffer.from(maskSvg);
//           overlayResized = await sharp(overlayResized)
//             .composite([{ input: maskBuffer, blend: "dest-in" }])
//             .toFormat(overlayMetadata.format)
//             .toBuffer();
//           console.log("Applied border radius mask to overlay");
//         }

//         const overlayMetadataResized = await sharp(overlayResized).metadata();
//         console.log("Final overlay resized metadata:", overlayMetadataResized);
//         const finalTop = Math.round(
//           overlayCanvasY - overlayMetadataResized.height / 2
//         );
//         const finalLeft = Math.round(
//           overlayCanvasX - overlayMetadataResized.width / 2
//         );

//         compositeOperations.push({
//           input: overlayResized,
//           top: Math.max(
//             0,
//             Math.min(finalTop, mainImageHeight - overlayMetadataResized.height)
//           ),
//           left: Math.max(
//             0,
//             Math.min(finalLeft, panelWidth - overlayMetadataResized.width)
//           ),
//           blend: "over",
//           opacity: overlayOpacity,
//         });
//         console.log("Added overlay to compositeOperations:", {
//           top: finalTop,
//           left: finalLeft,
//           width: overlayMetadataResized.width,
//           height: overlayMetadataResized.height,
//           opacity: overlayOpacity,
//         });
//       } catch (overlayError) {
//         console.error(
//           "Overlay processing error, continuing without overlay:",
//           overlayError
//         );
//       }
//     }

//     // Log composite operations
//     console.log("Composite operations to apply:", {
//       count: compositeOperations.length,
//       operations: compositeOperations.map((op) => ({
//         top: op.top,
//         left: op.left,
//         opacity: op.opacity,
//       })),
//     });

//     // Apply composites to main image
//     if (compositeOperations.length > 0) {
//       console.log("Applying composite operations to main image...");
//       mainImageBuffer = await sharp(mainImageBuffer)
//         .composite(compositeOperations)
//         .toBuffer();
//     }

//     // Border for main image
//     if (borderWidth > 0) {
//       console.log("Applying border to main image...");
//       const borderSvg = `
//         <svg width="${panelWidth}" height="${mainImageHeight}">
//           <rect
//             x="${borderWidth / 2}"
//             y="${borderWidth / 2}"
//             width="${panelWidth - borderWidth}"
//             height="${mainImageHeight - borderWidth}"
//             fill="none"
//             stroke="${borderColor}"
//             stroke-width="${borderWidth}"
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
//       mainImageBuffer = await sharp(mainImageBuffer)
//         .composite([{ input: borderBuffer, top: 0, left: 0 }])
//         .png()
//         .toBuffer();
//       metadata = await sharp(mainImageBuffer).metadata();
//       console.log("Main Image with Border metadata:", metadata);
//     }

//     // Contrast and grayscale for main image
//     if (contrast !== 100 || grayscale > 0) {
//       console.log("Applying contrast and grayscale to main image...");
//       let finalImage = sharp(mainImageBuffer);
//       if (contrast !== 100) {
//         const contrastFactor = (contrast / 100) * 0.75 + 0.25;
//         finalImage = finalImage.linear(contrastFactor, 0);
//       }
//       if (grayscale > 0) {
//         finalImage = finalImage.grayscale();
//       }
//       mainImageBuffer = await finalImage.toBuffer();
//     }

//     // Create text panel
//     if (poem || greeting) {
//       console.log("Creating text panel...");
//       const padding = 40;
//       let fontSize = Math.max(10, Math.min(poemFontSize, 60));
//       const greetingFontSize = fontSize * 1.2;
//       const approxCharWidth = fontSize * 0.6;
//       const maxCharsPerLine = Math.floor(
//         (panelWidth - padding * 2) / approxCharWidth
//       );
//       const lineHeight = fontSize * 1.5;

//       const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
//       const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

//       const greetingY = padding;
//       const poemY =
//         greetingLines.length > 0
//           ? padding + greetingLines.length * lineHeight + greetingFontSize
//           : padding;

//       const textSvg = `
//         <svg width="${panelWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
//           <rect x="0" y="0" width="${panelWidth}" height="${canvasHeight}" fill="#f9f9f9"/>
//           ${
//             greetingLines.length > 0
//               ? `
//             <text
//               x="${panelWidth / 2}"
//               y="${greetingY}"
//               font-family="Arial, sans-serif"
//               font-size="${greetingFontSize}"
//               font-weight="bold"
//               fill="${grayscale > 0 ? "#000000" : poemColor}"
//               text-anchor="middle"
//               dominant-baseline="hanging"
//             >
//               ${greetingLines
//                 .map(
//                   (line, index) =>
//                     `<tspan x="${panelWidth / 2}" dy="${
//                       index === 0 ? 0 : lineHeight
//                     }">${escapeXml(line)}</tspan>`
//                 )
//                 .join("")}
//             </text>
//           `
//               : ""
//           }
//           ${
//             poemLines.length > 0
//               ? `
//             <text
//               x="${panelWidth / 2}"
//               y="${poemY}"
//               font-family="Arial, sans-serif"
//               font-size="${fontSize}"
//               fill="${grayscale > 0 ? "#000000" : poemColor}"
//               text-anchor="middle"
//               dominant-baseline="hanging"
//             >
//               ${poemLines
//                 .map(
//                   (line, index) =>
//                     `<tspan x="${panelWidth / 2}" dy="${
//                       index === 0 ? 0 : lineHeight
//                     }">${escapeXml(line)}</tspan>`
//                 )
//                 .join("")}
//             </text>
//           `
//               : ""
//           }
//         </svg>
//       `;
//       console.log("Generated textSvg:", textSvg);
//       try {
//         await sharp(Buffer.from(textSvg)).metadata();
//       } catch (svgError) {
//         console.error("Invalid SVG:", svgError);
//         throw new Error(`Invalid SVG content: ${svgError.message}`);
//       }
//       textBuffer = Buffer.from(textSvg);
//     }

//     // Combine main image and text panel
//     console.log("Creating final composite image...");
//     let finalBuffer = await sharp({
//       create: {
//         width: canvasWidth,
//         height: canvasHeight,
//         channels: 4,
//         background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
//       },
//     })
//       .composite([
//         { input: mainImageBuffer, top: 0, left: 0 },
//         ...(textBuffer
//           ? [{ input: textBuffer, top: 0, left: panelWidth }]
//           : []),
//       ])
//       .png()
//       .toBuffer();

//     metadata = await sharp(finalBuffer).metadata();
//     console.log("Final Image metadata:", metadata);

//     // Determine output format
//     const outputFormat = metadata.format || "png";
//     console.log("Output format:", outputFormat);
//     const outputBuffer = await sharp(finalBuffer)
//       .toFormat(outputFormat)
//       .toBuffer();
//     const base64Image = outputBuffer.toString("base64");
//     const watermarkedFilename = `card_${uuidv4()}_${imageFile.name}`;

//     return NextResponse.json({
//       success: true,
//       image_data: `data:image/${outputFormat};base64,${base64Image}`,
//       watermarked_filename: watermarkedFilename,
//     });
//   } catch (error) {
//     console.error("Card processing error:", error);
//     return NextResponse.json(
//       {
//         error: `An error occurred while processing the card: ${error.message}`,
//       },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import sharp from "sharp";
// import { v4 as uuidv4 } from "uuid";

// const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);

// function allowedFile(filename) {
//   if (!filename || typeof filename !== "string") {
//     console.warn("Invalid filename:", filename);
//     return false;
//   }
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
//   const segments = text
//     .split(/\n/)
//     .filter((segment) => segment.trim().length > 0);
//   const lines = [];
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

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     },
//   });
// }

// export async function POST(request) {
//   try {
//     process.env.FONTCONFIG_PATH = "/var/task/.next/static/fonts";
//     process.env.FONTCONFIG_FILE = "/var/task/.next/static/fonts/fonts.conf";
//     console.log("Fontconfig paths:", {
//       FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
//       FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
//     });

//     const formData = await request.formData();
//     const imageFile = formData.get("image");
//     const overlayImage = formData.get("overlay_image");
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
//     const poem = formData.get("poem") || "";
//     const greeting = formData.get("greeting") || "";
//     const poemFontSize = parseInt(formData.get("poem_font_size")) || 24;
//     const poemColor = formData.get("poem_color") || "#333333";
//     const occasion = formData.get("occasion") || "card";

//     console.log("Received inputs:", {
//       imageFile: { exists: !!imageFile, name: imageFile?.name },
//       overlayImage: { exists: !!overlayImage, name: overlayImage?.name },
//       poem,
//       greeting,
//     });

//     if (
//       !imageFile ||
//       !(imageFile instanceof File) ||
//       !allowedFile(imageFile.name)
//     ) {
//       console.error("Invalid image file:", { imageFile });
//       return NextResponse.json(
//         { error: "Invalid or missing image file" },
//         { status: 400 }
//       );
//     }

//     const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
//     const panelWidth = 525;
//     const canvasWidth = 1050;
//     let canvasHeight = 744;

//     let sharpImage = sharp(imageBuffer);
//     let metadata = await sharpImage.metadata();
//     console.log("Main Image metadata:", metadata);

//     // Calculate text panel height
//     let textBuffer = null;
//     if (poem || greeting) {
//       const padding = 40;
//       let fontSize = Math.max(10, Math.min(poemFontSize, 60));
//       const greetingFontSize = fontSize * 1.2;
//       const approxCharWidth = fontSize * 0.6;
//       const maxCharsPerLine = Math.floor(
//         (panelWidth - padding * 2) / approxCharWidth
//       );
//       const lineHeight = fontSize * 1.5;

//       const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
//       const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

//       const greetingHeight = greetingLines.length * lineHeight;
//       const poemHeight = poemLines.length * lineHeight;
//       const greetingY = padding;
//       const poemY =
//         greetingLines.length > 0
//           ? padding + greetingHeight + greetingFontSize
//           : padding;
//       const totalTextHeight = poemY + poemHeight + padding;

//       canvasHeight = Math.ceil(Math.max(744, totalTextHeight));
//       console.log("Text panel height:", {
//         canvasHeight,
//         greetingLines,
//         poemLines,
//       });
//     }

//     // Resize main image
//     const originalMetadata = await sharp(imageBuffer).metadata();
//     const aspectRatio = originalMetadata.width / originalMetadata.height;
//     const targetWidth = panelWidth;
//     const targetHeight = Math.round(targetWidth / aspectRatio);

//     sharpImage = sharpImage.resize({
//       width: targetWidth,
//       height: targetHeight,
//       fit: "fill",
//       position: "center",
//       background: { r: 255, g: 255, b: 255, alpha: 1 },
//       withoutEnlargement: false,
//     });

//     let mainImageBuffer = await sharpImage.toBuffer();
//     metadata = await sharp(mainImageBuffer).metadata();

//     if (metadata.height < canvasHeight) {
//       const extendHeight = canvasHeight - metadata.height;
//       const extendTop = Math.floor(extendHeight / 2);
//       const extendBottom = extendHeight - extendTop;
//       mainImageBuffer = await sharp(mainImageBuffer)
//         .extend({
//           top: extendTop,
//           bottom: extendBottom,
//           left: 0,
//           right: 0,
//           background: { r: 255, g: 255, b: 255, alpha: 1 },
//         })
//         .toBuffer();
//     }

//     let mainImageHeight = canvasHeight;
//     let compositeOperations = [];

//     // Overlay image
//     if (
//       overlayImage &&
//       overlayImage instanceof File &&
//       allowedFile(overlayImage.name) &&
//       !imageFile.name.includes("watermarked")
//     ) {
//       const overlayBuffer = Buffer.from(await overlayImage.arrayBuffer());
//       let overlayMetadata = await sharp(overlayBuffer).metadata();
//       const aspectRatio = overlayMetadata.width / overlayMetadata.height;
//       let targetOverlayWidth = Math.min(overlayWidth, panelWidth);
//       let targetOverlayHeight = Math.round(targetOverlayWidth / aspectRatio);

//       if (
//         targetOverlayWidth > panelWidth ||
//         targetOverlayHeight > mainImageHeight
//       ) {
//         const scale = Math.min(
//           panelWidth / targetOverlayWidth,
//           mainImageHeight / targetOverlayHeight
//         );
//         targetOverlayWidth = Math.round(targetOverlayWidth * scale);
//         targetOverlayHeight = Math.round(targetOverlayHeight * scale);
//       }

//       let overlayResized = await sharp(overlayBuffer)
//         .resize({
//           width: targetOverlayWidth,
//           height: targetOverlayHeight,
//           fit: "contain",
//           background: { r: 0, g: 0, b: 0, alpha: 0 },
//         })
//         .toFormat(overlayMetadata.format)
//         .toBuffer();

//       if (overlayBorderRadius > 0) {
//         const overlayMetadataResized = await sharp(overlayResized).metadata();
//         const maskSvg = `
//           <svg width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}" xmlns="http://www.w3.org/2000/svg">
//             <rect x="0" y="0" width="${overlayMetadataResized.width}" height="${overlayMetadataResized.height}"
//               rx="${overlayBorderRadius}" ry="${overlayBorderRadius}" fill="white"/>
//           </svg>
//         `;
//         const maskBuffer = Buffer.from(maskSvg);
//         overlayResized = await sharp(overlayResized)
//           .composite([{ input: maskBuffer, blend: "dest-in" }])
//           .toFormat(overlayMetadata.format)
//           .toBuffer();
//       }

//       const overlayMetadataResized = await sharp(overlayResized).metadata();
//       const finalTop = Math.round(
//         overlayCanvasY - overlayMetadataResized.height / 2
//       );
//       const finalLeft = Math.round(
//         overlayCanvasX - overlayMetadataResized.width / 2
//       );

//       compositeOperations.push({
//         input: overlayResized,
//         top: Math.max(
//           0,
//           Math.min(finalTop, mainImageHeight - overlayMetadataResized.height)
//         ),
//         left: Math.max(
//           0,
//           Math.min(finalLeft, panelWidth - overlayMetadataResized.width)
//         ),
//         blend: "over",
//         opacity: overlayOpacity,
//       });
//     }

//     // Apply composites
//     if (compositeOperations.length > 0) {
//       mainImageBuffer = await sharp(mainImageBuffer)
//         .composite(compositeOperations)
//         .toBuffer();
//     }

//     // Border
//     if (borderWidth > 0) {
//       const borderSvg = `
//         <svg width="${panelWidth}" height="${mainImageHeight}">
//           <rect
//             x="${borderWidth / 2}"
//             y="${borderWidth / 2}"
//             width="${panelWidth - borderWidth}"
//             height="${mainImageHeight - borderWidth}"
//             fill="none"
//             stroke="${borderColor}"
//             stroke-width="${borderWidth}"
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
//       mainImageBuffer = await sharp(mainImageBuffer)
//         .composite([{ input: Buffer.from(borderSvg), top: 0, left: 0 }])
//         .png()
//         .toBuffer();
//     }

//     // Contrast and grayscale
//     if (contrast !== 100 || grayscale > 0) {
//       let finalImage = sharp(mainImageBuffer);
//       if (contrast !== 100) {
//         finalImage = finalImage.linear((contrast / 100) * 0.75 + 0.25, 0);
//       }
//       if (grayscale > 0) {
//         finalImage = finalImage.grayscale();
//       }
//       mainImageBuffer = await finalImage.toBuffer();
//     }

//     // Text panel for poem and greeting
//     if (poem || greeting) {
//       const padding = 40;
//       let fontSize = Math.max(10, Math.min(poemFontSize, 60));
//       const greetingFontSize = fontSize * 1.2;
//       const approxCharWidth = fontSize * 0.6;
//       const maxCharsPerLine = Math.floor(
//         (panelWidth - padding * 2) / approxCharWidth
//       );
//       const lineHeight = fontSize * 1.5;

//       const greetingLines = greeting ? wrapText(greeting, maxCharsPerLine) : [];
//       const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

//       const greetingY = padding;
//       const poemY =
//         greetingLines.length > 0
//           ? padding + greetingLines.length * lineHeight + greetingFontSize
//           : padding;

//       const textSvg = `
//         <svg width="${panelWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
//           <style>
//             @font-face {
//               font-family: 'OpenSans';
//               src: url('/var/task/.next/static/fonts/OpenSans-Regular.ttf') format('truetype');
//             }
//           </style>
//           <rect x="0" y="0" width="${panelWidth}" height="${canvasHeight}" fill="#f9f9f9"/>
//           ${
//             greetingLines.length > 0
//               ? `
//             <text
//               x="${panelWidth / 2}"
//               y="${greetingY}"
//               font-family="'OpenSans', sans-serif"
//               font-size="${greetingFontSize}"
//               font-weight="bold"
//               fill="${grayscale > 0 ? "#000000" : poemColor}"
//               text-anchor="middle"
//               dominant-baseline="hanging"
//             >
//               ${greetingLines
//                 .map(
//                   (line, index) =>
//                     `<tspan x="${panelWidth / 2}" dy="${
//                       index === 0 ? 0 : lineHeight
//                     }">${escapeXml(line)}</tspan>`
//                 )
//                 .join("")}
//             </text>
//           `
//               : ""
//           }
//           ${
//             poemLines.length > 0
//               ? `
//             <text
//               x="${panelWidth / 2}"
//               y="${poemY}"
//               font-family="'OpenSans', sans-serif"
//               font-size="${fontSize}"
//               fill="${grayscale > 0 ? "#000000" : poemColor}"
//               text-anchor="middle"
//               dominant-baseline="hanging"
//             >
//               ${poemLines
//                 .map(
//                   (line, index) =>
//                     `<tspan x="${panelWidth / 2}" dy="${
//                       index === 0 ? 0 : lineHeight
//                     }">${escapeXml(line)}</tspan>`
//                 )
//                 .join("")}
//             </text>
//           `
//               : ""
//           }
//         </svg>
//       `;
//       textBuffer = Buffer.from(textSvg);
//     }

//     // Final composite
//     let finalBuffer = await sharp({
//       create: {
//         width: canvasWidth,
//         height: canvasHeight,
//         channels: 4,
//         background: { r: 255, g: 255, b: 255, alpha: 1 },
//       },
//     })
//       .composite([
//         { input: mainImageBuffer, top: 0, left: 0 },
//         ...(textBuffer
//           ? [{ input: textBuffer, top: 0, left: panelWidth }]
//           : []),
//       ])
//       .png()
//       .toBuffer();

//     const outputBuffer = await sharp(finalBuffer).png().toBuffer();
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
//         error: `An error occurred while processing the card: ${error.message}`,
//       },
//       { status: 500 }
//     );
//   }
// }
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

    // Verify font files exist
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

    console.log("Received inputs:", {
      imageFile: { exists: !!imageFile, name: imageFile?.name },
      overlayImage: { exists: !!overlayImage, name: overlayImage?.name },
      poem,
      greeting,
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
    const panelWidth = 525;
    const canvasWidth = 1050;
    let canvasHeight = 744;

    let sharpImage = sharp(imageBuffer);
    let metadata = await sharpImage.metadata();
    console.log("Main Image metadata:", metadata);

    // Calculate text panel height
    let textBuffer = null;
    if (poem || greeting) {
      const padding = 40;
      let fontSize = Math.max(10, Math.min(poemFontSize, 60));
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
      console.log("Text panel height:", {
        canvasHeight,
        greetingLines,
        poemLines,
      });
    }

    // Resize main image
    const originalMetadata = await sharp(imageBuffer).metadata();
    const aspectRatio = originalMetadata.width / originalMetadata.height;
    const targetWidth = panelWidth;
    const targetHeight = Math.round(targetWidth / aspectRatio);

    sharpImage = sharpImage.resize({
      width: targetWidth,
      height: targetHeight,
      fit: "fill",
      position: "center",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false,
    });

    let mainImageBuffer = await sharpImage.toBuffer();
    metadata = await sharp(mainImageBuffer).metadata();

    if (metadata.height < canvasHeight) {
      const extendHeight = canvasHeight - metadata.height;
      const extendTop = Math.floor(extendHeight / 2);
      const extendBottom = extendHeight - extendTop;
      mainImageBuffer = await sharp(mainImageBuffer)
        .extend({
          top: extendTop,
          bottom: extendBottom,
          left: 0,
          right: 0,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
    }

    let mainImageHeight = canvasHeight;
    let compositeOperations = [];

    // Overlay image
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
        targetOverlayHeight > mainImageHeight
      ) {
        const scale = Math.min(
          panelWidth / targetOverlayWidth,
          mainImageHeight / targetOverlayHeight
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
          Math.min(finalTop, mainImageHeight - overlayMetadataResized.height)
        ),
        left: Math.max(
          0,
          Math.min(finalLeft, panelWidth - overlayMetadataResized.width)
        ),
        blend: "over",
        opacity: overlayOpacity,
      });
    }

    // Apply composites
    if (compositeOperations.length > 0) {
      mainImageBuffer = await sharp(mainImageBuffer)
        .composite(compositeOperations)
        .toBuffer();
    }

    // Border
    if (borderWidth > 0) {
      const borderSvg = `
        <svg width="${panelWidth}" height="${mainImageHeight}">
          <rect
            x="${borderWidth / 2}"
            y="${borderWidth / 2}"
            width="${panelWidth - borderWidth}"
            height="${mainImageHeight - borderWidth}"
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

    // Contrast and grayscale
    if (contrast !== 100 || grayscale > 0) {
      let finalImage = sharp(mainImageBuffer);
      if (contrast !== 100) {
        finalImage = finalImage.linear((contrast / 100) * 0.75 + 0.25, 0);
      }
      if (grayscale > 0) {
        finalImage = finalImage.grayscale();
      }
      mainImageBuffer = await finalImage.toBuffer();
    }

    // Text panel for poem and greeting
    if (poem || greeting) {
      const padding = 60;
      let fontSize = Math.max(10, Math.min(60, poemFontSize));
      const greetingFontSize = fontSize * 1.2;
      const approxCharWidth = fontSize * 0.65;
      const maxCharsPerLine = Math.floor(
        (panelWidth - 2 * padding) / approxCharWidth
      );
      const lineHeight = fontSize * 1.5;

      const greetingLines = poem ? wrapText(greeting, maxCharsPerLine) : [];
      const poemLines = poem ? wrapText(poem, maxCharsPerLine) : [];

      const greetingY = padding;
      const poemY =
        greetingLines.length > 0
          ? padding + greetingLines.length * lineHeight + greetingFontSize
          : padding;

      const textSvg = `
        <svg width="${panelWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
          <style>
            @font-face {
              font-family: 'OpenSans';
              src: url('file://'${fontFile}') format('truetype');
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

    // Final composite
    let finalBuffer = await sharp({
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
