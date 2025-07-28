// "use client";

// import React, { useState } from 'react';
// import Image from 'next/image';
// import { AddNewSessionDialog } from './AddNewSessionDialog';

// function HistoryList() {
//   const [historyList, setHistoryList] = useState([]);

//   return (
//     <div className='mt-10'>
//       <h2 className='font-bold text-xl mb-5'>Recent Consultations</h2>
//       {historyList.length === 0 ? (
//         <div className='flex items-center flex-col justify-center p-8 border-2 border-dashed rounded-2xl border-gray-300'>
//           <Image 
//             src="/medical-assistance.png" 
//             alt="No consultations"
//             width={150}
//             height={150}
//           />
//           <h2 className='font-bold text-xl mt-5'>No Recent Consultations</h2>
//           <p className='text-gray-600 mb-4'>It looks like you haven't consulted with any doctors yet.</p>
//           <AddNewSessionDialog />
//         </div>
//       ) : (
//         <div className='grid gap-4'>
//           {/* History items will be rendered here */}
//           {historyList.map((item, index) => (
//             <div key={index} className="p-4 border rounded-lg">
//               {/* History item content */}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default HistoryList;
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AddNewSessionDialog } from './AddNewSessionDialog';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HistoryItem {
  sessionId: number;
  doctorName: string;
  specialization: string;
  note: string;
  createdAt: string;
  reportId: string | null;
  patientSummary: string | null;
  assessment: string | null;
}

function HistoryList() {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      
      if (data.success) {
        setHistoryList(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (sessionId: number) => {
    router.push(`/dashboard/report/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className='mt-10'>
        <h2 className='font-bold text-xl mb-5'>Recent Consultations</h2>
        <div className='flex items-center justify-center p-8'>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading consultations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-10'>
      <h2 className='font-bold text-xl mb-5'>Recent Consultations</h2>
      {historyList.length === 0 ? (
        <div className='flex items-center flex-col justify-center p-8 border-2 border-dashed rounded-2xl border-gray-300'>
          <Image 
            src="/medical-assistance.png" 
            alt="No consultations"
            width={150}
            height={150}
          />
          <h2 className='font-bold text-xl mt-5'>No Recent Consultations</h2>
          <p className='text-gray-600 mb-4'>It looks like you haven't consulted with any doctors yet.</p>
          <AddNewSessionDialog />
        </div>
      ) : (
        <div className='grid gap-4'>
          {historyList.map((item) => (
            <div key={item.sessionId} className="bg-white p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-lg">{item.doctorName}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{item.specialization}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.reportId 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.reportId ? 'Report Available' : 'Processing'}
                  </span>
                </div>
              </div>

              {item.patientSummary && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-2">{item.patientSummary}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Session ID: {item.sessionId}</span>
                </div>
                {item.reportId && (
                  <Button 
                    onClick={() => viewReport(item.sessionId)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Report
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryList;