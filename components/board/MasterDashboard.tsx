// components/board/MasterDashboard.tsx
'use client'

import React from 'react';
import { Dashboard, Board } from '@/app/types';
import { 
  TrendingUp, Battery, CheckCircle2, AlertCircle, 
  BarChart3, PieChart, Calendar, Settings, MoreHorizontal, Maximize2, Plus 
} from 'lucide-react';

interface Props {
  dashboard: Dashboard;
  allBoards: Board[]; // C'est ici qu'on "link" tout
}

export const MasterDashboard: React.FC<Props> = ({ dashboard, allBoards }) => {
  
  // --- MOTEUR D'AGRÉGATION (LINKER) ---
  // Cette fonction aspire les données de TOUS les tableaux connectés
  const aggregateData = () => {
    // Dans une vraie app, on filtrerait par widget.settings.sourceBoardIds
    // Ici on prend tout pour la démo "Enterprise"
    const allItems = allBoards.flatMap(b => b.groups.flatMap(g => g.items));
    
    const totalBudget = allItems.reduce((acc, item) => {
        // Cherche une colonne budget dans les values
        const val = Object.values(item.values).find(v => typeof v === 'number' && v > 100); 
        return acc + (Number(val) || 0);
    }, 0);

    const statusCounts: Record<string, number> = {};
    allItems.forEach(item => {
        // Heuristique pour trouver le statut
        const statusVal = Object.values(item.values).find(v => ['Done', 'Stuck', 'Working', 'Critical', 'High'].includes(v as string));
        if(statusVal) statusCounts[statusVal as string] = (statusCounts[statusVal as string] || 0) + 1;
    });

    return { totalItems: allItems.length, totalBudget, statusCounts };
  };

  const stats = aggregateData();

  const renderWidget = (widget: any) => {
    switch (widget.type) {
        case 'numbers':
            return (
                <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{widget.title}</h3>
                    <div className="text-4xl font-bold text-gray-800">{stats.totalBudget.toLocaleString()} €</div>
                    <div className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> Global Revenue</div>
                </div>
            );
        case 'battery':
            return (
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex gap-2 items-center"><Battery size={16}/> {widget.title}</h3>
                    <div className="w-full h-12 flex rounded-md overflow-hidden shadow-inner">
                        <div style={{width: '60%', background: '#00c875'}} className="h-full flex items-center justify-center text-white text-xs font-bold">60%</div>
                        <div style={{width: '25%', background: '#fdab3d'}} className="h-full"></div>
                        <div style={{width: '15%', background: '#e2445c'}} className="h-full"></div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00c875]"></div> Done</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fdab3d]"></div> Working</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#e2445c]"></div> Stuck</span>
                    </div>
                </div>
            );
        case 'chart':
            return (
                 <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex gap-2 items-center"><BarChart3 size={16}/> {widget.title}</h3>
                        <Settings size={14} className="text-gray-300 cursor-pointer"/>
                    </div>
                    <div className="flex-1 flex items-end justify-around pb-2 border-b border-gray-100 px-4">
                        {[40, 70, 45, 90, 60].map((h, i) => (
                            <div key={i} className="w-12 bg-indigo-500 rounded-t-sm relative group transition-all hover:bg-indigo-600" style={{height: `${h}%`}}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition">{h}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-around mt-2 text-[10px] text-gray-400 font-bold uppercase">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
                    </div>
                 </div>
            );
        case 'workload':
            return (
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex gap-2 items-center"><CheckCircle2 size={16}/> {widget.title}</h3>
                    <div className="space-y-4">
                        {['Alex', 'Sarah', 'Mike'].map((name, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{name[0]}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-gray-700">{name}</span>
                                        <span className="text-gray-400">{85 - (i*10)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{width: `${85 - (i*10)}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#eceff8] overflow-hidden">
        {/* Dashboard Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 z-30">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[#323338]">{dashboard.name}</h1>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-200">Dashboard</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    Updated 2 mins ago • Visible to everyone
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700"><Calendar size={14}/> This Month</button>
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm">Add Widget</button>
                 <button className="p-2 hover:bg-gray-100 rounded"><MoreHorizontal size={16}/></button>
            </div>
        </div>

        {/* Widgets Grid */}
        <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-4 gap-6 auto-rows-[180px]">
                {/* Manual Grid Layout Simulation */}
                {dashboard.widgets.map(w => {
                    const colSpan = w.layout.w === 4 ? 'col-span-4' : w.layout.w === 2 ? 'col-span-2' : 'col-span-1';
                    const rowSpan = w.layout.h === 2 ? 'row-span-2' : 'row-span-1';
                    
                    return (
                        <div key={w.id} className={`${colSpan} ${rowSpan}`}>
                            {renderWidget(w)}
                        </div>
                    )
                })}
            </div>
            
            {/* Connected Boards Footer */}
            <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Connected Boards ({allBoards.length})</h3>
                <div className="flex gap-4">
                    {allBoards.map(b => (
                        <div key={b.id} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-600">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                             {b.name}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500">
                        <Plus size={14}/> Connect Board
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};