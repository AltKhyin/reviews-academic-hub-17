// ABOUTME: Editor tabs component for issue editor
// Handles tab navigation and content rendering

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { IssueFormContainer } from '../issue/IssueFormContainer';
import { NativeEditor } from '@/components/editor/NativeEditor';
import { Review } from '@/types/review';
import { IssueFormValues } from '@/schemas/issue-form-schema';

interface EditorTabsProps {
  isNewIssue: boolean;
  contentType: 'pdf' | 'native';
  issueId?: string;
  formValues: IssueFormValues;
  nativeReview?: Review; // Changed from nativeBlocks
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  onSaveNativeReview: (review: Review) => Promise<void>; // Changed from onSaveNativeBlocks
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  isNewIssue,
  contentType,
  issueId,
  formValues,
  nativeReview, // Changed from nativeBlocks
  onSubmit,
  onCancel,
  isSubmitting,
  onSaveNativeReview, // Changed from onSaveNativeBlocks
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
          style={{ 
            color: '#ffffff',
            backgroundColor: 'transparent'
          }}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          disabled={isNewIssue}
        >
          Conteúdo
        </TabsTrigger>
        <TabsTrigger 
          value="seo"
          style={{ 
            color: '#ffffff',
            backgroundColor: 'transparent'
          }}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          disabled={isNewIssue}
        >
          SEO
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <IssueFormContainer
          defaultValues={formValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isNewIssue={isNewIssue}
        />
      </TabsContent>

      <TabsContent value="content">
        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle style={{ color: '#ffffff' }}>Conteúdo da Revisão</CardTitle>
            <CardDescription style={{ color: '#d1d5db' }}>
              {contentType === 'pdf'
                ? "Faça upload do PDF da revisão."
                : "Edite o conteúdo nativo da revisão usando o editor de blocos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentType === 'pdf' ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg" style={{ borderColor: '#4b5563' }}>
                <Upload className="w-12 h-12 mb-4" style={{ color: '#9ca3af' }} />
                <p className="mb-2" style={{ color: '#d1d5db' }}>Arraste e solte o arquivo PDF aqui, ou clique para selecionar.</p>
                <p className="text-sm" style={{ color: '#6b7280' }}>PDF (max 50MB)</p>
              </div>
            ) : (
              <div style={{ height: '70vh', position: 'relative' }}>
                <NativeEditor
                  initialReview={nativeReview}
                  onSave={onSaveNativeReview}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seo">
        {/* SEO Form would go here */}
        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
           <CardHeader>
             <CardTitle style={{ color: '#ffffff' }}>SEO e Metadados</CardTitle>
             <CardDescription style={{ color: '#d1d5db' }}>
               Otimize as configurações de SEO para esta revisão.
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-center" style={{ color: '#9ca3af' }}>
               (Formulário de SEO em desenvolvimento)
             </p>
           </CardContent>
         </Card>
      </TabsContent>
    </Tabs>
  );
};
