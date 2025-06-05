// ABOUTME: Comprehensive block property editor for all block types
// Provides intuitive editing interface for block content and settings

import React, { useState } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Calendar } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate
}) => {
  const [newTableRow, setNewTableRow] = useState<string[]>([]);
  const [newPollOption, setNewPollOption] = useState('');

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

  const renderTableEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Table Caption
        </Label>
        <Input
          value={block.payload.caption || ''}
          onChange={(e) => updatePayload({ caption: e.target.value })}
          placeholder="Table caption (optional)..."
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
          Headers
        </Label>
        <div className="mt-1 space-y-2">
          {(block.payload.headers || []).map((header: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={header}
                onChange={(e) => {
                  const newHeaders = [...(block.payload.headers || [])];
                  newHeaders[index] = e.target.value;
                  updatePayload({ headers: newHeaders });
                }}
                placeholder={`Header ${index + 1}`}
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newHeaders = (block.payload.headers || []).filter((_: any, i: number) => i !== index);
                  const newRows = (block.payload.rows || []).map((row: string[]) => row.filter((_: any, i: number) => i !== index));
                  updatePayload({ headers: newHeaders, rows: newRows });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newHeaders = [...(block.payload.headers || []), `Column ${(block.payload.headers || []).length + 1}`];
              const newRows = (block.payload.rows || []).map((row: string[]) => [...row, '']);
              updatePayload({ headers: newHeaders, rows: newRows });
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Column
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Table Data
        </Label>
        <div className="mt-1 space-y-2 max-h-60 overflow-y-auto">
          {(block.payload.rows || []).map((row: string[], rowIndex: number) => (
            <div key={rowIndex} className="flex gap-2 items-center">
              <span className="text-xs text-[var(--editor-muted-text)] w-8">{rowIndex + 1}</span>
              {row.map((cell: string, cellIndex: number) => (
                <Input
                  key={cellIndex}
                  value={cell}
                  onChange={(e) => {
                    const newRows = [...(block.payload.rows || [])];
                    newRows[rowIndex][cellIndex] = e.target.value;
                    updatePayload({ rows: newRows });
                  }}
                  placeholder={`Cell ${cellIndex + 1}`}
                  className="flex-1"
                  style={{
                    backgroundColor: 'var(--editor-surface-bg)',
                    borderColor: 'var(--editor-primary-border)',
                    color: 'var(--editor-primary-text)'
                  }}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRows = (block.payload.rows || []).filter((_: any, i: number) => i !== rowIndex);
                  updatePayload({ rows: newRows });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const columnCount = (block.payload.headers || []).length || 1;
              const newRow = new Array(columnCount).fill('');
              const newRows = [...(block.payload.rows || []), newRow];
              updatePayload({ rows: newRows });
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
            Enable Sorting
          </Label>
          <p className="text-xs text-[var(--editor-muted-text)]">
            Allow users to sort table columns
          </p>
        </div>
        <Switch
          checked={block.payload.sortable || false}
          onCheckedChange={(checked) => updatePayload({ sortable: checked })}
        />
      </div>
    </div>
  );

  const renderPollEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Poll Question
        </Label>
        <Textarea
          value={block.payload.question || ''}
          onChange={(e) => updatePayload({ question: e.target.value })}
          placeholder="What would you like to ask?"
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
          Poll Type
        </Label>
        <Select 
          value={block.payload.poll_type || 'single_choice'} 
          onValueChange={(value) => updatePayload({ poll_type: value })}
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
            <SelectItem value="single_choice">Single Choice</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="rating">Rating Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Poll Options
        </Label>
        <div className="mt-1 space-y-2">
          {(block.payload.options || []).map((option: any, index: number) => (
            <div key={option.id || index} className="flex gap-2">
              <Input
                value={option.text || ''}
                onChange={(e) => {
                  const newOptions = [...(block.payload.options || [])];
                  newOptions[index] = { ...option, text: e.target.value };
                  updatePayload({ options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = (block.payload.options || []).filter((_: any, i: number) => i !== index);
                  updatePayload({ options: newOptions });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newPollOption}
              onChange={(e) => setNewPollOption(e.target.value)}
              placeholder="New option text..."
              style={{
                backgroundColor: 'var(--editor-surface-bg)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (newPollOption.trim()) {
                  const newOptions = [...(block.payload.options || []), {
                    id: `option_${Date.now()}`,
                    text: newPollOption.trim(),
                    votes: 0
                  }];
                  updatePayload({ options: newOptions });
                  setNewPollOption('');
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
            Poll Status
          </Label>
          <p className="text-xs text-[var(--editor-muted-text)]">
            Open polls allow new votes
          </p>
        </div>
        <Switch
          checked={block.payload.is_open !== false}
          onCheckedChange={(checked) => updatePayload({ is_open: checked })}
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Close Date (Optional)
        </Label>
        <Input
          type="datetime-local"
          value={block.payload.closes_at ? new Date(block.payload.closes_at).toISOString().slice(0, 16) : ''}
          onChange={(e) => updatePayload({ closes_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
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

  const renderNumberCardEditor = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Number Value
        </Label>
        <Input
          value={block.payload.number || ''}
          onChange={(e) => updatePayload({ number: e.target.value })}
          placeholder="123 or 45.6%"
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
          Label
        </Label>
        <Input
          value={block.payload.label || ''}
          onChange={(e) => updatePayload({ label: e.target.value })}
          placeholder="What this number represents..."
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
          Description
        </Label>
        <Textarea
          value={block.payload.description || ''}
          onChange={(e) => updatePayload({ description: e.target.value })}
          placeholder="Additional context or explanation..."
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
          Trend
        </Label>
        <Select 
          value={block.payload.trend || 'neutral'} 
          onValueChange={(value) => updatePayload({ trend: value })}
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
            <SelectItem value="up">Trending Up</SelectItem>
            <SelectItem value="down">Trending Down</SelectItem>
            <SelectItem value="neutral">Neutral/Stable</SelectItem>
            <SelectItem value="">No Trend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
          Percentage Change (Optional)
        </Label>
        <Input
          type="number"
          value={block.payload.percentage || ''}
          onChange={(e) => updatePayload({ percentage: e.target.value ? parseFloat(e.target.value) : undefined })}
          placeholder="5.2 (for +5.2%)"
          className="mt-1"
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
          Card Styling
        </Label>
        <div className="grid gap-3">
          <ColorPicker 
            label="Background Color"
            value={block.meta?.styles?.backgroundColor || '#f0f9ff'}
            onChange={(value) => updateStyles({ backgroundColor: value })}
            description="Card background color"
          />
          <ColorPicker 
            label="Number Color"
            value={block.meta?.styles?.numberColor || '#1e40af'}
            onChange={(value) => updateStyles({ numberColor: value })}
            description="Main number text color"
          />
          <ColorPicker 
            label="Label Color"
            value={block.meta?.styles?.labelColor || '#374151'}
            onChange={(value) => updateStyles({ labelColor: value })}
            description="Label text color"
          />
        </div>
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
          This block type is supported but advanced editing options are still being developed.
        </p>
        <p className="text-xs text-[var(--editor-muted-text)] mt-2">
          You can still use this block in your review and customize basic visibility settings below.
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
      case 'table':
        return renderTableEditor();
      case 'poll':
        return renderPollEditor();
      case 'number_card':
        return renderNumberCardEditor();
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

// Helper functions for the existing editors that were abbreviated above
const renderHeadingEditor = () => {
  // ... keep existing code (renderHeadingEditor implementation) the same ...
};

const renderParagraphEditor = () => {
  // ... keep existing code (renderParagraphEditor implementation) the same ...
};

const renderSnapshotCardEditor = () => {
  // ... keep existing code (renderSnapshotCardEditor implementation) the same ...
};

const renderFigureEditor = () => {
  // ... keep existing code (renderFigureEditor implementation) the same ...
};

const renderCalloutEditor = () => {
  // ... keep existing code (renderCalloutEditor implementation) the same ...
};
