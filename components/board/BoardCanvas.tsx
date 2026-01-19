// components/board/BoardCanvas.tsx
'use client'

import React, { useState } from 'react';
import { useBoard } from './BoardContext';
import { CellFactory } from './CellFactory';
import { DashboardView } from './DashboardView';
import { GanttView } from './GanttView';
import { ItemSidePanel } from './ItemSidePanel';
import { Board, Item, Group, Column } from '@/app/types';
import { 
  ChevronDown, Plus, Search, Filter, 
  ArrowUpDown, Maximize2, Settings, Download, Home, BarChart, Calendar
} from 'lucide-react';

// Accepte le board en props
export const BoardCanvas = ({ board }: { board: Board }) => {
  const { dispatch, currentView, setCurrentView } = useBoard();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  if (!board) return <div className="p-10 text-gray-500">Select a board...</div>;

  const renderContent = () => {
      switch(currentView) {
          case 'dashboard': return <DashboardView board={board} />;
          case 'gantt': return <GanttView board={board} />;
          
          default: return (
            <div className="flex-1 overflow-auto p-6 pb-40 bg-[#eceff8]">
                <div className="space-y-8">
                  {board.groups.map((group: Group) => (
                      <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="flex items-center p-2 sticky left-0 z-30 bg-white border-b border-gray-100">
                              <div className="p-1 hover:bg-gray-100 rounded cursor-pointer mr-1" onClick={() => setCollapsedGroups(p => ({...p, [group.id]: !p[group.id]}))}>
                                  <ChevronDown size={18} style={{color: group.color}} className={`transition ${collapsedGroups[group.id]?' -rotate-90':''}`}/>
                              </div>
                              <div className="font-bold text-lg px-2" style={{color: group.color}}>{group.name}</div>
                              <span className="text-xs text-gray-400 ml-2 border px-2 rounded-full">{group.items.length} items</span>
                          </div>

                          {!collapsedGroups[group.id] && (
                              <div className="overflow-x-auto">
                                  <div className="flex border-b border-gray-200 bg-white h-[36px]">
                                      <div className="w-10 sticky left-0 bg-white z-20 border-r border-gray-100"></div>
                                      <div className="w-8 sticky left-10 bg-white z-20 border-r border-gray-100"></div>
                                      {board.columns.map((col: Column) => (
                                          <div key={col.id} className="px-2 flex items-center justify-center text-[11px] font-semibold text-gray-500 border-r border-gray-200 shrink-0" style={{width: col.width}}>
                                              {col.title}
                                          </div>
                                      ))}
                                      <div className="flex-1 bg-white"></div>
                                  </div>

                                  {group.items.filter((i: Item) => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item: Item) => (
                                      <div key={item.id} className="flex border-b border-gray-100 bg-white h-[36px] hover:bg-[#f5f7fa] group/row">
                                          <div className="w-10 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center">
                                              <div className="w-1.5 h-full absolute right-0" style={{backgroundColor: group.color}}></div>
                                          </div>
                                          <div className="w-8 sticky left-10 bg-white z-10 border-r border-gray-100 flex items-center justify-center">
                                              <input type="checkbox"/>
                                          </div>
                                          
                                          {board.columns.map((col: Column) => (
                                              <div key={col.id} className="border-r border-gray-100 shrink-0 bg-white" style={{width: col.width}}>
                                                  <CellFactory 
                                                    col={col} 
                                                    item={item} 
                                                    groupId={group.id} 
                                                    boardId={board.id} // <-- FIX: Passe l'ID du board
                                                    onClickName={() => setActiveItem(item)} 
                                                  />
                                              </div>
                                          ))}
                                          <div className="flex-1 bg-white"></div>
                                      </div>
                                  ))}

                                  <div className="flex h-[36px] bg-white border-t border-gray-100">
                                      <div className="w-[72px] sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                      <div className="sticky left-[72px] z-10 bg-white w-[300px] border-r border-gray-100 flex items-center px-2">
                                          <input 
                                            className="w-full text-sm outline-none px-2" 
                                            placeholder="+ Add Item" 
                                            onKeyDown={e => {if(e.key==='Enter'){dispatch({type:'ADD_ITEM', payload:{boardId: board.id, groupId:group.id, name:e.currentTarget.value}});e.currentTarget.value=''}}}
                                          />
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm text-sm" onClick={() => dispatch({type:'ADD_GROUP', payload:{boardId: board.id, name:'New Group'}})}>
                      <Plus size={16}/> Add New Group
                  </button>
                </div>
            </div>
          );
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#eceff8]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0 flex flex-col gap-4 shadow-sm z-40">
          <div className="flex justify-between items-start">
             <div>
                 <h1 className="text-3xl font-bold text-[#323338] mb-1">{board.name}</h1>
             </div>
             <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
                    <input className="pl-7 pr-3 py-1 border rounded-full text-sm w-32 focus:w-48 transition-all outline-none" placeholder="Search" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                 </div>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
              {board.views.map(v => {
                  let Icon = Home;
                  if(v.type === 'gantt') Icon = Calendar;
                  if(v.type === 'dashboard') Icon = BarChart;
                  
                  return (
                      <button 
                        key={v.id}
                        onClick={() => setCurrentView(v.type)}
                        className={`pb-3 flex items-center gap-2 text-sm transition border-b-2 ${currentView === v.type ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                      >
                          <Icon size={16}/> {v.name}
                      </button>
                  )
              })}
              <button className="pb-3 text-gray-400 hover:text-blue-600"><Plus size={16}/></button>
          </div>
      </div>

      {renderContent()}

      {activeItem && <ItemSidePanel item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
};