'use client'

import { useState } from 'react'
import { createItem, updateCell } from '@/app/actions'

export default function BoardView({ board }: { board: any }) {
  const [newItemName, setNewItemName] = useState('')

  // Rendu intelligent des cellules
  const renderCell = (item: any, col: any) => {
    const val = item.values[col.id]
    
    if (col.type === 'status') {
      const opts = col.settings?.options || {}
      const color = opts[val] || '#c4c4c4'
      return (
        <select 
          className="w-full h-8 text-xs text-white font-bold text-center appearance-none cursor-pointer rounded"
          style={{ backgroundColor: color }}
          value={val || ''}
          onChange={(e) => updateCell(item.id, col.id, e.target.value)}
        >
          <option value="">-</option>
          {Object.entries(opts).map(([k, c]: any) => (
            <option key={k} value={k} style={{backgroundColor: c}}>{k.toUpperCase()}</option>
          ))}
        </select>
      )
    }
    
    if (col.type === 'date') {
       return (
         <input 
           type="date" 
           className="w-full h-full text-xs text-center bg-transparent border-none focus:ring-0"
           value={val || ''}
           onChange={(e) => updateCell(item.id, col.id, e.target.value)}
         />
       )
    }

    return (
      <input 
        className="w-full h-full px-2 text-sm bg-transparent border-none focus:ring-2 focus:ring-blue-500"
        defaultValue={val}
        onBlur={(e) => updateCell(item.id, col.id, e.target.value)}
      />
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">{board.name}</h1>
      
      {board.groups.map((group: any) => (
        <div key={group.id} className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Groupe */}
          <div className="p-3 flex items-center gap-2" style={{ borderLeft: `6px solid ${group.color}` }}>
            <span className="text-lg font-bold" style={{ color: group.color }}>{group.title}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{group.items.length} items</span>
          </div>

          {/* Grille */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-64 p-2 text-left text-xs font-medium text-gray-500 pl-4 sticky left-0 bg-white">Item</th>
                  {board.columns.map((col: any) => (
                    <th key={col.id} className="w-40 p-2 text-center text-xs font-medium text-gray-500 border-l border-gray-100">
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 group/row">
                    <td className="p-0 border-r border-gray-100 sticky left-0 bg-white group-hover/row:bg-gray-50">
                      <div className="flex items-center h-10 pl-4 border-l-4 border-transparent hover:border-blue-400">
                        <input defaultValue={item.name} className="w-full text-sm bg-transparent outline-none" />
                      </div>
                    </td>
                    {board.columns.map((col: any) => (
                      <td key={col.id} className="p-1 border-r border-gray-100 h-10">
                        {renderCell(item, col)}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Ajout rapide */}
                <tr>
                  <td className="p-2 sticky left-0 bg-white">
                    <div className="flex gap-2">
                      <input 
                        placeholder="+ Add Item" 
                        className="text-sm px-2 py-1 border rounded w-full"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                             createItem(board.id, group.id, e.currentTarget.value)
                             e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td colSpan={board.columns.length} className="bg-gray-50"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}