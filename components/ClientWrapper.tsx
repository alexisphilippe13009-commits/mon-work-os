// components/ClientWrapper.tsx
'use client'

import React, { useState } from 'react';
import { BoardProvider } from '@/components/board/BoardContext';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { MasterDashboard } from '@/components/board/MasterDashboard';
import { Board, Dashboard, Entity } from '@/app/types';
import { Grid3x3, FileText, BarChart, Plus, Search } from 'lucide-react';

export const ClientWrapper = ({ initialWorkspace }: { initialWorkspace: Entity[] }) => {
  const [activeId, setActiveId] = useState<string>(initialWorkspace[0].id);
  
  // Trouver l'entité active (Board ou Dashboard)
  const activeEntity = initialWorkspace.find(e => e.id === activeId) || initialWorkspace[0];
  const allBoards = initialWorkspace.filter(e => e.type === 'board') as Board[];

  return (
    <>
        {/* Navbar Global */}
        <div className="h-12 bg-[#2b2c44] flex items-center px-4 text-white justify-between shadow-md z-50 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded"><Grid3x3 size={18}/></div>
                <div className="font-bold text-lg tracking-tight">monday<span className="font-normal opacity-70">.com</span></div>
            </div>
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center font-bold border-2 border-[#1e1f35]">A</div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-40">
                <div className="p-4 flex flex-col gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 shadow-sm">
                        <Plus size={16}/> Add New
                    </button>
                    <div className="relative mt-2">
                         <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400"/>
                         <input className="w-full pl-8 py-1.5 bg-gray-100 rounded border-transparent text-sm focus:bg-white focus:border-blue-500 transition outline-none" placeholder="Search"/>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase mt-2">Favorites</div>
                    {initialWorkspace.filter(e => e.favorited).map(e => (
                        <div key={e.id} onClick={() => setActiveId(e.id)} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm transition-all ${activeId === e.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {e.type === 'dashboard' ? <BarChart size={16} className="text-purple-500"/> : <FileText size={16} className="text-blue-400"/>}
                            <span className="truncate">{e.name}</span>
                        </div>
                    ))}

                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase mt-4">Workspace</div>
                    {initialWorkspace.map(e => (
                        <div key={e.id} onClick={() => setActiveId(e.id)} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm transition-all ${activeId === e.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {e.type === 'dashboard' ? <BarChart size={16}/> : <FileText size={16}/>}
                            <span className="truncate">{e.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Switcher */}
            {activeEntity.type === 'dashboard' ? (
                <MasterDashboard dashboard={activeEntity as Dashboard} allBoards={allBoards} />
            ) : (
                <BoardProvider initialData={activeEntity as Board}>
                    <BoardCanvas />
                </BoardProvider>
            )}
        </div>
    </>
  );
};