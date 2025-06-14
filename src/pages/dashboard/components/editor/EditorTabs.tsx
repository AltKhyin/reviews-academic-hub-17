
// ABOUTME: Editor tabs component for issue editor
// Handles tab navigation and content rendering

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { IssueFormContainer } from '../issue/IssueFormContainer';
import { NativeEditor } from '@/components/editor/NativeEditor';
import { ReviewBlock } from '@/types/review';
import { IssueFormValues } from '@/schemas/issue-form-schema';

interface EditorTabsProps {
  isNewIssue: boolean;
  contentType: 'pdf' | 'native';
  issueId?: string;
  formValues: IssueFormValues;
  nativeBlocks: ReviewBlock[];
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  onSaveNativeBlocks: (blocks: ReviewBlock[]) => Promise<void>;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  isNewIssue,
  contentType,
  issueId,
  formValues,
  nativeBlocks,
  onSubmit,
  onCancel,
  isSubmitting,
  onSaveNativeBlocks
}) => {
  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList 
        className="grid w-full grid-cols-3"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <TabsTrigger 
          value="basic"
          style={{ 
            color: '#ffffff',
            backgroundColor: 'transparent'
          }}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Informações Básicas
        </TabsTrigger>
        <TabsTrigger 
          value="content" 
          disabled={isNewIssue}
          style={{ 
            color: isNewIssue ? '#6b7280' : '#ffffff',
            backgroundColor: 'transparent'
          }}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:opacity-50"
        >
          {contentType === 'native' ? 'Editor de Conteúdo Nativo' : 'Upload PDF'}
        </TabsTrigger>
        <TabsTrigger 
          value="original"
          style={{ 
            color: '#ffffff',
            backgroundColor: 'transparent'
          }}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Artigo Original
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <Card 
          className="issue-editor-card"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#ffffff'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: '#ffffff' }}>Informações da Revisão</CardTitle>
            <CardDescription style={{ color: '#d1d5db' }}>
              Metadados e informações básicas da revisão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssueFormContainer 
              issueId={isNewIssue ? undefined : issueId}
              defaultValues={formValues}
              onSubmit={onSubmit} 
              onCancel={onCancel} 
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content">
        {isNewIssue ? (
          <Card 
            className="issue-editor-card"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                Salve Primeiro as Informações Básicas
              </h3>
              <p className="text-center max-w-md" style={{ color: '#d1d5db' }}>
                Complete e salve as informações básicas na aba anterior antes de adicionar conteúdo.
              </p>
            </CardContent>
          </Card>
        ) : contentType === 'native' ? (
          <Card 
            className="issue-editor-card h-[800px] flex flex-col"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            <CardContent className="flex-1 p-0">
              <NativeEditor
                issueId={issueId}
                initialBlocks={nativeBlocks}
                onSave={onSaveNativeBlocks}
                onCancel={() => {}}
                mode="split"
              />
            </CardContent>
          </Card>
        ) : (
          <Card 
            className="issue-editor-card"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#ffffff' }}>Upload de PDF da Revisão</CardTitle>
              <CardDescription style={{ color: '#d1d5db' }}>
                Upload do arquivo PDF da revisão para visualização tradicional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8" style={{ color: '#d1d5db' }}>
                Componente de upload PDF será implementado aqui
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="original">
        <Card 
          className="issue-editor-card"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#ffffff'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: '#ffffff' }}>Artigo Científico Original</CardTitle>
            <CardDescription style={{ color: '#d1d5db' }}>
              Upload do PDF do artigo original que está sendo revisado (recomendado)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8" style={{ color: '#d1d5db' }}>
              Componente de upload do artigo original será implementado aqui
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
