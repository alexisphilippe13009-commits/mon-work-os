// app/page.tsx
'use server'

import { loadFromCloud } from '@/app/actions';
import { BoardProvider } from '@/components/board/BoardContext';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { Board } from '@/app/types';

// Données de secours pour l'initialisation Enterprise
const FALLBACK_DATA: Board = {
  id: 'b_demo', 
  name: 'Product Roadmap 2026', 
  favorited: true,
  views: [],
  automations: [],
  columns: [
    { id: 'c_name', title: 'Task Name', type: 'name', width: 300, fixed: true },
    { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { labels: { 'Done': '#00c875', 'Stuck': '#e2445c', 'Working': '#fdab3d' } } },
    { id: 'c_rating', title: 'Priority', type: 'rating', width: 120 },
    { id: 'c_progress', title: 'Progress', type: 'progress', width: 140 }
  ],
  groups: [
    { id: 'g1', name: 'Q1 Goals', color: '#0073ea', collapsed: false, items: [
        { id: 'i1', name: 'Launch Database Sharding', values: { c_status: 'Working', c_rating: 5, c_progress: 45 } }
    ]}
  ]
};

export default async function Page() {
  const rawData = await loadFromCloud();
  
  // LE FIX EST ICI : On caste "rawData" en "any" pour que TypeScript nous laisse accéder à l'index [0]
  const cloudData = rawData as any;
  
  const initialBoard = (cloudData && Array.isArray(cloudData) && cloudData.length > 0 && cloudData[0].boards) 
    ? cloudData[0].boards[0] 
    : FALLBACK_DATA;

  return (
    <div className="h-screen flex flex-col font-sans text-[#323338]">
        {/* Navbar */}
        <div className="h-12 bg-[#2b2c44] flex items-center px-4 text-white justify-between shadow-md z-50">
            <div className="font-bold text-lg tracking-tight">tuesday<span className="font-normal opacity-70">.com</span></div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#1e1f35]">V</div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Placeholder */}
            <div className="w-16 bg-white border-r border-gray-200 hidden md:flex flex-col items-center pt-4 gap-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-40">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">🚀</div>
                <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
            </div>
            
            {/* Main Application */}
            <BoardProvider initialData={initialBoard}>
                <BoardCanvas />
            </BoardProvider>
        </div>
    </div>
  );
}