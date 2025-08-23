// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { NextRequest, NextResponse } from "next/server";
// import { eq } from "drizzle-orm";

// export async function POST(req: NextRequest) {
//   try {
//     const { doctorId, doctorName, specialization, note } = await req.json();

//     if (!doctorId || !doctorName || !specialization || !note) {
//       return NextResponse.json(
//         { error: "Missing required fields" }, 
//         { status: 400 }
//       );
//     }

//     const [newSession] = await db
//       .insert(SessionChatTable)
//       .values({
//         doctorId,
//         doctorName,
//         specialization,
//         note,
//         createdAt: new Date(),
//       })
//       .returning();

//     return NextResponse.json({ 
//       success: true,
//       sessionId: newSession.sessionId 
//     });
//   } catch (error) {
//     console.error("Error creating session:", error);
//     return NextResponse.json(
//       { error: "Failed to create session" }, 
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const sessionId = searchParams.get('sessionId');

//     if (!sessionId) {
//       return NextResponse.json(
//         { error: "Session ID is required" }, 
//         { status: 400 }
//       );
//     }

//     const session = await db
//       .select()
//       .from(SessionChatTable)
//       .where(eq(SessionChatTable.sessionId, parseInt(sessionId)))
//       .limit(1);

//     if (session.length === 0) {
//       return NextResponse.json(
//         { error: "Session not found" }, 
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: session[0]
//     });
//   } catch (error) {
//     console.error("Error fetching session:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch session" }, 
//       { status: 500 }
//     );
//   }
// }

// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { NextRequest, NextResponse } from "next/server";
// import { eq } from "drizzle-orm";

// // GET session by sessionId
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const sessionId = searchParams.get("sessionId");

//     if (!sessionId) {
//       return NextResponse.json(
//         { error: "Session ID is required" },
//         { status: 400 }
//       );
//     }

//     const sessionResult = await db
//       .select()
//       .from(SessionChatTable)
//       .where(eq(SessionChatTable.sessionId, parseInt(sessionId)))
//       .limit(1);

//     if (sessionResult.length === 0) {
//       return NextResponse.json(
//         { error: "Session not found" },
//         { status: 404 }
//       );
//     }

//     const session = sessionResult[0];

//     let selectedDoctor;
//     try {
//       selectedDoctor = JSON.parse(session.note || "{}");
//     } catch (error) {
//       console.error("Error parsing doctor info from session.note:", error);
//       selectedDoctor = {
//         name: session.doctorName,
//         speciality: session.specialization,
//         image: "/doctor1.png",
//         voiceId: "chris",
//         agentPrompt: "You are a helpful medical assistant."
//       };
//     }

//     const responseData = {
//       sessionId: session.sessionId,
//       createdAt: session.createdAt?.toISOString() || new Date().toISOString(),
//       userId: "user-123", // Replace with actual user ID if available
//       selectedDoctor
//     };

//     return NextResponse.json({ success: true, session: responseData });
//   } catch (error) {
//     console.error("Error fetching session:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch session" },
//       { status: 500 }
//     );
//   }
// }
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// ✅ Create new session
export async function POST(req: NextRequest) {
  try {
    const { doctorId, doctorName, specialization, note } = await req.json();

    if (!doctorId || !doctorName || !specialization || !note) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    const [newSession] = await db
      .insert(SessionChatTable)
      .values({
        doctorId,
        doctorName,
        specialization,
        note,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      sessionId: newSession.sessionId,
    });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// ✅ Fetch session by sessionId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const sessionResult = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, parseInt(sessionId)))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const session = sessionResult[0];

    let selectedDoctor;
    try {
      selectedDoctor = JSON.parse(session.note || "{}");
    } catch (error) {
      selectedDoctor = {
        name: session.doctorName,
        speciality: session.specialization,
        image: "/doctor1.png",
        voiceId: "chris",
        agentPrompt: "You are a helpful medical assistant.",
      };
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        createdAt: session.createdAt?.toISOString() || new Date().toISOString(),
        userId: "user-123",
        selectedDoctor,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
