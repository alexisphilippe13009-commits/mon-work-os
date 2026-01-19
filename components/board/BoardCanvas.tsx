// components/board/BoardCanvas.tsx
'use client'

import React, { useState } from 'react';
import { useBoard } from './BoardContext';
import { CellFactory } from './CellFactory';
import { DashboardView } from './DashboardView';
import { GanttView } from './GanttView'; // <--- Import du Gantt
import { 
  ChevronDown, MoreHorizontal, Plus, Search, Filter, 
  ArrowUpDown, Maximize2, Settings, Download, CalendarRange
} from 'lucide-react';

export const BoardCanvas = () => {
  const { board, dispatch, currentView, setCurrentView } = useBoard();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  if (!board) return <div>Loading...</div>;

  // ROUTING DES VUES
  if (currentView === 'dashboard') return <DashboardView board={board} />;
  if (currentView === 'gantt') return <GanttView board={board} />; // <--- Route Gantt

  return (
    <div className="flex-1 flex flex-col h-full bg-[#eceff8]">
      {/* View Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium" onClick={() => dispatch({type: 'ADD_ITEM', payload: {groupId: board.groups[0].id, name: 'New Task'}})}>New Item</button>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400"/>
                  <input 
                    className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:border-blue-500 focus:outline-none w-48 transition-all hover:border-gray-400" 
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded text-gray-600"><Filter size={14}/> Filter</button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded text-gray-600"><ArrowUpDown size={14}/> Sort</button>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded"><Download size={16}/></button>
              <button className="p-1.5 hover:bg-gray-100 rounded"><Settings size={16}/></button>
              <button className="p-1.5 hover:bg-gray-100 rounded"><Maximize2 size={16}/></button>
          </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-6 pb-40">
        <div className="space-y-10">
          {board.groups.map(group => {
              const isCollapsed = collapsedGroups[group.id];
              return (
              <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group/grp">
                  {/* Group Header */}
                  <div className="flex items-center p-2 sticky left-0 z-30 bg-white">
                      <div className="p-1 hover:bg-gray-100 rounded cursor-pointer transition mr-1" onClick={() => setCollapsedGroups(p => ({...p, [group.id]: !isCollapsed}))}>
                          <ChevronDown size={18} className={`transition-transform duration-200 text-gray-400 ${isCollapsed ? '-rotate-90' : ''}`} style={{color: group.color}}/>
                      </div>
                      <div className="font-bold text-lg px-2 py-0.5 rounded hover:border hover:border-gray-300 border border-transparent cursor-text transition" style={{color: group.color}}>{group.name}</div>
                      <span className="text-xs text-gray-400 ml-4 font-medium border border-gray-200 px-2 py-0.5 rounded-full">{group.items.length} items</span>
                  </div>

                  {!isCollapsed && (
                      <div className="overflow-x-auto">
                          {/* Headers */}
                          <div className="flex border-y border-gray-200 bg-white h-[36px]">
                              <div className="w-10 sticky left-0 bg-white z-20 border-r border-gray-100 flex items-center justify-center">
                                  <div className="w-1.5 h-full absolute right-0 top-0" style={{backgroundColor: group.color}}></div>
                              </div>
                              <div className="w-8 sticky left-10 bg-white z-20 border-r border-gray-100 flex items-center justify-center">
                                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer"/>
                              </div>
                              {board.columns.map(col => (
                                  <div key={col.id} className={`px-2 flex items-center justify-center text-[11px] font-semibold text-gray-500 border-r border-gray-200 shrink-0 select-none hover:bg-gray-50 transition cursor-col-resize ${col.fixed ? 'sticky left-[72px] z-20 bg-white shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]' : ''}`} style={{width: col.width}}>
                                      {col.title}
                                  </div>
                              ))}
                              <div className="w-10 border-r border-gray-200 flex items-center justify-center hover:bg-blue-50 cursor-pointer"><Plus size={16} className="text-gray-400 hover:text-blue-600"/></div>
                              <div className="flex-1 bg-white"></div>
                          </div>

                          {/* Items */}
                          {group.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                              <div key={item.id} className="flex border-b border-gray-100 hover:bg-[#f5f7fa] h-[36px] bg-white transition-colors group/row">
                                  <div className="w-10 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]">
                                      <div className="w-1.5 h-full absolute right-0 top-0" style={{backgroundColor: group.color}}></div>
                                  </div>
                                  <div className="w-8 sticky left-10 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]">
                                      <input type="checkbox" className="rounded border-gray-300 opacity-0 group-hover/row:opacity-100 checked:opacity-100 cursor-pointer"/>
                                  </div>
                                  
                                  {board.columns.map(col => (
                                      <div key={col.id} className={`border-r border-gray-100 shrink-0 bg-white group-hover/row:bg-[#f5f7fa] ${col.fixed ? 'sticky left-[72px] z-10 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]' : ''}`} style={{width: col.width}}>
                                          <CellFactory col={col} item={item} groupId={group.id} />
                                      </div>
                                  ))}
                                  <div className="flex-1 bg-white group-hover/row:bg-[#f5f7fa]"></div>
                              </div>
                          ))}

                          {/* Add Row */}
                          <div className="flex h-[36px] border-b border-gray-100 bg-white">
                              <div className="w-[72px] sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                              <div className="sticky left-[72px] z-10 bg-white w-[380px] border-r border-gray-100 flex items-center px-2">
                                  <input className="w-full text-sm outline-none placeholder-gray-400 hover:bg-gray-50 p-1 rounded" placeholder="+ Add Item" onKeyDown={(e) => {if(e.key === 'Enter') {dispatch({type: 'ADD_ITEM', payload: {groupId: group.id, name: e.currentTarget.value}}); e.currentTarget.value = '';}}}/>
                              </div>
                              <div className="flex-1 bg-white"></div>
                          </div>
                      </div>
                  )}
              </div>
          )})}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 text-gray-700 transition" onClick={() => dispatch({type: 'ADD_GROUP', payload: {name: 'New Group'}})}>
              <Plus size={16}/> Add New Group
          </button>
        </div>
      </div>
    </div>
  );
};