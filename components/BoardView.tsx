'use client'

import { useState } from 'react'
import { createItem, updateCell, createGroup, deleteItem } from '@/app/actions'
import { Plus, Trash2, Layout, Calendar, Search, Bell, Settings, Home, Star, ChevronDown } from 'lucide-react'

export default function BoardView({ board }: { board: any }) {
  // Rendu d'une cellule selon son type (Status avec couleurs, Date, Texte)
  const renderCell = (item: any, col: any) => {
    const val = item.values[col.id] || ""
    
    if (col.type === 'status') {
      const opts = col.settings?.options || {}
      const color = opts[val] || '#c4c4c4' // Gris par défaut
      
      return (
        <div className="h-full w-full p-1">
          <select 
            className="w-full h-full text-xs text-white font-medium text-center appearance-none cursor-pointer border-none outline-none transition-all hover:opacity-90"
            style={{ backgroundColor: color, borderRadius: '4px' }}
            value={val}
            onChange={(e) => updateCell(item.id, col.id, e.target.value)}
          >
            <option value="" style={{color:'black', background:'white'}}></option>
            {Object.entries(opts).map(([k, c]: any) => (
              <option key={k} value={k} style={{backgroundColor: 'white', color: c, fontWeight:'bold'}}>{k}</option>
            ))}
          </select>
        </div>
      )
    }
    
    if (col.type === 'date') {
       return (
         <div className="h-full w-full p-1 flex justify-center">
            <input 
              type="date" 
              className="h-full w-full text-xs text-center bg-transparent border-transparent hover:border-gray-300 rounded focus:ring-0 text-gray-600"
              value={val}
              onChange={(e) => updateCell(item.id, col.id, e.target.value)}
            />
         </div>
       )
    }

    // Texte par défaut
    return (
      <div className="h-full w-full border-transparent hover:border-gray-200 border border-dashed flex items-center px-2">
        <input 
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-300"
          placeholder="..."
          defaultValue={val}
          onBlur={(e) => updateCell(item.id, col.id, e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden text-slate-800">
      
      {/* SIDEBAR NOIRE (Style Monday) */}
      <div className="w-16 flex flex-col items-center py-4 bg-[#2b2c44] text-white gap-6 shrink-0 z-50">
        <div className="p-2 bg-blue-600 rounded-md cursor-pointer hover:bg-blue-500"><Layout size={20}/></div>
        <div className="flex flex-col gap-4 mt-2 opacity-70">
           <Home size={20} className="hover:opacity-100 cursor-pointer"/>
           <Bell size={20} className="hover:opacity-100 cursor-pointer"/>
           <Star size={20} className="hover:opacity-100 cursor-pointer"/>
        </div>
        <div className="mt-auto opacity-70"><Settings size={20} className="hover:opacity-100 cursor-pointer"/></div>
      </div>

      {/* SECOND SIDEBAR (Navigation Workspace) */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
         <div className="p-4 border-b border-gray-200 font-bold text-lg flex items-center justify-between">
            Work OS <ChevronDown size={16}/>
         </div>
         <div className="p-2">
            <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-600 rounded cursor-pointer font-medium text-sm">
               <Layout size={16}/> {board.name}
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-100 rounded cursor-pointer mt-1 text-sm">
               <Calendar size={16}/> Marketing Plan
            </div>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* HEADER BOARD */}
        <div className="h-16 border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
           <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-800 leading-none">{board.name}</h1>
              <span className="text-xs text-gray-400 mt-1">Main Table</span>
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">
                 Invite / 1
              </button>
           </div>
        </div>

        {/* TOOLBAR */}
        <div className="h-12 border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 bg-white">
           <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1 hover:bg-blue-700" onClick={() => createGroup(board.id)}>
              <Plus size={14}/> New Item
           </button>
           <div className="h-6 w-px bg-gray-300 mx-2"></div>
           <div className="relative">
              <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
              <input placeholder="Search" className="pl-7 pr-2 py-1 border border-gray-300 rounded-full text-sm w-40 focus:w-60 transition-all outline-none focus:border-blue-500"/>
           </div>
        </div>

        {/* BOARD AREA (SCROLLABLE) */}
        <div className="flex-1 overflow-auto p-6 bg-white">
           {board.groups.map((group: any) => (
             <div key={group.id} className="mb-10">
                
                {/* GROUP HEADER */}
                <div className="flex items-center gap-2 mb-2 group/header">
                   <ChevronDown size={16} className="text-gray-400 cursor-pointer"/>
                   <h2 className="text-lg font-bold px-1 rounded hover:bg-gray-100 cursor-text" style={{color: group.color}}>{group.title}</h2>
                   <span className="text-xs text-gray-400 border border-gray-200 px-2 rounded-full">{group.items.length} items</span>
                </div>

                {/* TABLE */}
                <div className="shadow-sm border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {/* HEADER COLUMNS */}
                  <div className="flex border-b border-gray-200 bg-gray-50/50">
                    <div className="w-8 border-r border-gray-100 bg-white sticky left-0 z-20"></div> {/* Color Strip placeholder */}
                    <div className="w-8 border-r border-gray-100 bg-white sticky left-8 z-20"></div> {/* Checkbox placeholder */}
                    <div className="flex-1 min-w-[200px] border-r border-gray-200 p-2 text-xs font-normal text-gray-500 text-center sticky left-16 bg-white z-20">Item</div>
                    {board.columns.map((col: any) => (
                       <div key={col.id} className="p-2 text-xs font-normal text-gray-500 text-center border-r border-gray-200 truncate" style={{width: col.width || 120}}>
                          {col.title}
                       </div>
                    ))}
                    <div className="w-10"></div>
                  </div>

                  {/* ROWS */}
                  {group.items.map((item: any) => (
                    <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50 group/row h-9 bg-white">
                      
                      {/* Left Sticky Controls */}
                      <div className="w-2 sticky left-0 z-10" style={{backgroundColor: group.color}}></div>
                      <div className="w-6 border-r border-gray-100 flex items-center justify-center bg-white sticky left-2 z-10">
                         <input type="checkbox" className="opacity-0 group-hover/row:opacity-100 w-3 h-3"/>
                      </div>

                      {/* ITEM NAME (Editable) */}
                      <div className="flex-1 min-w-[200px] border-r border-gray-200 bg-white sticky left-8 z-10 flex items-center pl-2 group-hover/row:bg-gray-50">
                         <input 
                            defaultValue={item.name}
                            className="w-full bg-transparent text-sm outline-none text-gray-800 truncate"
                            onBlur={(e) => updateCell(item.id, 'name', e.target.value)} // Note: requires implementation in updateCell for name
                         />
                      </div>

                      {/* DYNAMIC CELLS */}
                      {board.columns.map((col: any) => (
                        <div key={col.id} className="border-r border-gray-100 flex items-center justify-center bg-white group-hover/row:bg-gray-50" style={{width: col.width || 120}}>
                           {renderCell(item, col)}
                        </div>
                      ))}

                      {/* DELETE BUTTON */}
                      <div className="w-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                         <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>

                    </div>
                  ))}

                  {/* ADD ITEM ROW */}
                  <div className="flex h-9 border-t border-gray-100">
                     <div className="w-2 sticky left-0" style={{backgroundColor: group.color, opacity:0.5}}></div>
                     <div className="w-6 border-r border-gray-100 sticky left-2 bg-white"></div>
                     <div className="flex-1 sticky left-8 bg-white border-r border-gray-200 flex items-center pl-2">
                        <input 
                          placeholder="+ Add Item" 
                          className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
                          onKeyDown={(e) => {
                             if(e.key === 'Enter') {
                                createItem(board.id, group.id, e.currentTarget.value);
                                e.currentTarget.value = "";
                             }
                          }}
                        />
                     </div>
                     <div className="flex-grow bg-gray-50"></div>
                  </div>
                </div>
             </div>
           ))}
           
           <button onClick={() => createGroup(board.id)} className="mt-4 flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition">
              <Plus size={16}/> Add New Group
           </button>
        </div>
      </div>
    </div>
  )
}