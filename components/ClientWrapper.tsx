// components/ClientWrapper.tsx
'use client'

import React, { useState } from 'react';
import { BoardProvider, useBoard } from '@/components/board/BoardContext'; 
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { MasterDashboard } from '@/components/board/MasterDashboard';
import { Dashboard, Board, Entity } from '@/app/types'; // Import de Entity
import { Grid3x3, FileText, BarChart, Plus, Search, UserPlus, FolderPlus, X } from 'lucide-react';

// Wrapper interne
const WorkspaceUI = ({ initialData }: { initialData: Entity[] }) => {
  const { workspaceData, dispatch, inviteUser, users } = useBoard();
  const [activeId, setActiveId] = useState<string>(initialData[0]?.id || "");
  const [showInvite, setShowInvite] = useState(false);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newBoardName, setNewBoardName] = useState("");

  const activeEntity = workspaceData.find((e) => e.id === activeId) || workspaceData[0];
  const allBoards = workspaceData.filter((e) => e.type === 'board') as Board[];

  return (
    <>
        {/* MODALE INVITATION */}
        {showInvite && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold">Invite Members</h2>
                        <button onClick={() => setShowInvite(false)}><X/></button>
                    </div>
                    <div className="flex gap-2">
                        <input className="flex-1 border p-2 rounded" placeholder="Enter email address" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/>
                        <button className="bg-blue-600 text-white px-4 rounded font-bold" onClick={() => {inviteUser(inviteEmail); setShowInvite(false)}}>Invite</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODALE NEW WORKSPACE */}
        {showNewBoard && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                    <h2 className="text-xl font-bold mb-4">Create New Workspace</h2>
                    <input className="w-full border p-2 rounded mb-4" placeholder="Workspace Name" value={newBoardName} onChange={e=>setNewBoardName(e.target.value)}/>
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-bold" onClick={() => {
                        dispatch({type:'ADD_WORKSPACE', payload:{name:newBoardName}});
                        setShowNewBoard(false);
                    }}>Create Workspace</button>
                </div>
            </div>
        )}

        <div className="h-12 bg-[#2b2c44] flex items-center px-4 text-white justify-between shadow-md z-50 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded"><Grid3x3 size={18}/></div>
                <div className="font-bold text-lg tracking-tight">monday<span className="font-normal opacity-70">.com</span></div>
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded hover:bg-white/20 text-sm" onClick={() => setShowInvite(true)}>
                    <UserPlus size={14}/> Invite Members
                </button>
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center font-bold border-2 border-[#1e1f35]">A</div>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-40">
                <div className="p-4 flex flex-col gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 shadow-sm" onClick={() => setShowNewBoard(true)}>
                        <Plus size={16}/> Add New
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {workspaceData.map((e) => (
                        <div key={e.id} onClick={() => setActiveId(e.id)} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm transition-all ${activeId === e.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {e.type === 'dashboard' ? <BarChart size={16}/> : <FileText size={16}/>}
                            <span className="truncate">{e.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* LE SWITCHEUR FINAL */}
            {activeEntity && activeEntity.type === 'dashboard' ? (
                <MasterDashboard dashboard={activeEntity as Dashboard} allBoards={allBoards} />
            ) : (
                // ICI: On passe activeEntity (casté en Board) comme prop
                <BoardCanvas board={activeEntity as Board} />
            )}
        </div>
    </>
  );
}

export const ClientWrapper = ({ initialWorkspace }: { initialWorkspace: Entity[] }) => {
    return (
        <BoardProvider initialData={initialWorkspace}>
            <WorkspaceUI initialData={initialWorkspace} />
        </BoardProvider>
    );
};