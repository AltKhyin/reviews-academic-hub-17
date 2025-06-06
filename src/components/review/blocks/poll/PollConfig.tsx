
// ABOUTME: Poll configuration panel with settings and options management
// Handles poll type, status, deadline, and option management

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string;
}

interface PollConfigProps {
  pollType: string;
  pollStatus: string;
  resultDisplay: string;
  minSelections: number;
  maxSelections: number;
  deadline: string;
  showResults: boolean;
  showVoteCount: boolean;
  showPercentage: boolean;
  anonymousVoting: boolean;
  options: PollOption[];
  textColor: string;
  borderColor: string;
  onUpdate: (field: string, value: any) => void;
  onOptionChange: (index: number, field: string, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

const pollTypes = {
  single_choice: { label: 'Escolha Única', description: 'Uma opção por voto' },
  multiple_choice: { label: 'Múltipla Escolha', description: 'Várias opções por voto' },
  rating: { label: 'Avaliação', description: 'Escala de 1-5' },
  ranking: { label: 'Ranking', description: 'Ordenar por preferência' }
};

const pollStatuses = {
  draft: { label: 'Rascunho', color: '#6b7280' },
  active: { label: 'Ativo', color: '#10b981' },
  closed: { label: 'Encerrado', color: '#ef4444' },
  scheduled: { label: 'Agendado', color: '#f59e0b' }
};

const resultDisplayTypes = {
  bar: 'Barras',
  pie: 'Pizza', 
  list: 'Lista',
  minimal: 'Minimal'
};

export const PollConfig: React.FC<PollConfigProps> = ({
  pollType,
  pollStatus,
  resultDisplay,
  minSelections,
  maxSelections,
  deadline,
  showResults,
  showVoteCount,
  showPercentage,
  anonymousVoting,
  options,
  textColor,
  borderColor,
  onUpdate,
  onOptionChange,
  onAddOption,
  onRemoveOption
}) => {
  return (
    <div 
      className="p-4 rounded border space-y-4"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: '#2a2a2a'
      }}
    >
      {/* Poll Type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Tipo de Enquete
          </Label>
          <Select value={pollType} onValueChange={(value) => onUpdate('poll_type', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              {Object.entries(pollTypes).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div>{config.label}</div>
                    <div className="text-xs opacity-60">{config.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Status da Enquete
          </Label>
          <Select value={pollStatus} onValueChange={(value) => onUpdate('poll_status', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              {Object.entries(pollStatuses).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Exibição dos Resultados
          </Label>
          <Select value={resultDisplay} onValueChange={(value) => onUpdate('result_display', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              {Object.entries(resultDisplayTypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Multiple Choice Settings */}
      {pollType === 'multiple_choice' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
              Mín. Seleções
            </Label>
            <Input
              type="number"
              min="1"
              value={minSelections}
              onChange={(e) => onUpdate('min_selections', Number(e.target.value))}
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            />
          </div>
          
          <div>
            <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
              Máx. Seleções
            </Label>
            <Input
              type="number"
              min="1"
              value={maxSelections}
              onChange={(e) => onUpdate('max_selections', Number(e.target.value))}
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            />
          </div>
        </div>
      )}

      {/* Deadline */}
      <div>
        <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
          Data Limite (opcional)
        </Label>
        <Input
          type="datetime-local"
          value={deadline}
          onChange={(e) => onUpdate('deadline', e.target.value)}
          style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={showResults}
            onCheckedChange={(checked) => onUpdate('show_results', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Mostrar Resultados
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showVoteCount}
            onCheckedChange={(checked) => onUpdate('show_vote_count', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Número de Votos
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showPercentage}
            onCheckedChange={(checked) => onUpdate('show_percentage', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Porcentagem
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={anonymousVoting}
            onCheckedChange={(checked) => onUpdate('anonymous_voting', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Votação Anônima
          </Label>
        </div>
      </div>

      {/* Options Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium" style={{ color: textColor }}>
            Opções de resposta:
          </Label>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onAddOption}
            className="flex items-center gap-1"
            style={{ borderColor: borderColor, color: textColor }}
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
        
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <div className="flex-1">
              <InlineTextEditor
                value={option.text}
                onChange={(value) => onOptionChange(index, 'text', value)}
                placeholder={`Opção ${index + 1}`}
                className="w-full"
                style={{ color: textColor }}
              />
            </div>
            
            <Input
              type="color"
              value={option.color}
              onChange={(e) => onOptionChange(index, 'color', e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
              style={{ backgroundColor: '#212121', borderColor: borderColor }}
            />
            
            {options.length > 2 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveOption(index)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
