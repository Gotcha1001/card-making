// import { NextResponse } from "next/server";
// import fetch from "node-fetch";
// import axios from "axios";

// export async function POST(request) {
//   try {
//     const { prompt, model } = await request.json();

//     if (!prompt || !model) {
//       return NextResponse.json(
//         { error: "Prompt and model are required" },
//         { status: 400 }
//       );
//     }

//     if (model === "replicate") {
//       if (!process.env.REPLICATE_API_KEY) {
//         console.error("REPLICATE_API_KEY is not set");
//         return NextResponse.json(
//           { error: "Server configuration error: API key missing" },
//           { status: 500 }
//         );
//       }

//       const safePrompt =
//         prompt +
//         ", photorealistic, highly detailed, sharp focus, 4k resolution, natural lighting, realistic textures";

//       const fetchWithTimeoutAndRetry = async (
//         url,
//         options,
//         timeout = 30000,
//         retries = 3
//       ) => {
//         for (let i = 0; i < retries; i++) {
//           try {
//             const controller = new AbortController();
//             const timeoutId = setTimeout(() => controller.abort(), timeout);
//             const response = await fetch(url, {
//               ...options,
//               signal: controller.signal,
//             });
//             clearTimeout(timeoutId);
//             return response;
//           } catch (error) {
//             if (error.name === "AbortError") {
//               console.warn(
//                 `Fetch timed out after ${timeout}ms, attempt ${
//                   i + 1
//                 }/${retries}`
//               );
//               if (i === retries - 1) {
//                 throw new Error("Request timed out after multiple attempts");
//               }
//             } else {
//               console.warn(
//                 `Fetch failed, attempt ${i + 1}/${retries}:`,
//                 error.message
//               );
//               if (i === retries - 1) throw error;
//             }
//             await new Promise((resolve) =>
//               setTimeout(resolve, 1000 * Math.pow(2, i))
//             );
//           }
//         }
//       };

//       console.log("Creating prediction with prompt:", safePrompt);
//       const response = await fetchWithTimeoutAndRetry(
//         "https://api.replicate.com/v1/predictions",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
//           },
//           body: JSON.stringify({
//             version:
//               "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
//             input: {
//               prompt: safePrompt,
//               num_outputs: 1,
//               width: 768,
//               height: 1090,
//               scheduler: "K_EULER",
//               num_inference_steps: 50,
//               guidance_scale: 9.0,
//               negative_prompt:
//                 "cartoon, anime, drawing, sketch, painting, illustration, unrealistic, low quality, blurry, deformed, mutated, extra limbs, disfigured, bad anatomy, watermark, signature, white space, empty space, margins",
//             },
//           }),
//         },
//         30000,
//         3
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Prediction creation failed:", errorData);
//         throw new Error(
//           `Failed to start image generation: ${
//             errorData.detail || response.statusText
//           }`
//         );
//       }

//       const prediction = await response.json();
//       console.log("Prediction created, ID:", prediction.id);

//       let result;
//       const maxAttempts = 60;
//       let attempt = 0;

//       while (attempt < maxAttempts) {
//         console.log(`Checking prediction status, attempt ${attempt + 1}`);
//         const statusResponse = await fetchWithTimeoutAndRetry(
//           `https://api.replicate.com/v1/predictions/${prediction.id}`,
//           {
//             headers: {
//               Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
//             },
//           },
//           15000,
//           2
//         );

//         if (!statusResponse.ok) {
//           const errorData = await statusResponse.json();
//           console.error("Status check failed:", errorData);
//           throw new Error(
//             `Failed to check status: ${
//               errorData.detail || statusResponse.statusText
//             }`
//           );
//         }

//         result = await statusResponse.json();
//         console.log("Prediction status:", result.status);

//         if (result.status === "succeeded") {
//           console.log("Prediction succeeded, output:", result.output);
//           // Fetch the image server-side to avoid CORS
//           const imageResponse = await fetch(result.output[0]);
//           if (!imageResponse.ok) {
//             throw new Error("Failed to fetch generated image");
//           }
//           const imageBuffer = await imageResponse.arrayBuffer();
//           const base64Image = `data:image/png;base64,${Buffer.from(
//             imageBuffer
//           ).toString("base64")}`;
//           return NextResponse.json({ imageUrl: base64Image });
//         } else if (result.status === "failed") {
//           console.error("Prediction failed:", result.error);
//           if (result.error?.includes("NSFW")) {
//             throw new Error(
//               "The prompt might contain inappropriate content. Please try a different, family-friendly description."
//             );
//           }
//           throw new Error(
//             "Image generation failed: " + (result.error || "Unknown error")
//           );
//         }

//         attempt++;
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }

//       throw new Error("Image generation timed out after 60 seconds");
//     } else if (model === "aigurulab") {
//       if (!process.env.AI_GURU_LAB_API) {
//         console.error("AI_GURU_LAB_API is not set");
//         return NextResponse.json(
//           { error: "Server configuration error: API key missing" },
//           { status: 500 }
//         );
//       }

//       const safePrompt =
//         prompt +
//         ", photorealistic, highly detailed, sharp focus, 4k resolution, natural lighting, realistic textures";

//       const result = await axios.post(
//         "https://aigurulab.tech/api/generate-image",
//         {
//           width: 1024,
//           height: 1450,
//           input: safePrompt,
//           model: "flux",
//           aspectRatio: "2:3",
//         },
//         {
//           headers: {
//             "x-api-key": process.env.AI_GURU_LAB_API,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("AI Guru Lab image generated:", result.data.image);
//       // Fetch the image server-side to avoid CORS
//       const imageResponse = await fetch(result.data.image);
//       if (!imageResponse.ok) {
//         throw new Error("Failed to fetch AI-generated image from storage");
//       }
//       const imageBuffer = await imageResponse.arrayBuffer();
//       const base64Image = `data:image/png;base64,${Buffer.from(
//         imageBuffer
//       ).toString("base64")}`;
//       return NextResponse.json({ imageUrl: base64Image });
//     } else {
//       return NextResponse.json(
//         { error: "Invalid model selected" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Error in generate-image API:", error);
//     return NextResponse.json(
//       {
//         error:
//           error.message || "Failed to generate image. Please try again later.",
//       },
//       { status: 500 }
//     );
//   }
// }

// CHECK IF WE HAVE CREDITS OR TOKENS TO DISPLAY TO THE USER

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import axios from "axios";

export async function POST(request) {
  try {
    const { prompt, model } = await request.json();

    if (!prompt || !model) {
      return NextResponse.json(
        { error: "Prompt and model are required" },
        { status: 400 }
      );
    }

    if (model === "replicate") {
      if (!process.env.REPLICATE_API_KEY) {
        console.error("REPLICATE_API_KEY is not set");
        return NextResponse.json(
          { error: "Server configuration error: API key missing" },
          { status: 500 }
        );
      }

      const safePrompt =
        prompt +
        ", photorealistic, highly detailed, sharp focus, 4k resolution, natural lighting, realistic textures";

      const fetchWithTimeoutAndRetry = async (
        url,
        options,
        timeout = 30000,
        retries = 3
      ) => {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, {
              ...options,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            if (error.name === "AbortError") {
              console.warn(
                `Fetch timed out after ${timeout}ms, attempt ${
                  i + 1
                }/${retries}`
              );
              if (i === retries - 1) {
                throw new Error("Request timed out after multiple attempts");
              }
            } else {
              console.warn(
                `Fetch failed, attempt ${i + 1}/${retries}:`,
                error.message
              );
              if (i === retries - 1) throw error;
            }
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, i))
            );
          }
        }
      };

      console.log("Creating prediction with prompt:", safePrompt);
      const response = await fetchWithTimeoutAndRetry(
        "https://api.replicate.com/v1/predictions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          },
          body: JSON.stringify({
            version:
              "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
              prompt: safePrompt,
              num_outputs: 1,
              width: 768,
              height: 1090,
              scheduler: "K_EULER",
              num_inference_steps: 50,
              guidance_scale: 9.0,
              negative_prompt:
                "cartoon, anime, drawing, sketch, painting, illustration, unrealistic, low quality, blurry, deformed, mutated, extra limbs, disfigured, bad anatomy, watermark, signature, white space, empty space, margins",
            },
          }),
        },
        30000,
        3
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Prediction creation failed:", errorData);
        if (response.status === 402 || errorData.detail?.includes("credit")) {
          return NextResponse.json(
            {
              error: "Insufficient credits for Replicate",
              code: "INSUFFICIENT_CREDITS",
            },
            { status: 402 }
          );
        }
        throw new Error(
          `Failed to start image generation: ${
            errorData.detail || response.statusText
          }`
        );
      }

      const prediction = await response.json();
      console.log("Prediction created, ID:", prediction.id);

      let result;
      const maxAttempts = 60;
      let attempt = 0;

      while (attempt < maxAttempts) {
        console.log(`Checking prediction status, attempt ${attempt + 1}`);
        const statusResponse = await fetchWithTimeoutAndRetry(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            },
          },
          15000,
          2
        );

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          console.error("Status check failed:", errorData);
          if (
            statusResponse.status === 402 ||
            errorData.detail?.includes("credit")
          ) {
            return NextResponse.json(
              {
                error: "Insufficient credits for Replicate",
                code: "INSUFFICIENT_CREDITS",
              },
              { status: 402 }
            );
          }
          throw new Error(
            `Failed to check status: ${
              errorData.detail || statusResponse.statusText
            }`
          );
        }

        result = await statusResponse.json();
        console.log("Prediction status:", result.status);

        if (result.status === "succeeded") {
          console.log("Prediction succeeded, output:", result.output);
          const imageResponse = await fetch(result.output[0]);
          if (!imageResponse.ok) {
            throw new Error("Failed to fetch generated image");
          }
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = `data:image/png;base64,${Buffer.from(
            imageBuffer
          ).toString("base64")}`;
          return NextResponse.json({ imageUrl: base64Image });
        } else if (result.status === "failed") {
          console.error("Prediction failed:", result.error);
          if (result.error?.includes("NSFW")) {
            throw new Error(
              "The prompt might contain inappropriate content. Please try a different, family-friendly description."
            );
          }
          if (result.error?.includes("credit")) {
            return NextResponse.json(
              {
                error: "Insufficient credits for Replicate",
                code: "INSUFFICIENT_CREDITS",
              },
              { status: 402 }
            );
          }
          throw new Error(
            "Image generation failed: " + (result.error || "Unknown error")
          );
        }

        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      throw new Error("Image generation timed out after 60 seconds");
    } else if (model === "aigurulab") {
      if (!process.env.AI_GURU_LAB_API) {
        console.error("AI_GURU_LAB_API is not set");
        return NextResponse.json(
          { error: "Server configuration error: API key missing" },
          { status: 500 }
        );
      }

      const safePrompt =
        prompt +
        ", photorealistic, highly detailed, sharp focus, 4k resolution, natural lighting, realistic textures";

      try {
        const result = await axios.post(
          "https://aigurulab.tech/api/generate-image",
          {
            width: 1024,
            height: 1450,
            input: safePrompt,
            model: "flux",
            aspectRatio: "2:3",
          },
          {
            headers: {
              "x-api-key": process.env.AI_GURU_LAB_API,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("AI Guru Lab image generated:", result.data.image);
        const imageResponse = await fetch(result.data.image);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch AI-generated image from storage");
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = `data:image/png;base64,${Buffer.from(
          imageBuffer
        ).toString("base64")}`;
        return NextResponse.json({ imageUrl: base64Image });
      } catch (error) {
        if (
          error.response?.status === 402 ||
          error.message?.includes("credit")
        ) {
          return NextResponse.json(
            {
              error: "Insufficient credits for AI Guru Lab",
              code: "INSUFFICIENT_CREDITS",
            },
            { status: 402 }
          );
        }
        throw error;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid model selected" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in generate-image API:", error);
    return NextResponse.json(
      {
        error:
          error.message || "Failed to generate image. Please try again later.",
        code: error.code || "GENERIC_ERROR",
      },
      { status: error.code === "INSUFFICIENT_CREDITS" ? 402 : 500 }
    );
  }
}
