// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import { Button } from '@/components/ui/button';
// import { ArrowRight } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// type DoctorAgent = {
//   id: number;
//   specialist: string;
//   description: string;
//   image: string;
//   agentPrompt: string;
//    voiceId?:string
// };

// type Props = {
//   doctorAgent: DoctorAgent;
// };

// function DoctorAgentCard({ doctorAgent }: Props) {
//   const router = useRouter();

//   const handleClick = async () => {
//     try {
//       console.log('Creating session for doctor:', doctorAgent.specialist);
      
//       console.log('Creating session for doctor:', doctorAgent.specialist);
      
//       const res = await fetch('/api/session', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           agentId: doctorAgent.id,
//           prompt: doctorAgent.agentPrompt,
//           doctorName: doctorAgent.specialist,
//           specialization: doctorAgent.specialist,
//         }),
//       });

//       const data = await res.json();
//       console.log('Session creation response:', data);
      
//       if (data?.success && data?.sessionId) {
//       }
      
//       if (data?.success && data?.sessionId) {
//         console.log('Navigating to session:', data.sessionId);
//         router.push(`/dashboard/medical-agent/${data.sessionId}`);
//       } else {
//         console.error('Session creation failed:', data);
//         alert('Failed to create session: ' + (data.error || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error creating session:', error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
//       <Image
//         src={doctorAgent.image}
//         alt={doctorAgent.specialist}
//         width={200}
//         height={300}
//         className='w-full h-[250px] object-cover rounded-xl'
//       />
//       <h2 className='font-bold mt-3 text-lg'>{doctorAgent.specialist}</h2>
//       <p className='line-clamp-2 text-sm text-gray-500 mt-1'>{doctorAgent.description}</p>
//       <Button className='w-full mt-3' onClick={handleClick}>
//         Start Consultation
//         <ArrowRight className="ml-2 h-4 w-4" />
//       </Button>
//     </div>
//   );
// }

// export default DoctorAgentCard;
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
};

type Props = {
  doctorAgent: DoctorAgent;
};

function DoctorAgentCard({ doctorAgent }: Props) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: doctorAgent.id,
          prompt: doctorAgent.agentPrompt,
          doctorName: doctorAgent.specialist,
          specialization: doctorAgent.specialist,
          voiceId: doctorAgent.voiceId || "chris",
          image: doctorAgent.image
        }),
      });

      const data = await res.json();
      
      if (data?.success && data?.sessionId) {
        router.push(`/dashboard/medical-agent/${data.sessionId}`);
      } else {
        alert('Failed to create session: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating session. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={200}
        height={300}
        className='w-full h-[250px] object-cover rounded-xl'
      />
      <h2 className='font-bold mt-3 text-lg'>{doctorAgent.specialist}</h2>
      <p className='line-clamp-2 text-sm text-gray-500 mt-1'>{doctorAgent.description}</p>
      
      <Button className='w-full mt-3' onClick={handleClick}>
        Start Consultation
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

export default DoctorAgentCard;
