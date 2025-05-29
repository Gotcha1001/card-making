// // api/poem/route.js
// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// export async function POST(request) {
//   try {
//     const { recipientName, recipientDescription, category, occasion } = await request.json();

//     if (!recipientName || !category || !occasion) {
//       return NextResponse.json(
//         { error: "Recipient name, category, and occasion are required" },
//         { status: 400 }
//       );
//     }

//     const sanitizedName = recipientName
//       .replace(/[^a-zA-Z\s'-]/g, "")
//       .trim()
//       .slice(0, 50);

//     if (!sanitizedName) {
//       return NextResponse.json(
//         { error: "Invalid recipient name" },
//         { status: 400 }
//       );
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//       Generate a lyrical, poetic ${occasion} poem for a person named exactly "${sanitizedName}" (use this name verbatim in the poem, do not alter or abbreviate it), who ${
//         recipientDescription || "is a wonderful person"
//       }.
//       The poem must be ${category} in tone, 4-6 lines, evoke joy and celebration, and be family-friendly.
//       Incorporate specific details from the description (e.g., hobbies like cooking or hiking) to personalize the poem.
//     `;

//     let poem;
//     let attempts = 0;
//     const maxAttempts = 3;

//     while (attempts < maxAttempts) {
//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       poem = response.text();

//       if (poem.includes(sanitizedName)) {
//         break;
//       }
//       console.warn(
//         `Attempt ${attempts + 1}: Poem does not contain exact name "${sanitizedName}". Retrying...`
//       );
//       attempts++;
//     }

//     if (attempts >= maxAttempts) {
//       return NextResponse.json(
//         {
//           error: `Failed to generate poem with correct name "${sanitizedName}" after ${maxAttempts} attempts`,
//         },
//         { status: 500 }
//       );
//     }

//     // Prepend default greeting
//     const greeting = `Dearest ${sanitizedName},`;

//     return NextResponse.json({ greeting, poem });
//   } catch (error) {
//     console.error("Error generating poem:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to generate poem: " + (error.message || "Unknown error"),
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request) {
  try {
    const { recipientName, recipientDescription, category, occasion, model } =
      await request.json();

    if (!recipientName || !category || !occasion || !model) {
      return NextResponse.json(
        { error: "Recipient name, category, occasion, and model are required" },
        { status: 400 }
      );
    }

    const sanitizedName = recipientName
      .replace(/[^a-zA-Z\s'-]/g, "")
      .trim()
      .slice(0, 50);

    if (!sanitizedName) {
      return NextResponse.json(
        { error: "Invalid recipient name" },
        { status: 400 }
      );
    }

    const prompt = `
            Generate a lyrical, poetic ${occasion} poem for a person named exactly "${sanitizedName}" (use this name verbatim in the poem, do not alter or abbreviate it), who ${
      recipientDescription || "is a wonderful person"
    }. 
            The poem must be ${category} in tone, 4-6 lines, evoke joy and celebration, and be family-friendly.
            Incorporate specific details from the description (e.g., hobbies like cooking or hiking) to personalize the poem.
        `;

    let poem;
    let attempts = 0;
    const maxAttempts = 3;

    if (model === "gemini") {
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      while (attempts < maxAttempts) {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        poem = response.text();
        if (poem.includes(sanitizedName)) {
          break;
        }
        console.warn(
          `Attempt ${
            attempts + 1
          }: Poem does not contain exact name "${sanitizedName}". Retrying...`
        );
        attempts++;
      }
    } else if (model === "openrouter") {
      while (attempts < maxAttempts) {
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });
        poem = completion.choices[0].message.content;
        if (poem.includes(sanitizedName)) {
          break;
        }
        console.warn(
          `Attempt ${
            attempts + 1
          }: Poem does not contain exact name "${sanitizedName}". Retrying...`
        );
        attempts++;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid model selected" },
        { status: 400 }
      );
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        {
          error: `Failed to generate poem with correct name "${sanitizedName}" after ${maxAttempts} attempts`,
        },
        { status: 500 }
      );
    }

    const greeting = `Dearest ${sanitizedName},`;
    return NextResponse.json({ greeting, poem });
  } catch (error) {
    console.error("Error generating poem:", error);
    return NextResponse.json(
      {
        error: "Failed to generate poem: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
