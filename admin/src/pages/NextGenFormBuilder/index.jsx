import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { applyEdgeChanges, applyNodeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import '../../next-gen-builder.css';

import { 
  ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, Rocket,
  Sparkles, Layout, Layers, Workflow, X, Send, Plus, Zap, History, Play
} from 'lucide-react';

import AIPanel from './AIPanel';
import LibraryPanel from './LibraryPanel';
import Canvas from './Canvas';
import AttributeInspector from './AttributeInspector';
import TopBar from './TopBar';

const COMPONENT_LIBRARY = [
  { id: 'text', label: 'Text Input', category: 'Design Tools' },
  { id: 'number', label: 'Number', category: 'Design Tools' },
  { id: 'textarea', label: 'Textarea', category: 'Design Tools' },
  { id: 'editor', label: 'HTML Editor', category: 'Design Tools' },
  { id: 'email', label: 'Email', category: 'Design Tools' },
  { id: 'phone', label: 'Phone Number', category: 'Design Tools' },
  { id: 'dropdown', label: 'Dropdown', category: 'Selection' },
  { id: 'checkbox', label: 'Checkbox', category: 'Selection' },
  { id: 'radio', label: 'Radio Group', category: 'Selection' },
  { id: 'toggle', label: 'Toggle Switch', category: 'Selection' },
  { id: 'otp', label: 'OTP Protocol', category: 'Advanced ERP' },
  { id: 'location', label: 'Geospatial', category: 'Advanced ERP' },
  { id: 'payment', label: 'Payment Gateway', category: 'Advanced ERP' },
  { id: 'upload', label: 'Secure Upload', category: 'Advanced ERP' },
  { id: 'date', label: 'Calendar Sync', category: 'Advanced ERP' },
];

const SECTION_TEMPLATES = [
  { id: 'hero', label: 'Hero Architecture', preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop', category: 'Landing' },
  { id: 'features', label: 'Feature Matrix', preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=200&auto=format&fit=crop', category: 'Content' },
  { id: 'pricing', label: 'Value Tiers', preview: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=200&auto=format&fit=crop', category: 'Commerce' },
];

const NextGenFormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSideTab, setActiveSideTab] = useState('ai');
  const [activeSidePanel, setActiveSidePanel] = useState('library');
  const [viewportMode, setViewportMode] = useState('desktop');
  const [zoomEnabled, setZoomEnabled] = useState(true);

  // Handlers
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = reactFlowInstance.project({
      x: event.clientX - 300,
      y: event.clientY - 100,
    });

    const newNode = {
      id: `${type}-${nodes.length + 1}`,
      type: 'default',
      position,
      data: { label: `${type.toUpperCase()} Component` },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, nodes]);

  const onUpdateNode = (nodeId, data) => {
    setNodes(nds => nds.map(node => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node));
  };

  const onDeleteNode = (nodeId) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setSelectedNode(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0f0f1a] flex flex-col overflow-hidden text-slate-200 pt-16">
      <TopBar 
        activeView={viewportMode} 
        setActiveView={setViewportMode}
        title="Select Service"
        idText={`ID: SER-${id || '82918'}`}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: ICON NAV */}
        <nav className="w-20 bg-[#0f0f1a] border-r border-gray-800 flex flex-col items-center py-8 gap-8 z-40">
          {[
            { id: 'ai', icon: <Sparkles size={20} />, label: 'AI' },
            { id: 'library', icon: <Layers size={20} />, label: 'LIB' },
            { id: 'history', icon: <History size={20} />, label: 'LOG' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSideTab(tab.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                activeSideTab === tab.id 
                  ? 'bg-purple-600/20 text-purple-400 shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </nav>

        {/* PANEL 2: DYNAMIC PANEL */}
        <aside className="w-96 bg-[#0f0f1a] border-r border-gray-800 z-30 shadow-2xl shadow-black/20">
          {activeSideTab === 'ai' ? <AIPanel /> : <LibraryPanel componentLibrary={COMPONENT_LIBRARY} sectionTemplates={SECTION_TEMPLATES} activeTab={activeSidePanel} />}
        </aside>

        {/* PANEL 3: CANVAS */}
        <main className="flex-1 bg-slate-50 relative">
          <Canvas 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            viewportMode={viewportMode}
            setViewportMode={setViewportMode}
            selectedNode={selectedNode}
            zoomEnabled={zoomEnabled}
          />
        </main>

        {/* PANEL 4: INSPECTOR */}
        <aside className="w-96 bg-[#0f0f1a] border-l border-gray-800 z-30">
          <AttributeInspector 
            selectedNode={selectedNode} 
            onUpdateNode={onUpdateNode}
            onDeleteNode={onDeleteNode}
          />
        </aside>
      </div>
    </div>
  );
};

export default NextGenFormBuilder;
