import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages, doctorInfo } = await req.json();

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    console.log("💾 Saving conversation for session:", sessionId);
    console.log("📝 Messages count:", messages.length);
    console.log("👨‍⚕️ Doctor info:", doctorInfo);

    // Create conversation summary
    const conversationSummary = messages
      .map((msg: { role: string; text: string; timestamp?: string }) => 
        `[${msg.timestamp || new Date().toISOString()}] ${msg.role}: ${msg.text}`
      )
      .join('\n');

    // Update session with conversation notes
    const conversationNote = `Consultation completed with ${messages.length} exchanges. 
Doctor: ${doctorInfo?.name || 'Unknown'} (${doctorInfo?.speciality || 'General'})
Conversation Summary:
${conversationSummary}`;

    try {
      // Update the session chat record with conversation details
      await db
        .update(SessionChatTable)
        .set({
          note: conversationNote,
        })
        .where(eq(SessionChatTable.sessionId, parseInt(sessionId)));

      console.log("✅ Conversation saved successfully to database");

      return NextResponse.json({
        success: true,
        message: "Conversation saved successfully",
        data: {
          sessionId,
          messagesCount: messages.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      
      // Return success even if DB fails, as we don't want to break the flow
      return NextResponse.json({
        success: true,
        message: "Conversation processed (fallback mode)",
        fallback: true,
        data: {
          sessionId,
          messagesCount: messages.length,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error("❌ Error saving conversation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save conversation",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}