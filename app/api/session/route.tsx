// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { NextRequest, NextResponse } from "next/server";

// interface CreateSessionBody {
//   agentId: string;
//   prompt: string;
//   doctorName: string;
//   specialization: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     console.log("=== SESSION API CALLED ===");

//     const body = (await req.json()) as CreateSessionBody;
//     const { agentId, prompt, doctorName, specialization } = body;

//     if (!agentId || !prompt || !doctorName || !specialization) {
//       console.log("❌ Missing required fields:", body);
//       return NextResponse.json(
//         { 
//           success: false,
//           error: "Missing required fields",
//           details: { agentId: !!agentId, prompt: !!prompt, doctorName: !!doctorName, specialization: !!specialization }
//         },
//         { status: 400 }
//       );
//     }

//     console.log("✅ All fields validated, inserting into database...");

//     const [newSession] = await db
//       .insert(SessionChatTable)
//       .values({
//         doctorId: agentId.toString(),
//         doctorName,
//         specialization,
//         note: prompt,
//         createdAt: new Date(),
//       })
//       .returning();

//     if (!newSession || !newSession.sessionId) {
//       throw new Error("Session insert returned null or missing sessionId.");
//     }

//     console.log("✅ Session created successfully:", newSession);

//     return NextResponse.json({
//       success: true,
//       sessionId: newSession.sessionId,
//       message: "Session created successfully",
//     });

//   } catch (error: any) {
//     console.error("❌ Error creating session:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to create session",
//         details: error?.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";

interface CreateSessionBody {
  agentId: number;
  prompt: string;
  doctorName: string;
  specialization: string;
  voiceId: string;
  image: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== SESSION API CALLED ===");

    const body = (await req.json()) as CreateSessionBody;
    const { agentId, prompt, doctorName, specialization, voiceId, image } = body;

    if (!agentId || !prompt || !doctorName || !specialization || !voiceId) {
      console.log("❌ Missing required fields:", body);
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields",
          details: { agentId: !!agentId, prompt: !!prompt, doctorName: !!doctorName, specialization: !!specialization, voiceId: !!voiceId }
        },
        { status: 400 }
      );
    }

    console.log("✅ All fields validated, inserting into database...");

    // Store complete doctor information as JSON
    const doctorInfo = {
      name: doctorName,
      speciality: specialization,
      image: image || "/doctor1.png",
      voiceId: voiceId,
      agentPrompt: prompt
    };

    const [newSession] = await db
      .insert(SessionChatTable)
      .values({
        doctorId: agentId.toString(),
        doctorName,
        specialization,
        note: JSON.stringify(doctorInfo), // Store complete doctor info as JSON
        createdAt: new Date(),
      })
      .returning();

    if (!newSession || !newSession.sessionId) {
      throw new Error("Session insert returned null or missing sessionId.");
    }

    console.log("✅ Session created successfully:", newSession);

    return NextResponse.json({
      success: true,
      sessionId: newSession.sessionId,
      message: "Session created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create session",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}