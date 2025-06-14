
// ABOUTME: Content type selection component for issue editor
// Handles PDF vs Native content type selection with consistent color system

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Layers } from 'lucide-react';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface ContentTypeSelectorProps {
  contentType: 'pdf' | 'native';
  onContentTypeChange: (type: 'pdf' | 'native') => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange
}) => {
  return (
    <Card 
      className="issue-editor-card"
      style={{ 
        backgroundColor: CSS_VARIABLES.SECONDARY_BG,
        borderColor: CSS_VARIABLES.BORDER_DEFAULT,
        color: CSS_VARIABLES.TEXT_PRIMARY
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
          <Layers className="w-5 h-5" />
          Tipo de Conteúdo
        </CardTitle>
        <CardDescription style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
          Escolha como você deseja criar e apresentar esta revisão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={contentType} 
          onValueChange={onContentTypeChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div 
            className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-800 transition-colors"
            style={{ 
              backgroundColor: CSS_VARIABLES.TERTIARY_BG,
              borderColor: CSS_VARIABLES.BORDER_DEFAULT,
              color: CSS_VARIABLES.TEXT_PRIMARY
            }}
          >
            <RadioGroupItem value="pdf" id="pdf" />
            <div className="flex-1">
              <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>PDF Tradicional</div>
                  <div className="text-sm" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
                    Upload de arquivo PDF da revisão
                  </div>
                </div>
              </Label>
            </div>
          </div>
          
          <div 
            className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-800 transition-colors"
            style={{ 
              backgroundColor: CSS_VARIABLES.TERTIARY_BG,
              borderColor: CSS_VARIABLES.BORDER_DEFAULT,
              color: CSS_VARIABLES.TEXT_PRIMARY
            }}
          >
            <RadioGroupItem value="native" id="native" />
            <div className="flex-1">
              <Label htmlFor="native" className="flex items-center gap-2 cursor-pointer" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
                <Layers className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium flex items-center gap-2" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
                    Revisão Nativa
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: '#3b82f6', color: CSS_VARIABLES.TEXT_PRIMARY }}
                    >
                      Novo
                    </Badge>
                  </div>
                  <div className="text-sm" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
                    Editor de blocos interativo
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
