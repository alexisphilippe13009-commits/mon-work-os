// components/board/ItemSidePanel.tsx
'use client'

import React, { useState } from 'react';
import { Item } from '@/app/types';
import { 
  X, Bell, Star, MoreHorizontal, UserPlus, 
  MessageSquare, FileText, Activity, Paperclip, 
  Smile, AtSign, Send, ThumbsUp, Reply, CheckCircle2 
} from 'lucide-react';

interface Props {
  item: Item;
  onClose: () => void;
}

export const ItemSidePanel: React.FC<Props> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'files' | 'activity'>('updates');
  const [comment, setComment] = useState("");

  return (
    <>
      {/* Overlay sombre transparent */}
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      
      {/* Le Panneau Glissant */}
      <div className="fixed top-0 right-0 h-full w-[650px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right-10 duration-200 border-l border-gray-200 font-sans">
        
        {/* 1. Header du Panneau */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#323338] mb-1">{item.name}</h2>
                    <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded border border-blue-200">In Board 1</span>
                         <span className="text-gray-400 text-xs">Pulse ID: {item.id}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Bell size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Star size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><MoreHorizontal size={18}/></button>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500 transition"><X size={20}/></button>
                </div>
            </div>

            {/* Onglets de navigation */}
            <div className="flex items-center gap-6 text-sm font-medium text-gray-500 mt-2">
                <button 
                    onClick={() => setActiveTab('updates')}
                    className={`pb-2 border-b-2 transition flex items-center gap-2 ${activeTab === 'updates' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-800'}`}
                >
                    <MessageSquare size={14}/> Updates <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">1</span>
                </button>
                <button 
                    onClick={() => setActiveTab('files')}
                    className={`pb-2 border-b-2 transition flex items-center gap-2 ${activeTab === 'files' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-800'}`}
                >
                    <FileText size={14}/> Files
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2 border-b-2 transition flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-800'}`}
                >
                    <Activity size={14}/> Activity Log
                </button>
            </div>
        </div>

        {/* 2. Contenu Principal */}
        <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-6">
            
            {/* Zone de rédaction (Rich Text Editor simulé) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6 focus-within:ring-1 ring-blue-500 transition">
                <textarea 
                    className="w-full resize-none outline-none text-sm min-h-[80px] placeholder-gray-400" 
                    placeholder="Write an update..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-2 text-gray-400">
                         <button className="p-1.5 hover:bg-gray-100 rounded"><AtSign size={14}/></button>
                         <button className="p-1.5 hover:bg-gray-100 rounded"><Paperclip size={14}/></button>
                         <button className="p-1.5 hover:bg-gray-100 rounded"><Smile size={14}/></button>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                        Update <Send size={12}/>
                    </button>
                </div>
            </div>

            {/* Fil d'actualité (Updates) */}
            <div className="space-y-6">
                {/* Exemple d'un post */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold border-2 border-white shadow-sm shrink-0">
                        AL
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl rounded-tl-none p-4 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-[#323338] text-sm">Alex Philippe</span>
                                <div className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> Project Owner • 2h ago</div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal size={14}/></button>
                        </div>
                        
                        <div className="text-sm text-gray-800 leading-relaxed mb-4">
                            Hey team! 🎉 <br/>
                            We just validated the <span className="text-blue-600 font-medium">@API V2</span> architecture. Great job everyone on the sprint.
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition">
                                <ThumbsUp size={12}/> Like <span className="ml-1 opacity-60">12</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 text-gray-500 rounded-full text-xs font-bold transition">
                                <Reply size={12}/> Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};