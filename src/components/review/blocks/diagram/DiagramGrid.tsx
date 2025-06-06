
// ABOUTME: Grid background component for diagram canvas
// Provides visual alignment guides and snap-to-grid functionality

import React from 'react';

interface DiagramGridProps {
  size: number;
  color: string;
  viewBox: { x: number; y: number; width: number; height: number };
}

export const DiagramGrid: React.FC<DiagramGridProps> = ({
  size,
  color,
  viewBox
}) => {
  const startX = Math.floor(viewBox.x / size) * size;
  const startY = Math.floor(viewBox.y / size) * size;
  const endX = Math.ceil((viewBox.x + viewBox.width) / size) * size;
  const endY = Math.ceil((viewBox.y + viewBox.height) / size) * size;

  const verticalLines = [];
  const horizontalLines = [];

  // Generate vertical lines
  for (let x = startX; x <= endX; x += size) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={startY}
        x2={x}
        y2={endY}
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
      />
    );
  }

  // Generate horizontal lines
  for (let y = startY; y <= endY; y += size) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
      />
    );
  }

  return (
    <g className="diagram-grid">
      {verticalLines}
      {horizontalLines}
    </g>
  );
};
