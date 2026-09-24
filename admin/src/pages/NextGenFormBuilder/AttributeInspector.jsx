import React from 'react';
import { Settings, Palette, Zap, Type, MoreHorizontal, Trash2, Copy, Ruler, BoxSelect } from 'lucide-react';

const AttributeInspector = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50/30 border-l border-slate-100">
      <div className="p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 flex items-center gap-2">
          <Settings size={16} className="text-violet-500" /> Component Inspector
        </h3>

        {!selectedNode ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-6 shadow-sm border border-slate-50">
              <BoxSelect size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400">Neutral State</p>
            <p className="text-[11px] text-slate-400 mt-2">Select an architectural node to modify its attributes.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Active Header */}
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {selectedNode.type || 'Standard'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => onDeleteNode(selectedNode.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
              <h4 className="text-base font-black text-slate-800">{selectedNode.data?.label}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {selectedNode.id}</p>
            </div>

            {/* Config Tabs */}
            <div className="flex bg-slate-100/50 p-1 rounded-xl">
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-white text-violet-600 rounded-lg shadow-sm">Config</button>
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Styles</button>
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Events</button>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type size={12} /> Display Label
                </label>
                <input 
                  type="text" 
                  value={selectedNode.data?.label || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={12} /> Primary Hue
                </label>
                <div className="flex gap-2">
                  {['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'].map(color => (
                    <button key={color} style={{ background: color }} className="w-8 h-8 rounded-lg shadow-sm hover:scale-110 transition-transform" />
                  ))}
                  <div className="flex-1 bg-white border border-slate-100 rounded-lg px-3 py-1 text-[10px] font-mono text-slate-400 flex items-center justify-center">#8B5CF6</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Execution Logic
                </label>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-violet-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                      <Ruler size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Condition: ON_CLICK</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-300" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-violet-200 transition-all">
                <Copy size={12} /> Duplicate
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all">
                Sync Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeInspector;
