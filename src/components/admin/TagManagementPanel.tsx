
// Tag management panel for the admin edit section
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTagConfiguration } from '@/hooks/useTagConfiguration';
import { TagHierarchy } from '@/types/archive';
import { Save, Eye, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

export const TagManagementPanel = () => {
  const {
    activeConfig,
    isLoading,
    isEditing,
    setIsEditing,
    createConfiguration,
    validateTagData,
    getTagStatistics
  } = useTagConfiguration();

  const [editedJson, setEditedJson] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    data?: TagHierarchy;
  } | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  React.useEffect(() => {
    if (activeConfig && !isEditing) {
      const formatted = JSON.stringify(activeConfig.tag_data, null, 2);
      setEditedJson(formatted);
      getTagStatistics(activeConfig.tag_data).then(setStatistics);
    }
  }, [activeConfig, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    if (activeConfig) {
      setEditedJson(JSON.stringify(activeConfig.tag_data, null, 2));
    }
  };

  const handleValidate = () => {
    const result = validateTagData(editedJson);
    setValidationResult(result);
    
    if (result.valid && result.data) {
      getTagStatistics(result.data).then(setStatistics);
    }
  };

  const handleSave = async () => {
    const result = validateTagData(editedJson);
    if (result.valid && result.data) {
      await createConfiguration.mutateAsync(result.data);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationResult(null);
    if (activeConfig) {
      setEditedJson(JSON.stringify(activeConfig.tag_data, null, 2));
    }
  };

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-40 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Gerenciamento de Tags
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Configure as tags hierárquicas para sistema de recomendação e arquivo
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {isEditing ? 'Editando Configuração' : 'Configuração Ativa'}
                </h3>
                {activeConfig && (
                  <p className="text-sm text-gray-400">
                    Versão {activeConfig.version} • Criada em {new Date(activeConfig.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleValidate} variant="outline">
                      Validar
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={!validationResult?.valid || createConfiguration.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createConfiguration.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Textarea
              value={editedJson}
              onChange={(e) => setEditedJson(e.target.value)}
              placeholder="Cole aqui a configuração JSON das tags..."
              rows={20}
              className="font-mono text-sm bg-gray-900 border-gray-700 text-white"
              disabled={!isEditing}
            />

            {validationResult && (
              <Alert className={validationResult.valid ? 'border-green-500' : 'border-red-500'}>
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <AlertDescription className={validationResult.valid ? 'text-green-300' : 'text-red-300'}>
                    {validationResult.valid 
                      ? 'JSON válido! Estrutura de tags validada com sucesso.'
                      : `Erro de validação: ${validationResult.error}`
                    }
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <h3 className="text-lg font-medium text-white">Preview das Tags</h3>
            {activeConfig && (
              <div className="space-y-4">
                {Object.entries(activeConfig.tag_data).map(([category, subtags]) => (
                  <div key={category} className="space-y-2">
                    <Badge variant="default" className="bg-blue-600 text-white">
                      {category}
                    </Badge>
                    <div className="flex flex-wrap gap-2 ml-4">
                      {subtags.map((subtag: string) => (
                        <Badge key={subtag} variant="outline" className="text-gray-300 border-gray-600">
                          {subtag}
                        </Badge>
                      ))}
                      {subtags.length === 0 && (
                        <span className="text-gray-500 text-sm italic">Categoria vazia</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <h3 className="text-lg font-medium text-white">Estatísticas</h3>
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{statistics.totalCategories}</div>
                  <div className="text-sm text-gray-400">Categorias</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{statistics.totalSubtags}</div>
                  <div className="text-sm text-gray-400">Subtags</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{statistics.emptyCategories}</div>
                  <div className="text-sm text-gray-400">Categorias vazias</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{statistics.maxSubtags}</div>
                  <div className="text-sm text-gray-400">Max subtags</div>
                </div>
                {statistics.mostPopulatedCategory && (
                  <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
                    <div className="text-lg font-bold text-white">{statistics.mostPopulatedCategory}</div>
                    <div className="text-sm text-gray-400">Categoria mais populada</div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
