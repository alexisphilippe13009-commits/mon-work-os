// components/board/GanttView.tsx
'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Board, Item, Group } from '@/app/types';
import { ChevronRight, ChevronDown, Plus, ZoomIn, ZoomOut, Calendar, ArrowRight } from 'lucide-react';

interface GanttProps {
  board: Board;
}

export const GanttView: React.FC<GanttProps> = ({ board }) => {
  const [zoomLevel, setZoomLevel] = useState(40); // Pixel width per day
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // 1. Trouver la colonne Timeline et Dépendance
  const timelineCol = board.columns.find(c => c.type === 'timeline') || board.columns.find(c => c.type === 'date');
  const dependencyCol = board.columns.find(c => c.type === 'dependency');
  const statusCol = board.columns.find(c => c.type === 'status');
  const personCol = board.columns.find(c => c.type === 'people');

  // 2. Calculer la plage de dates globale (Min Start - Max End)
  const allItems = board.groups.flatMap(g => g.items);
  const { minDate, maxDate, dateMap } = useMemo(() => {
      let min = new Date().getTime();
      let max = new Date().getTime() + (1000 * 60 * 60 * 24 * 30); // +30 jours par défaut

      allItems.forEach(item => {
          const val = item.values[timelineCol?.id || ''];
          if (val?.start) {
              const s = new Date(val.start).getTime();
              if (s < min) min = s;
          }
          if (val?.end) {
              const e = new Date(val.end).getTime();
              if (e > max) max = e;
          }
      });
      
      // Buffer visuel (1 semaine avant, 2 semaines après)
      min -= (1000 * 60 * 60 * 24 * 7);
      max += (1000 * 60 * 60 * 24 * 14);

      return { minDate: new Date(min), maxDate: new Date(max), dateMap: {} };
  }, [board, timelineCol]);

  // 3. Générer l'échelle de temps
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysArray = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(minDate.getTime() + (i * 1000 * 60 * 60 * 24));
      return { 
          date: d, 
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          dayNum: d.getDate(),
          month: d.toLocaleDateString('en-US', { month: 'short' }),
          isWeekend: d.getDay() === 0 || d.getDay() === 6
      };
  });

  // Helpers de positionnement
  const getDateX = (dateStr: string) => {
      if(!dateStr) return 0;
      const d = new Date(dateStr).getTime();
      const diff = d - minDate.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days * zoomLevel;
  };

  const getDurationWidth = (startStr: string, endStr: string) => {
      if(!startStr) return zoomLevel; // default 1 day
      const s = new Date(startStr).getTime();
      const e = endStr ? new Date(endStr).getTime() : s;
      const diff = e - s;
      const days = (diff / (1000 * 60 * 60 * 24)) + 1; // Inclusive
      return days * zoomLevel;
  };

  // 4. Moteur de Dépendances (Dessin des flèches SVG)
  const renderDependencies = () => {
      if (!dependencyCol) return null;
      
      // On map les items pour trouver leurs positions Y
      let currentY = 0;
      const itemPositions: Record<string, {x: number, y: number, w: number}> = {};

      board.groups.forEach(g => {
          if (collapsedGroups[g.id]) { currentY += 40; return; } // Group header height
          currentY += 40; 
          g.items.forEach(i => {
              const val = i.values[timelineCol?.id || ''];
              if (val?.start) {
                  itemPositions[i.id] = {
                      x: getDateX(val.start),
                      y: currentY + 14, // Middle of bar
                      w: getDurationWidth(val.start, val.end)
                  };
              }
              currentY += 36; // Row Height
          });
      });

      return (
          <svg className="absolute inset-0 pointer-events-none z-0" width={totalDays * zoomLevel} height={currentY}>
              {allItems.map(item => {
                  const deps = item.values[dependencyCol.id]; // Array of Item IDs
                  if (!deps || !Array.isArray(deps)) return null;
                  
                  const target = itemPositions[item.id];
                  if (!target) return null;

                  return deps.map(depId => {
                      const source = itemPositions[depId];
                      if (!source) return null;

                      // Draw Bezier Curve
                      const startX = source.x + source.w;
                      const startY = source.y;
                      const endX = target.x;
                      const endY = target.y;
                      
                      const path = `M ${startX} ${startY} C ${startX + 20} ${startY}, ${endX - 20} ${endY}, ${endX} ${endY}`;
                      
                      return (
                          <g key={`${depId}-${item.id}`}>
                              <path d={path} stroke="#9ca3af" strokeWidth="2" fill="none" />
                              <polygon points={`${endX},${endY} ${endX-5},${endY-3} ${endX-5},${endY+3}`} fill="#9ca3af" />
                          </g>
                      );
                  });
              })}
          </svg>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
        
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-200 flex items-center px-4 justify-between bg-white shrink-0">
             <div className="flex items-center gap-2">
                 <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium flex items-center gap-2"><Plus size={14}/> New Item</button>
                 <div className="h-4 w-px bg-gray-300 mx-2"></div>
                 <span className="text-sm font-bold text-gray-700">Timeline:</span>
                 <select className="text-sm border-none bg-transparent font-medium text-gray-600 outline-none">
                     <option>Days</option>
                     <option>Weeks</option>
                     <option>Months</option>
                 </select>
             </div>
             <div className="flex items-center gap-2">
                 <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => setZoomLevel(Math.max(20, zoomLevel - 5))}><ZoomOut size={16}/></button>
                 <span className="text-xs text-gray-400 font-mono w-12 text-center">{zoomLevel}%</span>
                 <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => setZoomLevel(Math.min(100, zoomLevel + 5))}><ZoomIn size={16}/></button>
                 <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"><Calendar size={14}/> Today</button>
             </div>
        </div>

        {/* Main Gantt Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Sidebar (List) */}
            <div className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 z-20 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]">
                 <div className="h-10 border-b border-gray-200 flex items-center px-4 text-xs font-bold text-gray-500 bg-gray-50">
                     ITEM
                 </div>
                 <div className="flex-1 overflow-y-hidden hover:overflow-y-auto custom-scrollbar">
                     {board.groups.map(group => (
                         <div key={group.id}>
                             <div 
                                className="h-10 flex items-center px-2 cursor-pointer hover:bg-gray-50 sticky top-0 bg-white z-10"
                                onClick={() => setCollapsedGroups(p => ({...p, [group.id]: !p[group.id]}))}
                             >
                                 <ChevronDown size={14} style={{color: group.color}} className={`transition-transform mr-1 ${collapsedGroups[group.id] ? '-rotate-90' : ''}`}/>
                                 <div className="text-sm font-bold truncate" style={{color: group.color}}>{group.name}</div>
                             </div>
                             {!collapsedGroups[group.id] && group.items.map(item => (
                                 <div key={item.id} className="h-9 flex items-center px-8 border-b border-gray-100 hover:bg-blue-50 text-sm text-gray-700 truncate">
                                     {item.name}
                                 </div>
                             ))}
                         </div>
                     ))}
                 </div>
            </div>

            {/* Right Chart Area */}
            <div className="flex-1 overflow-auto bg-white relative relative-scroll">
                 <div style={{width: totalDays * zoomLevel, minWidth: '100%'}}>
                     
                     {/* Time Header */}
                     <div className="h-10 border-b border-gray-200 flex sticky top-0 bg-white z-20">
                         {daysArray.map((d, i) => (
                             <div 
                                key={i} 
                                style={{width: zoomLevel}} 
                                className={`shrink-0 border-r border-gray-100 flex flex-col items-center justify-center text-[10px] ${d.isWeekend ? 'bg-gray-50' : 'bg-white'}`}
                             >
                                 <span className="text-gray-400 font-medium">{d.dayName}</span>
                                 <span className={`font-bold ${d.date.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-700'}`}>{d.dayNum}</span>
                             </div>
                         ))}
                     </div>

                     {/* Grid & Bars Container */}
                     <div className="relative">
                         {/* Background Grid */}
                         <div className="absolute inset-0 flex pointer-events-none">
                             {daysArray.map((d, i) => (
                                 <div key={i} style={{width: zoomLevel}} className={`shrink-0 border-r border-dashed border-gray-100 h-full ${d.isWeekend ? 'bg-gray-50/50' : ''}`}></div>
                             ))}
                         </div>

                         {/* Current Time Line */}
                         <div 
                            className="absolute top-0 bottom-0 w-px bg-red-500 z-10 shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                            style={{left: getDateX(new Date().toISOString()) + (zoomLevel/2)}}
                         >
                             <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                         </div>

                         {/* Dependencies Layer */}
                         {renderDependencies()}

                         {/* Items Bars */}
                         <div className="relative z-10 pt-1">
                             {board.groups.map(group => (
                                 <div key={group.id}>
                                     {/* Group Row Placeholder */}
                                     <div className="h-10"></div> 
                                     
                                     {!collapsedGroups[group.id] && group.items.map(item => {
                                         const val = item.values[timelineCol?.id || ''];
                                         const hasTime = val && val.start;
                                         const statusVal = item.values[statusCol?.id || ''];
                                         const statusColor = statusCol?.settings?.labels?.[statusVal] || group.color;

                                         return (
                                             <div key={item.id} className="h-9 relative group/barrow hover:bg-gray-50/30">
                                                 {hasTime ? (
                                                     <div 
                                                        className="absolute top-1.5 h-6 rounded-full shadow-sm border border-white/20 cursor-pointer hover:shadow-md transition-all flex items-center px-2 group/bar"
                                                        style={{
                                                            left: getDateX(val.start),
                                                            width: Math.max(zoomLevel, getDurationWidth(val.start, val.end)),
                                                            backgroundColor: statusColor
                                                        }}
                                                     >
                                                         {/* Left Handle */}
                                                         <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/20"></div>
                                                         
                                                         <span className="text-[10px] text-white font-bold truncate drop-shadow-md">{item.name}</span>
                                                         
                                                         {/* Right Handle */}
                                                         <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/20"></div>

                                                         {/* Connector Dot */}
                                                         <div className="absolute -right-3 w-2 h-2 rounded-full bg-gray-300 opacity-0 group-hover/bar:opacity-100 hover:bg-blue-500 cursor-crosshair"></div>
                                                     </div>
                                                 ) : (
                                                     <div className="absolute left-0 w-full h-full flex items-center justify-center text-xs text-gray-300 italic">
                                                         No dates set
                                                     </div>
                                                 )}
                                             </div>
                                         );
                                     })}
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};