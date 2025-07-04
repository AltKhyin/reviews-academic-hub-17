
// ABOUTME: Custom node component for React Flow diagrams
// Renders different shapes and styles based on node data

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { DiagramNodeData } from '@/types/review';

const CustomNode: React.FC<NodeProps> = ({ data, selected, dragging }) => {
  const nodeData = data as DiagramNodeData;
  const nodeType = nodeData.type || 'rectangle';
  const label = nodeData.label || 'Node';
  const color = nodeData.color || '#777';

  const style: React.CSSProperties = {
    padding: '10px 15px',
    border: `2px solid ${selected ? '#2563eb' : color}`,
    borderRadius: nodeType === 'circle' ? '50%' : '8px',
    background: dragging ? '#f0f0f0' : '#fff',
    color: '#333',
    minWidth: nodeData.width || 120,
    minHeight: nodeData.height || 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '12px',
  };

  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div>{label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

export default memo(CustomNode);
