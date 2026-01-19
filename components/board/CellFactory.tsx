// components/board/CellFactory.tsx
'use client'

import React, { useState } from 'react';
import { 
  Users, Star, Globe, Phone, Mail, Link as LinkIcon, 
  CheckCircle2, ThumbsUp, MessageSquare, Clock, Calendar
} from 'lucide-react';
import { Column, Item } from '@/app/types';
import { useBoard } from './BoardContext';

interface CellProps { 
    col: Column; 
    item: Item; 
    groupId: string; 
    boardId: string; // <-- C'EST CETTE LIGNE QUI MANQUE ACTUELLEMENT
    onClickName?: () => void; 
}

export const CellFactory: React.FC<CellProps> = ({ col, item, groupId, boardId, onClickName }) => {
  const { updateCell } = useBoard();
  const val = item.values[col.id];
  const [isEditingName, setIsEditingName] = useState(false);

  const handleChange = (v: any) => updateCell(boardId, groupId, item.id, col.id, v);

  switch (col.type) {
    case 'name':
      return (
        <div className="w-full h-full flex items-center px-2 relative group/namecell">
            {isEditingName ? (
                <input 
                    autoFocus
                    className="w-full h-8 px-2 bg-white border border-[#0073ea] rounded outline-none text-[13px] shadow-sm"
                    value={item.name}
                    onChange={(e) => updateCell(boardId, groupId, item.id, 'name', e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {if(e.key === 'Enter') setIsEditingName(false)}}
                />
            ) : (
                <div className="flex items-center w-full h-full">
                    <div 
                        className="flex-1 truncate cursor-pointer text-[#323338] text-[13px] hover:text-[#0073ea]"
                        onClick={onClickName}
                        title={item.name}
                    >
                        {item.name}
                    </div>
                    {/* Hover Icons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover/namecell:opacity-100 transition-opacity absolute right-1 pl-4 h-full bg-gradient-to-l from-white to-transparent">
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-[#0073ea]" onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}>Aa</button>
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-[#0073ea]" onClick={(e) => { e.stopPropagation(); onClickName?.(); }}><MessageSquare size={14}/></button>
                    </div>
                </div>
            )}
        </div>
      );

    case 'status':
    case 'priority':
        const labels = col.settings?.labels || {};
        const bg = labels[val] || '#c4c4c4';
        return (
            <div className="w-full h-full relative group/cell">
                <div className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold transition-all hover:opacity-90 relative overflow-hidden" style={{backgroundColor: bg}}>
                    <span className="truncate px-2 relative z-10">{val || ''}</span>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-black/10 rotate-45 translate-x-1 -translate-y-1"></div>
                </div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={val || ''} onChange={(e) => handleChange(e.target.value)}>
                    {Object.keys(labels).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
        );

    case 'people':
      return (
        <div className="w-full h-full flex items-center justify-center relative hover:bg-[#f5f7fa] cursor-pointer">
            {val && val.length > 0 ? (
                <div className="flex -space-x-1">
                   {val.map((p: string, i: number) => (
                       <div key={i} className="w-6 h-6 rounded-full bg-[#0073ea] text-white flex items-center justify-center text-[10px] border border-white font-bold">{p.charAt(0)}</div>
                   ))}
                </div>
            ) : <Users size={14} className="text-[#c4c4c4] hover:text-[#323338]"/>}
        </div>
      );

    case 'timeline':
        return (
            <div className="w-full h-full flex items-center justify-center px-3 py-1 bg-white hover:bg-[#f5f7fa] cursor-pointer group/tl">
                <div className="w-full h-5 rounded-full bg-[#333333] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute left-0 h-full bg-[#0073ea]" style={{width: '60%'}}></div>
                    <span className="text-[9px] text-white z-10 relative font-medium truncate px-1">
                        {val?.start ? `${new Date(val.start).getDate()} - ${new Date(val.end||val.start).getDate()} ${new Date(val.end||val.start).toLocaleString('default', {month:'short'})}` : '-'}
                    </span>
                </div>
            </div>
        );
    
    // Fallback pour les autres types
    default:
        return <input className="w-full h-full bg-transparent px-2 text-[12px] outline-none" value={val || ''} onChange={(e) => handleChange(e.target.value)} />;
  }
};