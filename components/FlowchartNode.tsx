
import React from 'react';
import { NodeType, FlowNode } from '../types';
import { BLOCK_TEMPLATES } from '../constants';

interface FlowchartNodeProps {
  node: FlowNode;
  isActive: boolean;
  onRemove: (id: string) => void;
  onStartConnection: (nodeId: string, type: 'next' | 'yes' | 'no') => void;
  onDropConnection: (nodeId: string) => void;
}

const FlowchartNode: React.FC<FlowchartNodeProps> = ({ node, isActive, onRemove, onStartConnection, onDropConnection }) => {
  const template = BLOCK_TEMPLATES.find(t => t.type === node.type);
  const isCondition = node.type === NodeType.CONDITION || node.type === NodeType.MANA_CONDITION;

  return (
    <div 
      className={`relative rounded-xl border-2 border-slate-900 flex items-center justify-center transition-all duration-300 group shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] ${node.color} ${isActive ? 'ring-4 ring-indigo-500 scale-105 brightness-110' : ''}`}
      style={{ width: isCondition ? 140 : 160, height: isCondition ? 140 : 56, transform: isCondition ? 'rotate(45deg)' : 'none' }}
      onMouseUp={() => onDropConnection(node.id)}
    >
      <div className={`flex items-center text-xs font-black tracking-tighter text-slate-900 select-none ${isCondition ? '-rotate-45' : ''}`}>
        {!isCondition && template?.icon}
        {node.label}
      </div>

      {/* Ports - Normal Node */}
      {!isCondition && node.type !== NodeType.VICTORY && (
        <div 
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform z-20"
          onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, 'next'); }}
          title="拉出连线"
        />
      )}

      {/* Ports - Condition Node */}
      {isCondition && (
        <>
          {/* Yes Port (Green) */}
          <div 
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform z-20 flex items-center justify-center shadow-sm"
            onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, 'yes'); }}
          >
            <div className="-rotate-45 text-[8px] text-white font-bold">Y</div>
          </div>
          {/* No Port (Red) */}
          <div 
            className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-5 h-5 bg-rose-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform z-20 flex items-center justify-center shadow-sm"
            onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, 'no'); }}
          >
            <div className="-rotate-45 text-[8px] text-white font-bold">N</div>
          </div>
        </>
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
        className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] border border-white z-30"
      >
        ×
      </button>
    </div>
  );
};

export default FlowchartNode;
