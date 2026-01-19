// app/page.tsx
'use server'

import { loadFromCloud } from '@/app/actions';
import { BoardProvider } from '@/components/board/BoardContext';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { Board } from '@/app/types';

// Données de secours pour l'initialisation Enterprise
const FALLBACK_DATA: Board = {
  id: 'b_demo', name: 'Product Roadmap 2026', favorited: true,
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
  const cloudData = await loadFromCloud();
  // On suppose que cloudData est un tableau de workspaces, on prend le premier board du premier workspace pour simplifier l'exemple modulaire
  // Dans une vraie app, on aurait un routeur /board/[id]
  
  const initialBoard = (cloudData && cloudData[0] && cloudData[0].boards) ? cloudData[0].boards[0] : FALLBACK_DATA;

  return (
    <div className="h-screen flex flex-col">
        {/* Navbar simplifiée pour l'exemple */}
        <div className="h-12 bg-[#2b2c44] flex items-center px-4 text-white font-bold">tuesday.com Enterprise</div>
        
        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Placeholder */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:block"></div>
            
            {/* Main Application */}
            <BoardProvider initialData={initialBoard}>
                <BoardCanvas />
            </BoardProvider>
        </div>
    </div>
  );
}