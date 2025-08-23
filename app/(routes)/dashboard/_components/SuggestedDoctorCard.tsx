// 'use client';

// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// type Doctor = {
//   id: string;
//   name: string;
//   specialization: string;
// };

// interface Props {
//   doctor: Doctor;
//   note: string;
// }

// export function SuggestedDoctorCard({ doctor, note }: Props) {
//   const router = useRouter();

//   const handleStartConsultation = async () => {
//     try {
//       const res = await fetch("/api/session-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           doctorId: doctor.id,
//           doctorName: doctor.name,
//           specialization: doctor.specialization,
//           note,
//         }),
//       });

//       const session = await res.json();

//       if (session?.sessionId) {
//         router.push(`/dashboard/medical-agent/${session.sessionId}`);
//       } else {
//         alert("Failed to start session.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Something went wrong.");
//     }
//   };

//   return (
//     <div className="border p-4 rounded-md hover:shadow-md transition-shadow">
//       <h2 className="text-lg font-semibold">{doctor.name}</h2>
//       <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
//       <Button className="w-full" onClick={handleStartConsultation}>
//         Start Consultation
//       </Button>
//     </div>
//   );
// }
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
};

interface Props {
  doctor: Doctor;
  note: string;
}

export function SuggestedDoctorCard({ doctor, note }: Props) {
  const router = useRouter();

  const handleStartConsultation = async () => {
    try {
      const res = await fetch("/api/session-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialization: doctor.specialization,
          note,
        }),
      });

      const session = await res.json();

      if (session?.sessionId) {
        router.push(`/dashboard/medical-agent/${session.sessionId}`);
      } else {
        alert("Failed to start session.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="border p-4 rounded-md hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold">{doctor.name}</h2>
      <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
      <Button className="w-full" onClick={handleStartConsultation}>
        Start Consultation
      </Button>
    </div>
  );
}
