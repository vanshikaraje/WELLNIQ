'use client';

import React from 'react';
import HistoryList from './_components/HistoryList';
import DoctorsAgentList from './_components/DoctorsAgentList';
import { AddNewSessionDialog } from './_components/AddNewSessionDialog';

function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className='flex justify-between items-center mb-8'>
        <h1 className='font-bold text-3xl text-gray-800'>My Dashboard</h1>
        <AddNewSessionDialog />
      </div>
      <HistoryList />
      <DoctorsAgentList />
    </div>
  );
}

export default Dashboard;