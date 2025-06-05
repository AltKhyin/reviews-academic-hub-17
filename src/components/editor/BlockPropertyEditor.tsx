
// ABOUTME: Comprehensive block property editor for all block types
// Provides intuitive editing interface for block content and settings

import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate
}) => {
  const updatePayload = (updates: Record<string, any>) => {
    onUpdate({
      payload: { ...block.payload, ...updates }
    });
  };

  const updateMeta = (updates: Record<string, any>) => {
    onUpdate({
      meta: { ...block.meta, ...updates }
    });
  };

  const updateStyles = (updates: Record<string, any>) => {
    onUpdate({
      meta: { 
        ...block.meta, 
        styles: { ...block.meta?.styles, ...updates }
      }
    });
  };

  const renderHeadingEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Heading Text
        </Label>
        <Input
          value={block.payload.text || ''}
          onChange={(e) => updatePayload({ text: e.target.value })}
          placeholder="Enter heading text..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Heading Level
        </Label>
        <Select value={block.payload.level?.toString() || '2'} onValueChange={(value) => updatePayload({ level: parseInt(value) })}>
          <SelectTrigger 
            className="mt-1"
            style={{
              backgroundColor: 'var(--editor-surface-bg)',
              borderColor: 'var(--editor-primary-border)',
              color: 'var(--editor-primary-text)'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1 - Main Title</SelectItem>
            <SelectItem value="2">H2 - Section</SelectItem>
            <SelectItem value="3">H3 - Subsection</SelectItem>
            <SelectItem value="4">H4 - Minor Heading</SelectItem>
            <SelectItem value="5">H5 - Small Heading</SelectItem>
            <SelectItem value="6">H6 - Tiny Heading</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Anchor ID (Optional)
        </Label>
        <Input
          value={block.payload.anchor_id || ''}
          onChange={(e) => updatePayload({ anchor_id: e.target.value })}
          placeholder="custom-anchor-id"
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
        <p className="text-xs text-[var(--editor-muted-text)] mt-1">
          Used for direct linking to this section
        </p>
      </div>

      <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
          Text Styling
        </Label>
        <div className="grid gap-3">
          <ColorPicker 
            label="Text Color"
            value={block.meta?.styles?.color || '#000000'}
            onChange={(value) => updateStyles({ color: value })}
            description="Heading text color"
          />
          <div>
            <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
              Font Weight
            </Label>
            <Select 
              value={block.meta?.styles?.fontWeight || 'bold'} 
              onValueChange={(value) => updateStyles({ fontWeight: value })}
            >
              <SelectTrigger 
                className="mt-1"
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="medium">Medium (500)</SelectItem>
                <SelectItem value="semibold">Semibold (600)</SelectItem>
                <SelectItem value="bold">Bold (700)</SelectItem>
                <SelectItem value="extrabold">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
              Text Alignment
            </Label>
            <Select 
              value={block.meta?.styles?.textAlign || 'left'} 
              onValueChange={(value) => updateStyles({ textAlign: value })}
            >
              <SelectTrigger 
                className="mt-1"
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParagraphEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Content
        </Label>
        <Textarea
          value={block.payload.content?.replace(/<[^>]*>/g, '') || ''}
          onChange={(e) => updatePayload({ content: `<p>${e.target.value}</p>` })}
          placeholder="Enter paragraph content..."
          className="mt-1 min-h-[120px]"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
          Text Styling
        </Label>
        <div className="grid gap-3">
          <ColorPicker 
            label="Text Color"
            value={block.meta?.styles?.color || '#000000'}
            onChange={(value) => updateStyles({ color: value })}
            description="Paragraph text color"
          />
          <div>
            <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
              Font Size
            </Label>
            <Select 
              value={block.meta?.styles?.fontSize || 'base'} 
              onValueChange={(value) => updateStyles({ fontSize: value })}
            >
              <SelectTrigger 
                className="mt-1"
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small (14px)</SelectItem>
                <SelectItem value="base">Regular (16px)</SelectItem>
                <SelectItem value="lg">Large (18px)</SelectItem>
                <SelectItem value="xl">Extra Large (20px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
              Line Height
            </Label>
            <Select 
              value={block.meta?.styles?.lineHeight || 'relaxed'} 
              onValueChange={(value) => updateStyles({ lineHeight: value })}
            >
              <SelectTrigger 
                className="mt-1"
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight (1.25)</SelectItem>
                <SelectItem value="normal">Normal (1.5)</SelectItem>
                <SelectItem value="relaxed">Relaxed (1.625)</SelectItem>
                <SelectItem value="loose">Loose (2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSnapshotCardEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Population
        </Label>
        <Input
          value={block.payload.population || ''}
          onChange={(e) => updatePayload({ population: e.target.value })}
          placeholder="Target population..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Intervention
        </Label>
        <Input
          value={block.payload.intervention || ''}
          onChange={(e) => updatePayload({ intervention: e.target.value })}
          placeholder="Intervention details..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Outcome
        </Label>
        <Input
          value={block.payload.outcome || ''}
          onChange={(e) => updatePayload({ outcome: e.target.value })}
          placeholder="Primary outcome..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Evidence Level
        </Label>
        <Select value={block.payload.evidence_level || 'moderate'} onValueChange={(value) => updatePayload({ evidence_level: value })}>
          <SelectTrigger 
            className="mt-1"
            style={{
              backgroundColor: 'var(--editor-surface-bg)',
              borderColor: 'var(--editor-primary-border)',
              color: 'var(--editor-primary-text)'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Quality</SelectItem>
            <SelectItem value="moderate">Moderate Quality</SelectItem>
            <SelectItem value="low">Low Quality</SelectItem>
            <SelectItem value="very_low">Very Low Quality</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
          Card Styling
        </Label>
        <div className="grid gap-3">
          <ColorPicker 
            label="Background Color"
            value={block.meta?.styles?.backgroundColor || '#ffffff'}
            onChange={(value) => updateStyles({ backgroundColor: value })}
            description="Card background color"
          />
          <ColorPicker 
            label="Border Color"
            value={block.meta?.styles?.borderColor || '#e5e7eb'}
            onChange={(value) => updateStyles({ borderColor: value })}
            description="Card border color"
          />
        </div>
      </div>
    </div>
  );

  const renderFigureEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Image URL
        </Label>
        <Input
          value={block.payload.image_url || ''}
          onChange={(e) => updatePayload({ image_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Caption
        </Label>
        <Input
          value={block.payload.caption || ''}
          onChange={(e) => updatePayload({ caption: e.target.value })}
          placeholder="Figure caption..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Alt Text
        </Label>
        <Input
          value={block.payload.alt_text || ''}
          onChange={(e) => updatePayload({ alt_text: e.target.value })}
          placeholder="Alternative text for accessibility..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
    </div>
  );

  const renderCalloutEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Callout Type
        </Label>
        <Select value={block.payload.type || 'info'} onValueChange={(value) => updatePayload({ type: value })}>
          <SelectTrigger 
            className="mt-1"
            style={{
              backgroundColor: 'var(--editor-surface-bg)',
              borderColor: 'var(--editor-primary-border)',
              color: 'var(--editor-primary-text)'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Information</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Title
        </Label>
        <Input
          value={block.payload.title || ''}
          onChange={(e) => updatePayload({ title: e.target.value })}
          placeholder="Callout title..."
          className="mt-1"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Content
        </Label>
        <Textarea
          value={block.payload.content || ''}
          onChange={(e) => updatePayload({ content: e.target.value })}
          placeholder="Callout content..."
          className="mt-1 min-h-[80px]"
          style={{
            backgroundColor: 'var(--editor-surface-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
        />
      </div>
    </div>
  );

  const renderGenericEditor = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Badge variant="outline" className="mb-2">
          {block.type.replace('_', ' ').toUpperCase()}
        </Badge>
        <p className="text-sm text-[var(--editor-muted-text)]">
          Advanced editing for this block type is coming soon.
        </p>
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (block.type) {
      case 'heading':
        return renderHeadingEditor();
      case 'paragraph':
        return renderParagraphEditor();
      case 'snapshot_card':
        return renderSnapshotCardEditor();
      case 'figure':
        return renderFigureEditor();
      case 'callout':
        return renderCalloutEditor();
      default:
        return renderGenericEditor();
    }
  };

  return (
    <div className="space-y-6">
      {/* Block Info */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" style={{
          backgroundColor: 'var(--editor-card-bg)',
          borderColor: 'var(--editor-primary-border)',
          color: 'var(--editor-primary-text)'
        }}>
          {block.type.replace('_', ' ')}
        </Badge>
        <span className="text-xs text-[var(--editor-muted-text)]">
          ID: {block.id}
        </span>
      </div>

      {/* Main Editor */}
      {renderEditor()}

      {/* Visibility Toggle */}
      <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />
      
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
            Visibility
          </Label>
          <p className="text-xs text-[var(--editor-muted-text)]">
            Show this block in the published review
          </p>
        </div>
        <Switch
          checked={block.visible}
          onCheckedChange={(checked) => onUpdate({ visible: checked })}
        />
      </div>
    </div>
  );
};
