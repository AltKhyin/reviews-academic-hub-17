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
  const content = block.content;
  const meta = block.meta || {};

  const handleContentUpdate = (field: string, value: any) => {
    onUpdate({
      content: {
        ...content,
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
          value={String(content.level || 1)} 
          onValueChange={(value) => handleContentUpdate('level', parseInt(value))}
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
          value={content.anchor || ''}
          onChange={(e) => handleContentUpdate('anchor', e.target.value)}
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
          value={content.alignment || 'left'} 
          onValueChange={(value) => handleContentUpdate('alignment', value)}
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
          value={content.emphasis || 'normal'} 
          onValueChange={(value) => handleContentUpdate('emphasis', value)}
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
          value={content.src || ''}
          onChange={(e) => handleContentUpdate('src', e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="figure-alt" style={{ color: '#d1d5db' }}>Texto Alternativo</Label>
        <Input
          id="figure-alt"
          value={content.alt || ''}
          onChange={(e) => handleContentUpdate('alt', e.target.value)}
          placeholder="Descrição da imagem"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
        <Select 
          value={content.alignment || 'center'} 
          onValueChange={(value) => handleContentUpdate('alignment', value)}
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
          value={content.width || 'auto'}
          onChange={(e) => handleContentUpdate('width', e.target.value)}
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
            checked={content.compact || false}
            onCheckedChange={(checked) => handleContentUpdate('compact', checked)}
          />
          <Label style={{ color: '#d1d5db' }}>Compacta</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label style={{ color: '#d1d5db' }}>Funcionalidades</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={content.sortable || false}
              onCheckedChange={(checked) => handleContentUpdate('sortable', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Ordenável</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={content.searchable || false}
              onCheckedChange={(checked) => handleContentUpdate('searchable', checked)}
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
          value={content.type || 'info'} 
          onValueChange={(value) => handleContentUpdate('type', value)}
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
          value={content.trend || 'neutral'} 
          onValueChange={(value) => handleContentUpdate('trend', value)}
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

      {content.trend !== 'neutral' && (
        <div className="space-y-2">
          <Label htmlFor="percentage" style={{ color: '#d1d5db' }}>Porcentagem (%)</Label>
          <Input
            id="percentage"
            type="number"
            value={content.percentage || 0}
            onChange={(e) => handleContentUpdate('percentage', Number(e.target.value))}
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
          value={content.poll_type || 'single_choice'} 
          onValueChange={(value) => handleContentUpdate('poll_type', value)}
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
              checked={content.allow_add_options || false}
              onCheckedChange={(checked) => handleContentUpdate('allow_add_options', checked)}
            />
            <Label style={{ color: '#d1d5db' }}>Permitir adicionar opções</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={content.show_results || true}
              onCheckedChange={(checked) => handleContentUpdate('show_results', checked)}
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
          value={content.citation_style || 'apa'} 
          onValueChange={(value) => handleContentUpdate('citation_style', value)}
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
          checked={content.numbered || true}
          onCheckedChange={(checked) => handleContentUpdate('numbered', checked)}
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
          value={content.evidence_level || 'moderate'} 
          onValueChange={(value) => handleContentUpdate('evidence_level', value)}
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
          value={content.recommendation_strength || 'conditional'} 
          onValueChange={(value) => handleContentUpdate('recommendation_strength', value)}
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

  const renderReviewerQuoteProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      <p style={{ color: '#9ca3af' }} className="text-sm">
        Use a edição inline para modificar a citação, autor e informações institucionais.
      </p>
    </div>
  );

  const renderDividerProperties = () => (
    <div className="space-y-4">
      {renderCommonProperties()}
      <p style={{ color: '#9ca3af' }} className="text-sm">
        Divisor simples sem propriedades adicionais.
      </p>
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
        return renderReviewerQuoteProperties();
      case 'divider':
        return renderDividerProperties();
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
