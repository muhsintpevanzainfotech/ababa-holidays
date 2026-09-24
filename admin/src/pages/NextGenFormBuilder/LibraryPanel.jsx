import React from 'react';
import { Layout, Search, Layers, Plus, GripVertical } from 'lucide-react';

const LibraryPanel = ({ componentLibrary, sectionTemplates, activeTab }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-6 border-b border-slate-50">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
          {activeTab === 'library' ? <Layers size={16} /> : <Layout size={16} />}
          {activeTab === 'library' ? 'Blueprint Assets' : 'Structural Templates'}
        </h3>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-500" size={16} />
          <input 
            type="text" 
            placeholder={activeTab === 'library' ? "Search components..." : "Search templates..."}
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-[13px] font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {activeTab === 'library' ? (
          <div className="space-y-8">
            {['Design Tools', 'Selection', 'Advanced ERP'].map(cat => (
              <div key={cat}>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{cat}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {componentLibrary.filter(c => c.category === cat).map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow', item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className="group p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-grab hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-violet-600 transition-colors">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sectionTemplates.map(template => (
              <div 
                key={template.id}
                className="group relative h-32 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-violet-500 transition-all"
              >
                <img src={template.preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={template.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">{template.category}</span>
                  <p className="text-xs font-bold text-white">{template.label}</p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPanel;
