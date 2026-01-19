// components/board/CellFactory.tsx
'use client'

import React from 'react';
import { 
  Users, Plus, Star, Globe, Phone, Mail, Link as LinkIcon, 
  Clock, Calendar, File, CheckCircle2, Hash, ExternalLink, ThumbsUp 
} from 'lucide-react';
import { Column, Item } from '@/app/types';
import { useBoard } from './BoardContext';

interface CellProps { col: Column; item: Item; groupId: string; }

export const CellFactory: React.FC<CellProps> = ({ col, item, groupId }) => {
  const { updateCell } = useBoard();
  const val = item.values[col.id];
  const handleChange = (v: any) => updateCell(groupId, item.id, col.id, v);

  switch (col.type) {
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
        <div className="w-full h-full flex items-center justify-center relative hover:bg-gray-50 cursor-pointer">
            {val && val.length > 0 ? (
                <div className="flex -space-x-1">
                   {val.map((p: string, i: number) => (
                       <div key={i} className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] border border-white font-bold">{p.charAt(0)}</div>
                   ))}
                </div>
            ) : <Users size={14} className="text-gray-300"/>}
        </div>
      );

    case 'timeline':
        return (
            <div className="w-full h-full flex items-center justify-center px-2 py-1">
                <div className="w-full h-5 rounded-full bg-slate-700 flex items-center justify-center relative overflow-hidden group/tl">
                    <div className="absolute left-0 h-full bg-blue-500" style={{width: '60%'}}></div>
                    <span className="text-[9px] text-white z-10 relative font-medium truncate px-1">
                        {val?.start ? `${new Date(val.start).getDate()} - ${new Date(val.end||val.start).getDate()} ${new Date(val.end||val.start).toLocaleString('default', {month:'short'})}` : '-'}
                    </span>
                    <input type="date" className="absolute left-0 w-1/2 opacity-0 h-full cursor-pointer" onChange={e => handleChange({...val, start: e.target.value})}/>
                    <input type="date" className="absolute right-0 w-1/2 opacity-0 h-full cursor-pointer" onChange={e => handleChange({...val, end: e.target.value})}/>
                </div>
            </div>
        );

    case 'rating':
        return (
            <div className="w-full h-full flex items-center justify-center gap-0.5 bg-blue-50/30">
                {[1,2,3,4,5].map(s => (
                    <Star key={s} size={10} className={`cursor-pointer ${s <= (val||0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => handleChange(s)}/>
                ))}
            </div>
        );

    case 'progress':
        const prog = val || 0;
        return (
            <div className="w-full h-full flex items-center px-2 gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: `${prog}%`}}></div>
                </div>
                <span className="text-[10px] w-6 text-right font-mono">{prog}%</span>
            </div>
        );

    case 'check':
        return (
            <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => handleChange(!val)}>
                {val ? <CheckCircle2 size={18} className="text-green-500"/> : <div className="w-4 h-4 border border-gray-300 rounded-full hover:border-gray-400"></div>}
            </div>
        );

    case 'link':
        return (
            <div className="w-full h-full flex items-center justify-center gap-1 text-blue-600 hover:underline cursor-pointer text-xs">
                <LinkIcon size={12}/> {val?.text || 'www.web.com'}
                <button className="absolute inset-0 opacity-0" onClick={() => { const t = prompt("Link Text:"); const u = prompt("URL:"); if(t && u) handleChange({text: t, url: u}) }}></button>
            </div>
        );

    case 'world_clock':
        return (
            <div className="w-full h-full flex items-center justify-center gap-1 text-xs text-gray-600 bg-gray-50">
                <Globe size={12}/> <span>{val || 'NYC'}</span>
            </div>
        );

    case 'phone':
        return (
            <div className="w-full h-full flex items-center justify-center gap-1 text-xs text-gray-600">
                <Phone size={12}/> {val || <span className="text-gray-300">Add Number</span>}
                <input className="absolute inset-0 opacity-0" onChange={e => handleChange(e.target.value)}/>
            </div>
        );

    case 'email':
        return (
            <div className="w-full h-full flex items-center justify-center gap-1 text-xs text-blue-500">
                <Mail size={12}/> {val ? <span className="truncate max-w-[80px]">{val}</span> : <span className="text-gray-300">Email</span>}
                <input className="absolute inset-0 opacity-0" type="email" onChange={e => handleChange(e.target.value)}/>
            </div>
        );

    case 'vote':
        return (
            <div className="w-full h-full flex items-center px-2 gap-1 cursor-pointer hover:bg-gray-50" onClick={() => handleChange((val||0)+1)}>
                <ThumbsUp size={12} className="text-blue-600"/>
                <div className="flex-1 h-4 bg-gray-200 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-blue-400 absolute top-0 left-0" style={{width: `${Math.min((val||0)*10, 100)}%`}}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold z-10">{val || 0}</span>
                </div>
            </div>
        );

    case 'creation_log':
        return (
            <div className="w-full h-full flex flex-col justify-center items-center text-[9px] text-gray-400 leading-tight bg-gray-50/50">
                <span className="font-bold text-gray-600">Admin</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
        );

    case 'auto_number':
        return <div className="w-full h-full flex items-center justify-center text-xs font-mono text-gray-400">#{item.id.substr(0,4).toUpperCase()}</div>;

    case 'numbers':
        return (
            <div className="w-full h-full flex items-center justify-center text-xs relative hover:bg-gray-50">
                <span className="font-medium">{val} {col.settings?.unit}</span>
                <input className="absolute inset-0 opacity-0 text-center" type="number" onChange={e => handleChange(e.target.value)}/>
            </div>
        );

    default:
      return <input className="w-full h-full bg-transparent px-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500" value={val || ''} onChange={(e) => handleChange(e.target.value)} />;
  }
};