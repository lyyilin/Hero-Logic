import React, { useMemo, useState, useRef, useEffect } from 'react';
import { FlowNode, NodeType } from '../types';
import FlowchartNode from './FlowchartNode';

interface FlowchartCanvasProps {
  nodes: FlowNode[];
  onRemoveNode: (id: string) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onConnect: (fromId: string, toId: string, type: 'next' | 'yes' | 'no') => void;
  activeNodeId: string | null;
}

const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({ nodes, onRemoveNode, onUpdateNodePosition, onConnect, activeNodeId }) => {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<{ fromId: string; type: 'next' | 'yes' | 'no'; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDraggingNode(nodeId);
    dragOffset.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggingNode) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      onUpdateNodePosition(draggingNode, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setActiveLink(null);
  };

  const handleStartConnection = (nodeId: string, type: 'next' | 'yes' | 'no') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    let startX = node.x + 160;
    let startY = node.y + 28;
    if (node.type === NodeType.CONDITION || node.type === NodeType.MANA_CONDITION) {
      if (type === 'yes') {
        startX = node.x + 120;
        startY = node.y + 70;
      } else {
        startX = node.x + 70;
        startY = node.y + 120;
      }
    }

    setActiveLink({ fromId: nodeId, type, x: startX, y: startY });
  };

  const handleDropConnection = (toId: string) => {
    if (activeLink && activeLink.fromId !== toId) {
      onConnect(activeLink.fromId, toId, activeLink.type);
    }
    setActiveLink(null);
  };

  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    
    nodes.forEach(node => {
      const isCond = node.type === NodeType.CONDITION || node.type === NodeType.MANA_CONDITION;
      
      const renderLink = (toId: string | undefined, type: 'next' | 'yes' | 'no') => {
        if (!toId) return;
        const target = nodes.find(n => n.id === toId);
        if (!target) return;

        let startX, startY;
        if (isCond) {
          if (type === 'yes') { startX = node.x + 120; startY = node.y + 70; }
          else { startX = node.x + 70; startY = node.y + 120; }
        } else {
          startX = node.x + 160; startY = node.y + 28;
        }

        const targetX = target.x;
        const targetY = target.y + (target.type === NodeType.CONDITION || target.type === NodeType.MANA_CONDITION ? 70 : 28);
        
        const cp1x = startX + (targetX - startX) / 2;
        const cp2x = startX + (targetX - startX) / 2;
        
        const color = type === 'yes' ? '#10b981' : (type === 'no' ? '#f43f5e' : '#6366f1');
        const glowColor = type === 'yes' ? 'rgba(16,185,129,0.4)' : (type === 'no' ? 'rgba(244,63,94,0.4)' : 'rgba(99,102,241,0.4)');

        lines.push(
          <g key={`${node.id}-${type}`}>
            <path 
              d={`M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${targetY}, ${targetX} ${targetY}`} 
              stroke={glowColor} strokeWidth="6" fill="none" strokeLinecap="round" style={{ filter: 'blur(4px)' }}
            />
            <path 
              d={`M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${targetY}, ${targetX} ${targetY}`} 
              stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" className="drop-shadow-sm"
            />
            <circle cx={targetX} cy={targetY} r="5" fill={color} className="shadow-lg shadow-black" />
          </g>
        );
      };

      if (isCond) {
        renderLink(node.yesId, 'yes');
        renderLink(node.noId, 'no');
      } else {
        renderLink(node.nextId, 'next');
      }
    });
    
    return lines;
  }, [nodes]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 h-full relative grid-bg overflow-auto p-12 cursor-default select-none border-t border-slate-800"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
        {connections}
        {activeLink && (
          <path 
            d={`M ${activeLink.x} ${activeLink.y} L ${mousePos.x} ${mousePos.y}`} 
            stroke="#6366f1" strokeWidth="2" strokeDasharray="8" fill="none" opacity="0.6"
          />
        )}
      </svg>
      
      {nodes.map(node => (
        <div 
          key={node.id} 
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          className="absolute z-10"
          style={{ left: node.x, top: node.y }}
        >
          <FlowchartNode 
            node={node} 
            onRemove={onRemoveNode}
            isActive={activeNodeId === node.id}
            onStartConnection={handleStartConnection}
            onDropConnection={handleDropConnection}
          />
        </div>
      ))}
      
      {nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-700 font-black opacity-20 pointer-events-none">
          <div className="text-8xl mb-6">🚀</div>
          <p className="text-xl tracking-[0.2em] uppercase">Ready for Programming Logic</p>
          <p className="text-sm mt-2">Add components from the library to start building</p>
        </div>
      )}
    </div>
  );
};

export default FlowchartCanvas;