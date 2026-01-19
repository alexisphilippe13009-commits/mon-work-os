// components/board/CellFactory.tsx
'use client'

import React from 'react';
import { Users, Plus, Calendar, Star, TrendingUp } from 'lucide-react';
import { Column, Item } from '@/app/types';
import { useBoard } from './BoardContext';

interface CellProps {
  col: Column;
  item: Item;
  groupId: string;
}

export const CellFactory: React.FC<CellProps> = ({ col, item, groupId }) => {
  const { updateCell } = useBoard();
  const val = item.values[col.id];

  const handleChange = (newVal: any) => {
    updateCell(groupId, item.id, col.id, newVal);
  };

  switch (col.type) {
    case 'status':
      const labels = col.settings?.labels || {};
      const bg = labels[val] || '#c4c4c4';
      return (
        <div className="w-full h-full relative group/cell">
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-90" style={{backgroundColor: bg}}>
            <span className="truncate px-2">{val || ''}</span>
          </div>
          <select 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            value={val || ''} 
            onChange={(e) => handleChange(e.target.value)}
          >
            {Object.keys(labels).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      );

    case 'people':
      return (
        <div className="w-full h-full flex items-center justify-center relative hover:bg-gray-100 cursor-pointer">
            {val && val.length > 0 ? (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border-2 border-white font-bold">{val[0].charAt(0)}</div>
            ) : <Users size={16} className="text-gray-300"/>}
        </div>
      );

    case 'rating':
        return (
            <div className="w-full h-full flex items-center justify-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} 
                        className={`cursor-pointer ${s <= (val||0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        onClick={() => handleChange(s)}
                    />
                ))}
            </div>
        );

    case 'progress':
        const prog = val || 0;
        return (
            <div className="w-full h-full flex items-center px-2 gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${prog}%`}}></div>
                </div>
                <span className="text-[10px] w-6 text-right">{prog}%</span>
            </div>
        );

    default: // Text, Name, etc.
      return (
        <input 
          className="w-full h-full bg-transparent px-2 text-xs outline-none" 
          value={val || ''} 
          onChange={(e) => handleChange(e.target.value)} 
        />
      );
  }
};