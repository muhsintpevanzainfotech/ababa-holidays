import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Monitor, Tablet, Smartphone, Maximize2, MousePointer2 } from 'lucide-react';

const Canvas = ({ 
  nodes, edges, onNodesChange, onEdgesChange, onConnect, 
  onInit, onDrop, onDragOver, viewportMode, setViewportMode,
  selectedNode, zoomEnabled
}) => {
  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080810] relative overflow-hidden">

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12">
        <TransformWrapper
          initialScale={1}
          disabled={!zoomEnabled}
          minScale={0.2}
          maxScale={2}
          centerOnInit
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ 
              width: getViewportWidth(), 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className={`w-full h-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative transition-all duration-500`}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
                className="bg-white"
              >
                <Background color="#f1f5f9" gap={24} size={1} />
                <Controls className="!bg-white !border-slate-100 !shadow-xl !shadow-slate-200/50 !rounded-xl overflow-hidden" />
              </ReactFlow>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};

export default Canvas;
