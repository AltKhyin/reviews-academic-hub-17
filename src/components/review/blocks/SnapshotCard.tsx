// ABOUTME: Snapshot card block for displaying key metrics and information.
// Provides a structured way to present data points in review content.

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SnapshotCardContent, ReviewBlock } from '@/types/review';
import { Trash2, Edit3, TrendingUp, TrendingDown, Minus, Image as ImageIcon, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  block: ReviewBlock; // ReviewBlock already has string ID
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  isActive: boolean;
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
};

export const SnapshotCardBlock: React.FC<SnapshotCardProps> = ({ block, onUpdateBlock, onDeleteBlock, isActive }) => {
  const content = block.content as SnapshotCardContent || {};
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (field: keyof SnapshotCardContent, value: any) => {
    onUpdateBlock(block.id, { content: { ...content, [field]: value } });
  };
  
  const handleMetricChange = (index: number, field: 'label' | 'value' | 'unit', value: string) => {
    const updatedMetrics = [...(content.metrics || [])];
    if (updatedMetrics[index]) {
      updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
      handleContentChange('metrics', updatedMetrics);
    }
  };

  const addMetric = () => {
    const newMetric = { label: 'New Metric', value: '0', unit: '' };
    handleContentChange('metrics', [...(content.metrics || []), newMetric]);
  };

  const removeMetric = (index: number) => {
    const updatedMetrics = (content.metrics || []).filter((_, i) => i !== index);
    handleContentChange('metrics', updatedMetrics);
  };

  if (isEditing) {
    return (
      <Card className={cn("snapshot-card-editor", isActive && "ring-2 ring-blue-500")}>
        <CardHeader className="py-2 px-3 bg-gray-800/50 border-b border-gray-700">
          <CardTitle className="text-base font-medium text-gray-200">Edit Snapshot Card</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3 bg-gray-900/30">
          <div>
            <Label htmlFor={`title-${block.id}`} className="text-xs text-gray-400">Title</Label>
            <Input id={`title-${block.id}`} value={content.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          <div>
            <Label htmlFor={`description-${block.id}`} className="text-xs text-gray-400">Description</Label>
            <Textarea id={`description-${block.id}`} value={content.description || ''} onChange={(e) => handleContentChange('description', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          <div>
            <Label htmlFor={`imageUrl-${block.id}`} className="text-xs text-gray-400">Image URL</Label>
            <Input id={`imageUrl-${block.id}`} value={content.imageUrl || ''} onChange={(e) => handleContentChange('imageUrl', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <h4 className="text-sm font-medium text-gray-300 pt-2 border-t border-gray-700">Metrics</h4>
          {(content.metrics || []).map((metric, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
              <Input placeholder="Label" value={metric.label} onChange={(e) => handleMetricChange(index, 'label', e.target.value)} className="text-xs bg-gray-800 border-gray-700 text-white focus:border-blue-500"/>
              <Input placeholder="Value" value={String(metric.value)} onChange={(e) => handleMetricChange(index, 'value', e.target.value)} className="text-xs bg-gray-800 border-gray-700 text-white focus:border-blue-500"/>
              <Input placeholder="Unit" value={metric.unit || ''} onChange={(e) => handleMetricChange(index, 'unit', e.target.value)} className="text-xs w-20 bg-gray-800 border-gray-700 text-white focus:border-blue-500"/>
              <Button variant="ghost" size="xs" onClick={() => removeMetric(index)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3"/></Button>
            </div>
          ))}
          <Button variant="outline" size="xs" onClick={addMetric} className="text-green-400 border-green-400 hover:bg-green-400/10">Add Metric</Button>

          <div>
            <Label htmlFor={`evidence-${block.id}`} className="text-xs text-gray-400">Evidence Level</Label>
            <Input id={`evidence-${block.id}`} value={content.evidence_level || ''} onChange={(e) => handleContentChange('evidence_level', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`recommendation-${block.id}`} className="text-xs text-gray-400">Recommendation Strength</Label>
            <Input id={`recommendation-${block.id}`} value={content.recommendation_strength || ''} onChange={(e) => handleContentChange('recommendation_strength', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`population-${block.id}`} className="text-xs text-gray-400">Population</Label>
            <Input id={`population-${block.id}`} value={content.population || ''} onChange={(e) => handleContentChange('population', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`intervention-${block.id}`} className="text-xs text-gray-400">Intervention</Label>
            <Input id={`intervention-${block.id}`} value={content.intervention || ''} onChange={(e) => handleContentChange('intervention', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`comparison-${block.id}`} className="text-xs text-gray-400">Comparison</Label>
            <Input id={`comparison-${block.id}`} value={content.comparison || ''} onChange={(e) => handleContentChange('comparison', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`outcome-${block.id}`} className="text-xs text-gray-400">Outcome</Label>
            <Input id={`outcome-${block.id}`} value={content.outcome || ''} onChange={(e) => handleContentChange('outcome', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`design-${block.id}`} className="text-xs text-gray-400">Study Design</Label>
            <Input id={`design-${block.id}`} value={content.design || ''} onChange={(e) => handleContentChange('design', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`key-findings-${block.id}`} className="text-xs text-gray-400">Key Findings (comma separated)</Label>
            <Textarea 
              id={`key-findings-${block.id}`} 
              value={(content.key_findings || []).join(', ')} 
              onChange={(e) => handleContentChange('key_findings', e.target.value.split(',').map(item => item.trim()))} 
              className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" 
            />
          </div>
          
          <div>
            <Label htmlFor={`source-${block.id}`} className="text-xs text-gray-400">Source</Label>
            <Input id={`source-${block.id}`} value={content.source || ''} onChange={(e) => handleContentChange('source', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`subtitle-${block.id}`} className="text-xs text-gray-400">Subtitle</Label>
            <Input id={`subtitle-${block.id}`} value={content.subtitle || ''} onChange={(e) => handleContentChange('subtitle', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`value-${block.id}`} className="text-xs text-gray-400">Main Value</Label>
            <Input id={`value-${block.id}`} value={content.value || ''} onChange={(e) => handleContentChange('value', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`change-${block.id}`} className="text-xs text-gray-400">Change (e.g. +5%)</Label>
            <Input id={`change-${block.id}`} value={content.change || ''} onChange={(e) => handleContentChange('change', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>
          
          <div>
            <Label htmlFor={`trend-${block.id}`} className="text-xs text-gray-400">Trend</Label>
            <Select 
              value={content.trend || 'neutral'} 
              onValueChange={(value) => handleContentChange('trend', value)}
            >
              <SelectTrigger id={`trend-${block.id}`} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                <SelectValue placeholder="Select trend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Up</SelectItem>
                <SelectItem value="down">Down</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor={`icon-${block.id}`} className="text-xs text-gray-400">Icon</Label>
            <Input id={`icon-${block.id}`} value={content.icon || ''} onChange={(e) => handleContentChange('icon', e.target.value)} className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500" />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2 py-2 px-3 bg-gray-800/50 border-t border-gray-700">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-gray-300">Cancel</Button>
          <Button size="sm" onClick={() => setIsEditing(false)} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn("snapshot-card-display group", isActive && "ring-2 ring-blue-500", "bg-gray-800 border-gray-700 text-white")}>
      <CardHeader className="relative pt-2 pb-1 px-3">
        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon_xs" onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300"><Edit3 className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon_xs" onClick={() => onDeleteBlock(block.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></Button>
        </div>
        <CardTitle className="text-base font-semibold leading-tight text-gray-100">{content.title || 'Snapshot Card'}</CardTitle>
        {content.subtitle && <CardDescription className="text-xs text-gray-400">{content.subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {content.imageUrl && (
          <div className="aspect-video rounded-md overflow-hidden mb-2 border border-gray-700">
            <img src={content.imageUrl} alt={content.title || 'Snapshot image'} className="w-full h-full object-cover" />
          </div>
        )}
        {content.description && <p className="text-xs text-gray-300 leading-relaxed">{content.description}</p>}
        
        {content.value && (
          <div className="flex items-baseline space-x-1 pt-1">
            <span className="text-2xl font-bold text-blue-400">{String(content.value)}</span>
            {content.change && <span className={`text-xs ${content.trend === 'up' ? 'text-green-400' : content.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>{content.change}</span>}
            {getTrendIcon(content.trend)}
          </div>
        )}

        {(content.metrics && content.metrics.length > 0) && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
            {content.metrics.map((metric, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium text-gray-400">{metric.label}: </span>
                <span className="text-gray-200">{metric.value}{metric.unit && ` ${metric.unit}`}</span>
              </div>
            ))}
          </div>
        )}
        
        {content.evidence_level && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span>Evidence: <span className="text-gray-200">{content.evidence_level}</span></span>
          </div>
        )}
        
        {content.recommendation_strength && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Recommendation: <span className="text-gray-200">{content.recommendation_strength}</span></span>
          </div>
        )}
        
        {content.population && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium">Population:</span>
            <span className="text-gray-200">{content.population}</span>
          </div>
        )}
        
        {content.intervention && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium">Intervention:</span>
            <span className="text-gray-200">{content.intervention}</span>
          </div>
        )}
        
        {content.comparison && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium">Comparison:</span>
            <span className="text-gray-200">{content.comparison}</span>
          </div>
        )}
        
        {content.outcome && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium">Outcome:</span>
            <span className="text-gray-200">{content.outcome}</span>
          </div>
        )}
        
        {content.design && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium">Study Design:</span>
            <span className="text-gray-200">{content.design}</span>
          </div>
        )}
        
        {content.key_findings && content.key_findings.length > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            <span className="font-medium">Key Findings:</span>
            <ul className="list-disc list-inside text-gray-200 mt-1">
              {content.key_findings.map((finding, idx) => (
                <li key={idx}>{finding}</li>
              ))}
            </ul>
          </div>
        )}
        
      </CardContent>
      {content.source && (
        <CardFooter className="py-1 px-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">Source: {content.source}</p>
        </CardFooter>
      )}
    </Card>
  );
};
