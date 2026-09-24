import React from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Sparkles, 
  Maximize2 
} from 'lucide-react';

const TopBar = ({ 
  activeView = 'desktop', 
  setActiveView, 
  title = "Select Service", 
  idText = "ID: SER-82918" 
}) => {
  
  const handlePublish = () => {
    console.log("Publishing...");
  };

  const viewControls = [
    { id: 'desktop', icon: Monitor, label: 'Desktop View' },
    { id: 'tablet', icon: Tablet, label: 'Tablet View' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile View' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-gray-800 z-[100] flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-transparent hover:border-gray-700 group"
          title="Go Back"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-white tracking-tight leading-tight">{title}</h1>
          <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">{idText}</span>
        </div>
      </div>

      {/* Center Section - View Controls */}
      <div className="hidden md:flex items-center bg-black/40 p-1 rounded-xl border border-gray-800/50">
        {viewControls.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`relative flex items-center justify-center w-10 h-9 rounded-lg transition-all duration-300 group ${
                isActive 
                  ? 'bg-purple-600/20 text-purple-400 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
              title={view.label}
            >
              <Icon size={18} className={isActive ? 'scale-110' : ''} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 border-r border-gray-800 pr-2 sm:pr-4 mr-1 sm:mr-2">
          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            title="Preview"
          >
            <Eye size={18} />
          </button>
          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-purple-400 transition-all group"
            title="AI Edit"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-white transition-all hidden sm:flex"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        
        <button 
          onClick={handlePublish}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 sm:px-7 py-2 rounded-full text-[11px] font-black tracking-widest uppercase shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.03] active:scale-[0.97] group"
        >
          <span className="relative z-10">Publish</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
