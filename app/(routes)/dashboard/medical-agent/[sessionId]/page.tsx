"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, PhoneCall, PhoneOff, FileText, User, Stethoscope, AlertTriangle, Calendar, Pill, Activity } from "lucide-react";
import Vapi from "@vapi-ai/web";
import axios from "axios";
import { toast } from "sonner";

interface SessionData {
  sessionId: number;
  createdAt: string;
  userId: string;
  selectedDoctor: {
    name: string;
    speciality: string;
    image: string;
    voiceId: string;
    agentPrompt: string;
  };
}

interface MedicalReport {
  id: string;
  sessionId: string;
  patientSummary: string;
  chiefComplaints: string[];
  symptoms: string[];
  assessment: string;
  recommendations: string[];
  followUp: string;
  medications: string[];
  riskFactors: string[];
  reportDate: string;
  consultationSummary: string;
}

const MedicalAgentPage = () => {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [vapi, setVapi] = useState<any>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string; timestamp?: string }[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [medicalReport, setMedicalReport] = useState<MedicalReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [conversationSaved, setConversationSaved] = useState(false);

  // 🚀 Fetch Session Info
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session-chat?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setSessionData(data.session);
          console.log("✅ Session data loaded:", data.session);
        } else {
          toast.error("Failed to load session data");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("❌ Error fetching session:", error);
        toast.error("Error loading session");
        router.push("/dashboard");
      }
    };

    fetchSession();
  }, [sessionId, router]);

  // 📞 Start Voice Call
  const startCall = () => {
    if (!sessionData) {
      toast.error("Session data not loaded");
      return;
    }

    try {
      const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      setVapi(vapiInstance);

      vapiInstance.on("call-start", () => {
        setIsCallStarted(true);
        setMessages([]); // Clear previous messages
        toast.success("Call started successfully!");
        console.log("📞 Call started");
      });

      vapiInstance.on("call-end", async () => {
        console.log("📞 Call ended, processing...");
        setIsCallStarted(false);
        setLoading(true);
        
        // Start the post-call process
        await handleCallEnd();
      });

      vapiInstance.on("message", (message: any) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          
          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            const newMessage = { 
              role, 
              text: transcript,
              timestamp: new Date().toISOString()
            };
            
            setMessages((prev) => [...prev, newMessage]);
            setLiveTranscript("");
            setCurrentRole(null);
            
            console.log(`💬 New message - ${role}:`, transcript);
          }
        }
      });

      vapiInstance.on("error", (error: any) => {
        console.error("❌ Vapi error:", error);
        toast.error("Call error occurred");
        setIsCallStarted(false);
      });

      // Start the call
      vapiInstance.start({
        name: "AI Medical Assistant",
        firstMessage: `Hi! I'm Dr. ${sessionData.selectedDoctor.name}, your AI medical assistant specializing in ${sessionData.selectedDoctor.speciality}. How can I help you today?`,
        transcriber: {
          provider: "assembly-ai",
          language: "en",
        },
        voice: {
          provider: "playht",
          voiceId: sessionData.selectedDoctor.voiceId,
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: sessionData.selectedDoctor.agentPrompt || `You are Dr. ${sessionData.selectedDoctor.name}, a professional medical assistant specializing in ${sessionData.selectedDoctor.speciality}. Provide helpful, accurate medical guidance while being empathetic and professional.`,
            },
          ],
        },
      });

    } catch (error) {
      console.error("❌ Error starting call:", error);
      toast.error("Failed to start call");
    }
  };

  // ❌ End Call
  const endCall = () => {
    if (!vapi) return;
    
    setLoading(true);
    toast.info("Ending call...");
    
    try {
      vapi.stop();
    } catch (error) {
      console.error("❌ Error ending call:", error);
      setIsCallStarted(false);
      setLoading(false);
    }
  };

  // 🔄 Handle Call End Process
  const handleCallEnd = async () => {
    try {
      console.log("🔄 Starting post-call processing...");
      console.log("📝 Messages to process:", messages.length);

      if (messages.length === 0) {
        toast.error("No conversation data to process");
        setLoading(false);
        return;
      }

      // Step 1: Save Conversation
      setReportLoading(true);
      toast.info("Saving conversation...");
      
      const conversationResponse = await axios.post("/api/save-conversation", {
        sessionId: sessionData?.sessionId,
        messages: messages,
        doctorInfo: sessionData?.selectedDoctor
      });

      if (conversationResponse.data.success) {
        setConversationSaved(true);
        console.log("✅ Conversation saved successfully");
        toast.success("Conversation saved!");
      } else {
        console.warn("⚠️ Conversation save returned non-success:", conversationResponse.data);
      }

      // Step 2: Generate Medical Report
      toast.info("Generating medical report with AI...");
      
      const reportResponse = await axios.post("/api/medical-report", {
        sessionId: sessionData?.sessionId,
        messages: messages,
        sessionDetails: sessionData
      });

      if (reportResponse.data.success) {
        setMedicalReport(reportResponse.data.report);
        setReportGenerated(true);
        console.log("✅ Medical report generated successfully");
        console.log("📋 Report data:", reportResponse.data.report);
        toast.success("Medical report generated successfully!");
      } else {
        throw new Error(reportResponse.data.error || "Failed to generate report");
      }

    } catch (error) {
      console.error("❌ Error in post-call processing:", error);
      toast.error("Failed to process consultation data");
    } finally {
      setLoading(false);
      setReportLoading(false);
    }
  };

  // 📋 View Report
  const viewFullReport = () => {
    if (sessionData?.sessionId) {
      router.push(`/dashboard/report/${sessionData.sessionId}`);
    }
  };

  // 🏠 Go to Dashboard
  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-b-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-blue-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medical Consultation</h2>
            <p className="text-sm text-gray-600">Session #{sessionData.sessionId}</p>
          </div>
        </div>
        <div>
          {isCallStarted ? (
            <Button onClick={endCall} variant="destructive" disabled={loading} className="shadow-lg">
              <PhoneOff className="mr-2 h-4 w-4" />
              {loading ? "Ending..." : "End Consultation"}
            </Button>
          ) : (
            <Button onClick={startCall} className="bg-green-600 hover:bg-green-700 shadow-lg text-white">
              <PhoneCall className="mr-2 h-4 w-4" />
              Start Consultation
            </Button>
          )}
        </div>
      </div>

      {/* Doctor Info */}
      <div className="m-6 mb-4 bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg rounded-lg">
        <div className="p-6">
          <div className="flex items-center gap-6">
            <img
              src={sessionData.selectedDoctor.image}
              alt="doctor"
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-md"
            />
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800">{sessionData.selectedDoctor.name}</h3>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                <Stethoscope className="w-3 h-3 mr-1" />
                {sessionData.selectedDoctor.speciality}
              </div>
              <p className="text-sm text-gray-600">
                Ready to assist with your health concerns
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isCallStarted 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isCallStarted ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}></div>
                {isCallStarted ? "Active Call" : "Ready"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        {messages.length === 0 && !isCallStarted && (
          <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-lg">
            <div className="p-8 text-center">
              <PhoneCall className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Start Your Consultation</h3>
              <p className="text-gray-600">Click "Start Consultation" to begin your voice session with the AI doctor.</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white ml-12"
                  : "bg-white text-gray-800 mr-12 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Stethoscope className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {message.role === "user" ? "You" : `Dr. ${sessionData.selectedDoctor.name}`}
                </span>
              </div>
              <p className="leading-relaxed">{message.text}</p>
              {message.timestamp && (
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-200" : "text-gray-500"}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Live Transcript */}
        {liveTranscript && (
          <div className={`flex ${currentRole === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm border-2 border-dashed ${
                currentRole === "user"
                  ? "bg-blue-100 text-blue-800 border-blue-300 ml-12"
                  : "bg-yellow-50 text-yellow-800 border-yellow-300 mr-12"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {currentRole === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Stethoscope className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {currentRole === "user" ? "You" : `Dr. ${sessionData.selectedDoctor.name}`} (speaking...)
                </span>
              </div>
              <p className="leading-relaxed">{liveTranscript}</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Generation & Display */}
      {(reportLoading || reportGenerated) && (
        <div className="m-6 mt-4 bg-white/95 backdrop-blur-sm border border-blue-200 shadow-lg rounded-lg">
          <div className="p-6 pb-0">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="w-5 h-5" />
              Medical Report
            </h3>
          </div>
          <div className="p-6">
            {reportLoading ? (
              <div className="text-center py-6">
                <div className="flex items-center justify-center gap-3 text-blue-600 mb-4">
                  <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-b-transparent rounded-full"></div>
                  <span className="font-medium">Generating AI Medical Report...</span>
                </div>
                <p className="text-sm text-gray-600">
                  Analyzing consultation data and generating comprehensive medical report
                </p>
              </div>
            ) : medicalReport ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-lg mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    Medical Report Generated Successfully!
                  </div>
                  <p className="text-sm text-gray-600">
                    Report generated on {new Date(medicalReport.reportDate).toLocaleString()}
                  </p>
                </div>

                {!showReport ? (
                  <div className="text-center space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">Symptoms</p>
                        <p className="text-xl font-bold text-blue-600">{medicalReport.symptoms?.length || 0}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium text-gray-700">Recommendations</p>
                        <p className="text-xl font-bold text-green-600">{medicalReport.recommendations?.length || 0}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <Pill className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm font-medium text-gray-700">Medications</p>
                        <p className="text-xl font-bold text-orange-600">{medicalReport.medications?.length || 0}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                        <p className="text-sm font-medium text-gray-700">Risk Factors</p>
                        <p className="text-xl font-bold text-red-600">{medicalReport.riskFactors?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button 
                        onClick={() => setShowReport(true)} 
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Report Details
                      </Button>
                      <Button 
                        onClick={viewFullReport} 
                        variant="outline" 
                        className="border-blue-300 hover:bg-blue-50"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Full Report Page
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={goToDashboard}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        🏠 Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Patient Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patient Summary
                      </h4>
                      <p className="text-gray-700">{medicalReport.patientSummary}</p>
                    </div>

                    {/* Chief Complaints */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Chief Complaints
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {medicalReport.chiefComplaints?.map((complaint, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            {complaint}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Assessment */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Medical Assessment
                      </h4>
                      <p className="text-gray-700">{medicalReport.assessment}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {medicalReport.recommendations?.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                      <Button 
                        onClick={() => setShowReport(false)} 
                        variant="outline"
                        className="border-blue-300 hover:bg-blue-50"
                      >
                        Hide Details
                      </Button>
                      <Button 
                        onClick={viewFullReport} 
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Full Report Page
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={goToDashboard}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        🏠 Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-red-600">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>Failed to generate medical report</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalAgentPage;