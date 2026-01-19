// components/board/BoardCanvas.tsx
'use client'

import React, { useState } from 'react';
import { useBoard } from './BoardContext';
import { CellFactory } from './CellFactory';
import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react';

export const BoardCanvas = () => {
  const { board, dispatch } = useBoard();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!board) return <div>Loading...</div>;

  return (
    <div className="flex-1 overflow-auto bg-[#eceff8] p-6 pb-40">
      <h1 className="text-3xl font-bold mb-6 text-[#323338]">{board.name}</h1>
      
      <div className="space-y-8">
        {board.groups.map(group => {
            const isCollapsed = collapsedGroups[group.id];
            
            return (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center p-3 sticky left-0 z-30 bg-white group/header">
                    <button onClick={() => setCollapsedGroups(prev => ({...prev, [group.id]: !isCollapsed}))}>
                        <ChevronDown size={18} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} style={{color: group.color}}/>
                    </button>
                    <div className="font-bold text-lg px-2 ml-2" style={{color: group.color}}>{group.name}</div>
                    <span className="text-xs text-gray-400 ml-4 font-medium border px-2 rounded-full">{group.items.length} items</span>
                </div>

                {/* Table */}
                {!isCollapsed && (
                    <div className="overflow-x-auto">
                        {/* Headers */}
                        <div className="flex border-y border-gray-200 bg-white h-[36px]">
                            <div className="w-8 sticky left-0 bg-white z-20 border-r border-gray-100"></div>
                            <div className="w-1.5 sticky left-8 bg-white z-20" style={{backgroundColor: group.color}}></div>
                            {board.columns.map(col => (
                                <div key={col.id} className={`px-2 flex items-center justify-center text-xs font-semibold text-gray-500 border-r border-gray-200 shrink-0 ${col.fixed ? 'sticky left-[38px] z-20 bg-white shadow-md' : ''}`} style={{width: col.width}}>
                                    {col.title}
                                </div>
                            ))}
                            <div className="flex-1 bg-white"></div>
                        </div>

                        {/* Rows */}
                        {group.items.map(item => (
                            <div key={item.id} className="flex border-b border-gray-100 hover:bg-[#f5f7fa] h-[36px] bg-white transition-colors group/row">
                                <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]">
                                    <MoreHorizontal size={12} className="text-gray-300"/>
                                </div>
                                <div className="w-1.5 sticky left-8 z-10" style={{backgroundColor: group.color}}></div>
                                
                                {board.columns.map(col => (
                                    <div key={col.id} className={`border-r border-gray-100 shrink-0 bg-white group-hover/row:bg-[#f5f7fa] ${col.fixed ? 'sticky left-[38px] z-10 shadow-md' : ''}`} style={{width: col.width}}>
                                        <CellFactory col={col} item={item} groupId={group.id} />
                                    </div>
                                ))}
                                <div className="flex-1 bg-white group-hover/row:bg-[#f5f7fa]"></div>
                            </div>
                        ))}

                        {/* Add Row */}
                        <div className="flex h-[36px] border-b border-gray-100 bg-white">
                            <div className="w-[38px] sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                            <div className="sticky left-[38px] z-10 bg-white w-[300px] border-r border-gray-100 flex items-center px-2">
                                <input 
                                    className="w-full text-sm outline-none placeholder-gray-400 hover:bg-gray-50 p-1 rounded" 
                                    placeholder="+ Add Item" 
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            dispatch({type: 'ADD_ITEM', payload: {groupId: group.id, name: e.currentTarget.value}});
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1 bg-white"></div>
                        </div>
                    </div>
                )}
            </div>
        )})}
        
        <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 text-gray-700 transition"
            onClick={() => dispatch({type: 'ADD_GROUP', payload: {name: 'New Group'}})}
        >
            <Plus size={16}/> Add New Group
        </button>
      </div>
    </div>
  );
};