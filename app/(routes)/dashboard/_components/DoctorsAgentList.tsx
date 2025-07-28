import { AIDoctorsAgents } from '@/shared/list';
import DoctorAgentCard from './DoctorAgentCard';
import React from 'react';

function DoctorsAgentList() {
  return (
    <div className='mt-10'> 
      <h2 className='font-bold text-xl mb-5'>AI Specialist Doctors</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
        {AIDoctorsAgents.map((doctor, index) => (
          <DoctorAgentCard key={doctor.id} doctorAgent={doctor} />
        ))}
      </div>
    </div>
  );
}

export default DoctorsAgentList;