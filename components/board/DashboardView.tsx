// components/board/DashboardView.tsx
'use client'

import React from 'react';
import { Board } from '@/app/types';
import { PieChart, TrendingUp, Battery, CheckCircle2, AlertCircle } from 'lucide-react';

export const DashboardView = ({ board }: { board: Board }) => {
  const allItems = board.groups.flatMap(g => g.items);
  const totalItems = allItems.length || 1;
  const statusCol = board.columns.find(c => c.type === 'status');
  const labels = statusCol?.settings?.labels || {};
  
  // Stats Calcul
  const statusCounts = allItems.reduce((acc, item) => {
      const val = item.values[statusCol?.id || ''] || '';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const budgetCol = board.columns.find(c => c.type === 'numbers');
  const totalBudget = allItems.reduce((acc, item) => acc + (parseFloat(item.values[budgetCol?.id || '']) || 0), 0);

  return (
    <div className="p-8 bg-gray-50 h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Project Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Widget 1: Battery */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Battery size={16}/> Progress Battery</h3>
                <div className="w-full h-12 flex rounded-md overflow-hidden shadow-inner">
                    {Object.entries(statusCounts).map(([label, count]) => (
                        <div key={label} style={{width: `${(count/totalItems)*100}%`, backgroundColor: labels[label] || '#ccc'}} className="h-full relative group">
                            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100">{Math.round((count/totalItems)*100)}%</div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {Object.entries(statusCounts).map(([label, count]) => (
                        <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: labels[label] || '#ccc'}}></div>
                            {label || 'Empty'}: {count}
                        </div>
                    ))}
                </div>
            </div>

            {/* Widget 2: Numbers */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Budget</h3>
                <div className="text-4xl font-bold text-gray-800">{totalBudget.toLocaleString()} €</div>
                <div className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> +12% vs last month</div>
            </div>

            {/* Widget 3: Done Count */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</h3>
                    <div className="text-3xl font-bold text-gray-800">{statusCounts['Done'] || 0}</div>
                    <div className="text-xs text-gray-500">Tasks finished</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24}/>
                </div>
            </div>

            {/* Widget 4: Stuck */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Stuck</h3>
                    <div className="text-3xl font-bold text-gray-800">{statusCounts['Stuck'] || 0}</div>
                    <div className="text-xs text-gray-500">Need attention</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle size={24}/>
                </div>
            </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Workload by Person</h3>
                <div className="flex-1 flex items-end justify-around pb-4 border-b border-gray-100">
                    {[40, 65, 30, 85].map((h, i) => (
                        <div key={i} className="w-12 bg-blue-500 rounded-t-md relative group" style={{height: `${h}%`}}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100">{h}h</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-around mt-2 text-xs text-gray-500">
                    <span>Alex</span><span>Sam</span><span>Jordan</span><span>Casey</span>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col items-center justify-center text-gray-400">
                <PieChart size={48} className="mb-4 text-gray-300"/>
                <p>Advanced Reporting Module</p>
                <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded text-sm font-bold">Configure Widget</button>
            </div>
        </div>
    </div>
  );
};