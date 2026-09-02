import React, { useState } from 'react';

interface MeterRowProps {
  item: any;
  onSave: (roomId: number, oldE: number, newE: number, oldW: number, newW: number) => void;
}

export function MeterRow({ item, onSave }: MeterRowProps) {
  const [oldE, setOldE] = useState(item.old_electric || 0);
  const [newE, setNewE] = useState(item.new_electric || 0);
  const [oldW, setOldW] = useState(item.old_water || 0);
  const [newW, setNewW] = useState(item.new_water || 0);

  const diffE = Math.max(0, newE - oldE);
  const diffW = Math.max(0, newW - oldW);

  return (
    <tr className="hover:bg-slate-700/30 transition">
      <td className="p-4 font-black text-indigo-400 text-sm">{item.room_number}</td>
      <td className="p-4 font-semibold text-white">{item.tenant_name || 'Phòng trống'}</td>
      <td className="p-4 text-center">
        <input
          type="number"
          value={oldE}
          onChange={(e) => setOldE(Number(e.target.value))}
          className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-white"
        />
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          value={newE}
          onChange={(e) => setNewE(Number(e.target.value))}
          className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-amber-400"
        />
      </td>
      <td className="p-4 text-center font-bold text-amber-400">{diffE} kWh</td>
      <td className="p-4 text-center">
        <input
          type="number"
          value={oldW}
          onChange={(e) => setOldW(Number(e.target.value))}
          className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-white"
        />
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          value={newW}
          onChange={(e) => setNewW(Number(e.target.value))}
          className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-sky-400"
        />
      </td>
      <td className="p-4 text-center font-bold text-sky-400">{diffW} m³</td>
      <td className="p-4 text-right">
        <button
          onClick={() => onSave(item.room_id, oldE, newE, oldW, newW)}
          className="bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-300 px-3 py-1 rounded-md font-bold transition text-xs border border-indigo-500/30"
        >
          Lưu
        </button>
      </td>
    </tr>
  );
}
