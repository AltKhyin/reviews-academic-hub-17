// ABOUTME: Export functionality for diagrams in multiple formats
// Fixed to handle optional title property

import React, { useState } from 'react';
import { DiagramContent } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileImage, FileText } from 'lucide-react';

interface DiagramExporterProps {
  content: DiagramContent;
  onClose: () => void;
}

export const DiagramExporter: React.FC<DiagramExporterProps> = ({
  content,
  onClose
}) => {
  const [format, setFormat] = useState<'svg' | 'png' | 'pdf'>('svg');
  const [quality, setQuality] = useState(1);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [customSize, setCustomSize] = useState({ width: content.canvas.width, height: content.canvas.height });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create SVG element from diagram content
      const svgContent = generateSVGContent();
      
      switch (format) {
        case 'svg':
          downloadSVG(svgContent);
          break;
        case 'png':
          await downloadPNG(svgContent);
          break;
        case 'pdf':
          await downloadPDF(svgContent);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateSVGContent = (): string => {
    const { width, height } = customSize;
    const backgroundColor = transparentBackground ? 'transparent' : content.canvas.backgroundColor;
    
    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    if (!transparentBackground) {
      svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    }
    
    // Grid (if enabled and not transparent)
    if (content.canvas.gridEnabled && !transparentBackground) {
      const gridSize = content.canvas.gridSize;
      svgContent += '<defs><pattern id="grid" width="' + gridSize + '" height="' + gridSize + '" patternUnits="userSpaceOnUse">';
      svgContent += '<path d="M ' + gridSize + ' 0 L 0 0 0 ' + gridSize + '" fill="none" stroke="' + content.canvas.gridColor + '" stroke-width="0.5" opacity="0.5"/>';
      svgContent += '</pattern></defs>';
      svgContent += '<rect width="100%" height="100%" fill="url(#grid)"/>';
    }
    
    // Connections
    content.connections.forEach(connection => {
      const sourceNode = content.nodes.find(n => n.id === connection.sourceNodeId);
      const targetNode = content.nodes.find(n => n.id === connection.targetNodeId);
      
      if (sourceNode && targetNode) {
        // Add connection SVG (simplified for export)
        const sourcePoint = getNodeConnectionPoint(sourceNode, connection.sourcePoint);
        const targetPoint = getNodeConnectionPoint(targetNode, connection.targetPoint);
        
        svgContent += `<line x1="${sourcePoint.x}" y1="${sourcePoint.y}" x2="${targetPoint.x}" y2="${targetPoint.y}" 
          stroke="${connection.style.strokeColor}" stroke-width="${connection.style.strokeWidth}" 
          opacity="${connection.style.opacity}"/>`;
      }
    });
    
    // Nodes
    content.nodes.forEach(node => {
      svgContent += generateNodeSVG(node);
    });
    
    svgContent += '</svg>';
    return svgContent;
  };

  const generateNodeSVG = (node: any): string => {
    const { position, size, style, text } = node;
    let nodeSVG = '';
    
    // Shape
    switch (node.type) {
      case 'rectangle':
        nodeSVG += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" 
          fill="${style.backgroundColor}" stroke="${style.borderColor}" stroke-width="${style.borderWidth}" 
          opacity="${style.opacity}"/>`;
        break;
      case 'circle':
        const radius = Math.min(size.width, size.height) / 2;
        const cx = position.x + size.width / 2;
        const cy = position.y + size.height / 2;
        nodeSVG += `<circle cx="${cx}" cy="${cy}" r="${radius}" 
          fill="${style.backgroundColor}" stroke="${style.borderColor}" stroke-width="${style.borderWidth}" 
          opacity="${style.opacity}"/>`;
        break;
      // Add other shapes as needed
    }
    
    // Text
    const textX = position.x + size.width / 2;
    const textY = position.y + size.height / 2;
    nodeSVG += `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" 
      fill="${style.textColor}" font-size="${style.fontSize}" font-weight="${style.fontWeight}">${text}</text>`;
    
    return nodeSVG;
  };

  const getNodeConnectionPoint = (node: any, point: string): { x: number; y: number } => {
    const { position, size } = node;
    
    switch (point) {
      case 'top':
        return { x: position.x + size.width / 2, y: position.y };
      case 'right':
        return { x: position.x + size.width, y: position.y + size.height / 2 };
      case 'bottom':
        return { x: position.x + size.width / 2, y: position.y + size.height };
      case 'left':
        return { x: position.x, y: position.y + size.height / 2 };
      default:
        return { x: position.x + size.width / 2, y: position.y + size.height / 2 };
    }
  };

  const downloadSVG = (svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.title || 'diagram'}.svg`; // Fixed: handle optional title
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async (svgContent: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = customSize.width * quality;
    canvas.height = customSize.height * quality;

    const img = new Image();
    img.onload = () => {
      if (!transparentBackground) {
        ctx.fillStyle = content.canvas.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${content.title || 'diagram'}.png`; // Fixed: handle optional title
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };

    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
  };

  const downloadPDF = async (svgContent: string) => {
    // For PDF export, we would need a library like jsPDF
    // For now, we'll export as SVG and suggest using a PDF converter
    downloadSVG(svgContent);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#ffffff' }}>Exportar Diagrama</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label style={{ color: '#d1d5db' }}>Formato</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    SVG (Vetor)
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    PNG (Imagem)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF (Documento)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label style={{ color: '#d1d5db' }}>Largura</Label>
              <Input
                type="number"
                value={customSize.width}
                onChange={(e) => setCustomSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                min="100"
                max="5000"
              />
            </div>
            <div>
              <Label style={{ color: '#d1d5db' }}>Altura</Label>
              <Input
                type="number"
                value={customSize.height}
                onChange={(e) => setCustomSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                min="100"
                max="5000"
              />
            </div>
          </div>

          {/* Quality (for PNG) */}
          {format === 'png' && (
            <div>
              <Label style={{ color: '#d1d5db' }}>Qualidade (Escala)</Label>
              <Select value={quality.toString()} onValueChange={(value) => setQuality(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (Normal)</SelectItem>
                  <SelectItem value="2">2x (Alta)</SelectItem>
                  <SelectItem value="3">3x (Muito Alta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Transparent Background */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transparent"
              checked={transparentBackground}
              onCheckedChange={(checked) => setTransparentBackground(!!checked)}
            />
            <Label htmlFor="transparent" style={{ color: '#d1d5db' }}>
              Fundo transparente
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
