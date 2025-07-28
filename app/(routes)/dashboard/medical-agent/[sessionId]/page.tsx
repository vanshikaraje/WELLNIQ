// "use client";

// import { useParams, useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowLeft,
//   MessageCircle,
//   User,
//   Calendar,
//   FileText,
//   PhoneOff,
//   PhoneCall,
//   Circle,
// } from "lucide-react";
// import Vapi from "@vapi-ai/web";

// interface SessionData {
//   sessionId: string;
//   doctorName: string;
//   specialization: string;
//   note: string;
//   createdAt: string;
//   selectedDoctor?: {
//     voiceId: string;
//     agentPrompt: string;
//   };
// }

// type messages = {
//   role: string;
//   text: string;
// };

// function MedicalVoiceAgent() {
//   const { sessionId } = useParams();
//   const router = useRouter();
//   const [sessionData, setSessionData] = useState<SessionData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [callStarted, setCallStarted] = useState(false);
//   const [vapiInstance, setVapiInstance] = useState<any>();
//   const [currentRoll, setCurrentRole] = useState<string | null>();
//   const [LiveTranscript, setLivetranscript] = useState<string>();
//   const [messages, setMessages] = useState<messages[]>([]);

//   useEffect(() => {
//     if (sessionId) {
//       getSessionDetails();
//     }
//   }, [sessionId]);

//   const getSessionDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/session-chat?sessionId=${sessionId}`);
//       const result = await response.json();

//       if (result.success) {
//         setSessionData(result.data);
//       } else {
//         console.error("Failed to fetch session details");
//       }
//     } catch (error) {
//       console.error("Error fetching session details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!vapiInstance) return;

//     vapiInstance.on("speech-start", () => {
//       setCurrentRole("assistant");
//     });

//     vapiInstance.on("speech-end", () => {
//       setCurrentRole("user");
//     });

//     return () => {
//       vapiInstance?.off("speech-start");
//       vapiInstance?.off("speech-end");
//     };
//   }, [vapiInstance]);

//   const StartCall = () => {
//     if (!sessionData) return;

//     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
//     setVapiInstance(vapi);

//     const vapiAgentConfig = {
//       name: "AI Medical Doctor Voice Agent",
//       firstMessage:
//         "Hi there! I'm your AI Medical Assistant. I'm here to help you with any health questions or concerns you might have today. How are you feeling?",
//       transcriber: {
//         provider: "assembly-ai",
//         language: "en",
//       },
//       voice: {
//         provider: "playht",
//         voiceId: sessionData.selectedDoctor?.voiceId || "chris",
//       },
//       model: {
//         provider: "openai",
//         model: "gpt-4",
//         messages: [
//           {
//             role: "system",
//             content:
//               sessionData.selectedDoctor?.agentPrompt ||
//               "You are a helpful medical assistant.",
//           },
//         ],
//       },
//     };

//     vapi.start(vapiAgentConfig);

//     vapi.on("call-start", () => {
//       setCallStarted(true);
//     });

//     vapi.on("call-end", () => {
//       setCallStarted(false);
//     });

//     vapi.on("message", (message) => {
//       if (message.type === "transcript") {
//         const { role, transcriptType, transcript } = message;

//         if (transcriptType === "partial") {
//           setLivetranscript(transcript);
//           setCurrentRole(role);
//         } else if (transcriptType === "final") {
//           setMessages((prev) => [...prev, { role: role, text: transcript }]);
//           setLivetranscript("");
//           setCurrentRole(null);
//         }
//       }
//     });
//   };

//   const endCall = () => {
//     if (!vapiInstance) return;

//     vapiInstance.stop();
//     vapiInstance.off("call-start");
//     vapiInstance.off("call-end");
//     vapiInstance.off("message");

//     setCallStarted(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading consultation...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <Button
//             variant="outline"
//             onClick={() => router.push("/dashboard")}
//             className="flex items-center gap-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back to Dashboard
//           </Button>
//           <div className="text-right">
//             <h1 className="text-2xl font-bold text-gray-800">
//               Medical Consultation
//             </h1>
//             <p className="text-gray-600">Session ID: {sessionId}</p>
//           </div>
//         </div>

//         {sessionData && (
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <div className="flex items-start gap-4">
//               <div className="bg-blue-100 p-3 rounded-full">
//                 <User className="h-6 w-6 text-blue-600" />
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-2">
//                   {sessionData.doctorName}
//                 </h2>
//                 <p className="text-blue-600 font-medium mb-3 flex items-center gap-2">
//                   <MessageCircle className="h-4 w-4" />
//                   {sessionData.specialization}
//                 </p>
//                 <div className="bg-gray-50 p-4 rounded-lg mb-3">
//                   <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <FileText className="h-4 w-4" />
//                     Patient Notes:
//                   </h3>
//                   <p className="text-gray-600">{sessionData.note}</p>
//                 </div>
//                 <p className="text-sm text-gray-500 flex items-center gap-2">
//                   <Calendar className="h-4 w-4" />
//                   Started: {new Date(sessionData.createdAt).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <MessageCircle className="h-5 w-5" />
//             Consultation Chat
//           </h3>
//           <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center space-y-3">
//             <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500 mb-4">
//               Ready to start your consultation with {sessionData?.doctorName}
//             </p>

//             <div className="flex justify-center items-center gap-2 mb-2">
//               <Circle
//                 className={`h-3 w-3 ${
//                   callStarted ? "text-green-500" : "text-red-500"
//                 }`}
//               />
//               <span className="text-sm text-gray-700">
//                 {callStarted ? "Connected" : "Not Connected"}
//               </span>
//             </div>

//             {!callStarted ? (
//               <Button className="w-full max-w-xs" onClick={StartCall}>
//                 <PhoneCall className="mr-2 h-4 w-4" />
//                 Start Call
//               </Button>
//             ) : (
//               <Button
//                 variant="destructive"
//                 className="w-full max-w-xs"
//                 onClick={endCall}
//               >
//                 <PhoneOff className="mr-2 h-4 w-4" />
//                 Disconnect
//               </Button>
//             )}

//             {messages.map((msg, index) => (
//               <div key={index} className="text-left text-gray-700">
//                 <p>
//                   <strong className="capitalize">{msg.role}:</strong> {msg.text}
//                 </p>
//               </div>
//             ))}

//             {LiveTranscript && (
//               <Button variant="outline" className="w-full max-w-xs">
//                 {currentRoll}: {LiveTranscript}
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MedicalVoiceAgent;
// "use client";

// import { useParams, useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, PhoneOff, PhoneCall } from "lucide-react";
// import Vapi from "@vapi-ai/web";
// import axios from "axios";
// import { toast } from "react-hot-toast";

// interface SessionData {
//   sessionId: number;
//   createdAt: string;
//   userId: string;
//   selectedDoctor: {
//     name: string;
//     speciality: string;
//     image: string;
//     voiceId: string;
//     agentPrompt: string;
//   };
// }

// const MedicalAgentPage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const [sessionData, setSessionData] = useState<SessionData | null>(null);
//   const [vapiInstance, setVapiInstance] = useState<any>(null);
//   const [isCallStarted, setCallStarted] = useState(false);
//   const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
//   const [livetranscript, setLivetranscript] = useState("");
//   const [currentRole, setCurrentRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Fetch session data
//   useEffect(() => {
//     const fetchSessionData = async () => {
//       try {
//         const response = await fetch(`/api/session-chat?sessionId=${params.sessionId}`);
//         const data = await response.json();
//         setSessionData(data.session);
//       } catch (error) {
//         console.error("Error fetching session data:", error);
//       }
//     };

//     if (params.sessionId) {
//       fetchSessionData();
//     }
//   }, [params.sessionId]);

//   // Start call
//   const StartCall = () => {
//     if (!sessionData) return;

//     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
//     setVapiInstance(vapi);

//     vapi.start({
//       name: "AI Medical Assistant",
//       firstMessage: "Hi there! I'm your AI Medical Assistant. How can I help you today?",
//       transcriber: { 
//         provider: "assembly-ai", 
//         language: "en" 
//       },
//       voice: { 
//         provider: "playht", 
//         voiceId: sessionData.selectedDoctor.voiceId 
//       },
//       model: {
//         provider: "openai",
//         model: "gpt-4",
//         messages: [{
//           role: "system",
//           content: sessionData.selectedDoctor.agentPrompt || "You are a helpful medical assistant.",
//         }],
//       },
//     });

//     vapi.on("call-start", () => setCallStarted(true));
//     vapi.on("call-end", () => {
//       setCallStarted(false);
//       GenerateReport().then(() => {
//         toast.success("Report generated successfully!");
//         router.push("/dashboard");
//       });
//     });
//     vapi.on("message", (message: any) => {
//       if (message.type === "transcript") {
//         const { role, transcriptType, transcript } = message;
//         if (transcriptType === "partial") {
//           setLivetranscript(transcript);
//           setCurrentRole(role);
//         } else if (transcriptType === "final") {
//           setMessages((prev) => [...prev, { role, text: transcript }]);
//           setLivetranscript("");
//           setCurrentRole(null);
//         }
//       }
//     });
//   };

//   // End call
//   const endCall = async () => {
//     setLoading(true);
//     if (vapiInstance) {
//       vapiInstance.stop();
//     }
//     setLoading(false);
//   };

//   const GenerateReport = async () => {
//     if (!sessionData) return;
    
//     try {
//       await axios.post("/api/medical-report", {
//         messages,
//         sessionDetails: sessionData,
//         sessionId: sessionData.sessionId,
//       });
//     } catch (error) {
//       console.error("Error generating report:", error);
//       toast.error("Failed to generate report");
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <div className="p-4 bg-gray-100 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
//           <h2 className="text-xl font-bold">Medical Consultation</h2>
//         </div>
//         <div>
//           {isCallStarted ? (
//             <Button variant="destructive" onClick={endCall} disabled={loading}>
//               <PhoneOff className="w-4 h-4 mr-2" />
//               End Call
//             </Button>
//           ) : (
//             <Button onClick={StartCall}>
//               <PhoneCall className="w-4 h-4 mr-2" />
//               Start Call
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Doctor Info */}
//       {sessionData && (
//         <div className="p-4 border-b flex items-center gap-6">
//           <img
//             src={sessionData.selectedDoctor.image}
//             alt="doctor"
//             className="w-16 h-16 rounded-full object-cover"
//           />
//           <div>
//             <h3 className="font-semibold text-lg">{sessionData.selectedDoctor.name}</h3>
//             <p className="text-sm text-gray-500">{sessionData.selectedDoctor.speciality}</p>
//             <p className="text-sm text-gray-500">Session ID: {sessionData.sessionId}</p>
//           </div>
//         </div>
//       )}

//       {/* Transcript Section */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`p-3 rounded-md max-w-[90%] break-words ${
//               m.role === "user"
//                 ? "bg-blue-100 text-blue-900 ml-auto"
//                 : "bg-green-100 text-green-900 mr-auto"
//             }`}
//           >
//             <strong>{m.role === "user" ? "You" : "Doctor"}: </strong>
//             {m.text}
//           </div>
//         ))}
//         {livetranscript && (
//           <div className="p-3 rounded-md bg-yellow-100 text-yellow-900">
//             <strong>{currentRole === "user" ? "You" : "Doctor"} (typing...): </strong>
//             {livetranscript}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MedicalAgentPage;
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PhoneCall, PhoneOff } from "lucide-react";
import Vapi from "@vapi-ai/web";
import axios from "axios";
import { toast } from "react-hot-toast";

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

const MedicalAgentPage = () => {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [vapi, setVapi] = useState<any>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // 🚀 Fetch Session Info
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session-chat?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => setSessionData(data.session))
      .catch((err) => console.error("Error fetching session:", err));
  }, [sessionId]);

  // 📞 Start Voice Call
  const startCall = () => {
    if (!sessionData) return;
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => setIsCallStarted(true));

    vapiInstance.on("call-end", () => {
      setIsCallStarted(false);
      setReportLoading(true);
      generateReport()
        .then(() => {
          setReportGenerated(true);
          setReportLoading(false);
          toast.success("Medical Report Generated!");
        })
        .catch(() => {
          toast.error("Failed to generate report");
          setReportLoading(false);
        });
    });

    vapiInstance.on("message", (message: any) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        if (transcriptType === "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === "final") {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });

    vapiInstance.start({
      name: "AI Medical Assistant",
      firstMessage: "Hi! I'm your AI doctor. How can I help today?",
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
            content: sessionData.selectedDoctor.agentPrompt || "You are a helpful medical assistant.",
          },
        ],
      },
    });
  };

  // ❌ End Call
  const endCall = () => {
    if (!vapi) return;
    setLoading(true);
    vapi.stop();
    setIsCallStarted(false);
    setLoading(false);
  };

  // 📋 Generate Report API
  const generateReport = async () => {
    if (!sessionData) return;
    const res = await axios.post("/api/medical-report", {
      messages,
      sessionDetails: sessionData,
      sessionId: sessionData.sessionId,
    });
    return res.data;
  };

  // 🧭 Navigate
  const viewReport = () => router.push(`/dashboard/report/${sessionData?.sessionId}`);
  const goToDashboard = () => router.push("/dashboard");

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
          <h2 className="text-xl font-bold">Medical Consultation</h2>
        </div>
        <div>
          {isCallStarted ? (
            <Button onClick={endCall} variant="destructive" disabled={loading}>
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          ) : (
            <Button onClick={startCall}>
              <PhoneCall className="mr-2 h-4 w-4" />
              Start Call
            </Button>
          )}
        </div>
      </div>

      {/* Doctor Info */}
      {sessionData && (
        <div className="p-4 border-b flex items-center gap-6">
          <img
            src={sessionData.selectedDoctor.image}
            alt="doctor"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-lg">{sessionData.selectedDoctor.name}</h3>
            <p className="text-sm text-gray-500">{sessionData.selectedDoctor.speciality}</p>
            <p className="text-sm text-gray-500">Session ID: {sessionData.sessionId}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-md max-w-[80%] ${
              m.role === "user"
                ? "ml-auto bg-blue-100 text-blue-900"
                : "mr-auto bg-green-100 text-green-900"
            }`}
          >
            <strong>{m.role === "user" ? "You" : "Doctor"}:</strong> {m.text}
          </div>
        ))}

        {liveTranscript && (
          <div className="p-3 rounded-md bg-yellow-100 text-yellow-900">
            <strong>{currentRole === "user" ? "You" : "Doctor"} (typing...):</strong>{" "}
            {liveTranscript}
          </div>
        )}
      </div>

      {/* Report Section */}
      {(reportLoading || reportGenerated) && (
        <div className="p-4 border-t bg-gray-50 text-center">
          {reportLoading ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-b-transparent rounded-full"></div>
              <span>Generating Medical Report...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-green-600 font-semibold flex justify-center items-center gap-2">
                <span>✅ Medical Report Generated Successfully!</span>
              </div>
              <div className="flex justify-center gap-3">
                <Button onClick={viewReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                  📋 View Report
                </Button>
                <Button variant="outline" onClick={goToDashboard}>
                  🏠 Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalAgentPage;
