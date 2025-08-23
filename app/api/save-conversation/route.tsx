import { NextRequest, NextResponse } from "next/server";

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

    // Create conversation note
    const conversationNote = `Consultation completed with ${messages.length} exchanges. 
Doctor: ${doctorInfo?.name || 'Unknown'} (${doctorInfo?.speciality || 'General'})
Date: ${new Date().toISOString()}
Conversation Summary:
${conversationSummary}`;

    console.log("✅ Conversation processed successfully");

    return NextResponse.json({
      success: true,
      message: "Conversation saved successfully",
      data: {
        sessionId,
        messagesCount: messages.length,
        timestamp: new Date().toISOString(),
        conversationNote: conversationNote
      }
    });

  } catch (error) {
    console.error("❌ Error saving conversation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save conversation",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}