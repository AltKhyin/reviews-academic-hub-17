// ABOUTME: Comprehensive block property editor for all block types with integrated color system
// Provides detailed configuration options including comprehensive color editing

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewBlock } from '@/types/review';
import { ColorSystem } from './color/ColorSystem';
import { Settings, Eye, EyeOff, Palette } from 'lucide-react';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate
}) => {
  const payload = block.payload;
  const meta = block.meta || {};

  const handlePayloadUpdate = (field: string, value: any) => {
    onUpdate({
      payload: {
        ...payload,
        [field]: value
      }
    });
  };

  const handleMetaUpdate = (field: string, value: any) => {
    onUpdate({
      meta: {
        ...meta,
        [field]: value
      }
    });
  };

  const handleVisibilityToggle = (visible: boolean) => {
    onUpdate({ visible });
  };

  const renderCommonProperties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="block-visibility" style={{ color: '#d1d5db' }}>
          Bloco Visível
        </Label>
        <div className="flex items-center gap-2">
          {block.visible ? (
            <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
          ) : (
            <EyeOff className="w-4 h-4" style={{ color: '#ef4444' }} />
          )}
          <Switch
            id="block-visibility"
            checked={block.visible}
            onCheckedChange={handleVisibilityToggle}
          />
        </div>
      </div>
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
    </div>
  );

  const renderHeadingProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Nível do Cabeçalho</Label>
        <Select 
          value={String(payload.level || 1)} 
          onValueChange={(value) => handlePayloadUpdate('level', parseInt(value))}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="1">H1 - Título Principal</SelectItem>
            <SelectItem value="2">H2 - Seção</SelectItem>
            <SelectItem value="3">H3 - Subseção</SelectItem>
            <SelectItem value="4">H4 - Subtítulo</SelectItem>
            <SelectItem value="5">H5 - Subtítulo Menor</SelectItem>
            <SelectItem value="6">H6 - Subtítulo Mínimo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="heading-anchor" style={{ color: '#d1d5db' }}>Âncora (ID)</Label>
        <Input
          id="heading-anchor"
          value={payload.anchor || ''}
          onChange={(e) => handlePayloadUpdate('anchor', e.target.value)}
          placeholder="ancora-do-titulo"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>
    </div>
  );

  const renderParagraphProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
        <Select 
          value={payload.alignment || 'left'} 
          onValueChange={(value) => handlePayloadUpdate('alignment', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
            <SelectItem value="justify">Justificado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Ênfase</Label>
        <Select 
          value={payload.emphasis || 'normal'} 
          onValueChange={(value) => handlePayloadUpdate('emphasis', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="lead">Destaque</SelectItem>
            <SelectItem value="small">Pequeno</SelectItem>
            <SelectItem value="caption">Legenda</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFigureProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label htmlFor="figure-src" style={{ color: '#d1d5db' }}>URL da Imagem</Label>
        <Input
          id="figure-src"
          value={payload.src || ''}
          onChange={(e) => handlePayloadUpdate('src', e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="figure-alt" style={{ color: '#d1d5db' }}>Texto Alternativo</Label>
        <Input
          id="figure-alt"
          value={payload.alt || ''}
          onChange={(e) => handlePayloadUpdate('alt', e.target.value)}
          placeholder="Descrição da imagem"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
        <Select 
          value={payload.alignment || 'center'} 
          onValueChange={(value) => handlePayloadUpdate('alignment', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="figure-width" style={{ color: '#d1d5db' }}>Largura</Label>
        <Input
          id="figure-width"
          value={payload.width || 'auto'}
          onChange={(e) => handlePayloadUpdate('width', e.target.value)}
          placeholder="auto, 100%, 500px"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>
    </div>
  );

  const renderTableProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Estilo da Tabela</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={payload.compact || false}
            onCheckedChange={(checked) => handlePayloadUpdate('compact', checked)}
          />
          <Label style={{ color: '#d1d5db' }}>Compacta</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Funcionalidades</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={payload.sortable || false}
              onCheckedChange={(checked) => handlePayloadUpdate('sortable', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Ordenável</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={payload.searchable || false}
              onCheckedChange={(checked) => handlePayloadUpdate('searchable', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Pesquisável</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalloutProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Tipo de Destaque</Label>
        <Select 
          value={payload.type || 'info'} 
          onValueChange={(value) => handlePayloadUpdate('type', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="info">Informação</SelectItem>
            <SelectItem value="warning">Atenção</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="note">Nota</SelectItem>
            <SelectItem value="tip">Dica</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderNumberCardProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Tendência</Label>
        <Select 
          value={payload.trend || 'neutral'} 
          onValueChange={(value) => handlePayloadUpdate('trend', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="neutral">Neutro</SelectItem>
            <SelectItem value="up">Subindo</SelectItem>
            <SelectItem value="down">Descendo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {payload.trend !== 'neutral' && (
        <div className="space-y-2">
          <Label htmlFor="percentage" style={{ color: '#d1d5db' }}>Porcentagem (%)</Label>
          <Input
            id="percentage"
            type="number"
            value={payload.percentage || 0}
            onChange={(e) => handlePayloadUpdate('percentage', Number(e.target.value))}
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
      )}
    </div>
  );

  const renderPollProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Tipo de Enquete</Label>
        <Select 
          value={payload.poll_type || 'single_choice'} 
          onValueChange={(value) => handlePayloadUpdate('poll_type', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="single_choice">Escolha única</SelectItem>
            <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
            <SelectItem value="rating">Avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Configurações</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={payload.allow_add_options || false}
              onCheckedChange={(checked) => handlePayloadUpdate('allow_add_options', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Permitir adicionar opções</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={payload.show_results || true}
              onCheckedChange={(checked) => handlePayloadUpdate('show_results', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Mostrar resultados</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCitationListProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Estilo de Citação</Label>
        <Select 
          value={payload.citation_style || 'apa'} 
          onValueChange={(value) => handlePayloadUpdate('citation_style', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="apa">APA</SelectItem>
            <SelectItem value="mla">MLA</SelectItem>
            <SelectItem value="chicago">Chicago</SelectItem>
            <SelectItem value="vancouver">Vancouver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={payload.numbered || true}
          onCheckedChange={(checked) => handlePayloadUpdate('numbered', checked)}
        />
        <Label style={{ color: '#d1d5db' }}>Numeradas</Label>
      </div>
    </div>
  );

  const renderSnapshotCardProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      
      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Nível de Evidência</Label>
        <Select 
          value={payload.evidence_level || 'moderate'} 
          onValueChange={(value) => handlePayloadUpdate('evidence_level', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="moderate">Moderado</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
            <SelectItem value="very_low">Muito Baixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Força da Recomendação</Label>
        <Select 
          value={payload.recommendation_strength || 'conditional'} 
          onValueChange={(value) => handlePayloadUpdate('recommendation_strength', value)}
        >
          <SelectTrigger style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            <SelectItem value="strong">Forte</SelectItem>
            <SelectItem value="conditional">Condicional</SelectItem>
            <SelectItem value="expert_opinion">Opinião de Especialista</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderProperties = () => {
    switch (block.type) {
      case 'heading':
        return renderHeadingProperties();
      case 'paragraph':
        return renderParagraphProperties();
      case 'figure':
        return renderFigureProperties();
      case 'table':
        return renderTableProperties();
      case 'callout':
        return renderCalloutProperties();
      case 'number_card':
        return renderNumberCardProperties();
      case 'poll':
        return renderPollProperties();
      case 'citation_list':
        return renderCitationListProperties();
      case 'snapshot_card':
        return renderSnapshotCardProperties();
      case 'reviewer_quote':
        return (
          <div className="space-y-4">
            {renderCommonProperties()}
            <p style={{ color: '#9ca3af' }} className="text-sm">
              Use a edição inline para modificar a citação, autor e informações institucionais.
            </p>
          </div>
        );
      case 'divider':
        return (
          <div className="space-y-4">
            {renderCommonProperties()}
            <p style={{ color: '#9ca3af' }} className="text-sm">
              Divisor simples sem propriedades adicionais.
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {renderCommonProperties()}
            <p style={{ color: '#9ca3af' }} className="text-sm">
              Editor específico para o tipo "{block.type}" ainda não implementado.
            </p>
          </div>
        );
    }
  };

  return (
    <Card 
      className="block-property-editor"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm" style={{ color: '#ffffff' }}>
          <Settings className="w-4 h-4" />
          {block.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="properties" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2 mb-4"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
          >
            <TabsTrigger 
              value="properties"
              style={{ 
                color: '#ffffff',
                backgroundColor: 'transparent'
              }}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-1" />
              Propriedades
            </TabsTrigger>
            <TabsTrigger 
              value="colors"
              style={{ 
                color: '#ffffff',
                backgroundColor: 'transparent'
              }}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Palette className="w-4 h-4 mr-1" />
              Cores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            {renderProperties()}
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <ColorSystem block={block} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
