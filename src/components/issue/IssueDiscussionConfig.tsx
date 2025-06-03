
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useIssueDiscussionSettings } from '@/hooks/useIssueDiscussion';

interface IssueDiscussionConfigProps {
  issueId?: string;
  onSettingsChange: (settings: {
    discussionContent: string;
    includeReadButton: boolean;
    pinDurationDays: number;
  }) => void;
}

export const IssueDiscussionConfig: React.FC<IssueDiscussionConfigProps> = ({
  issueId,
  onSettingsChange
}) => {
  const [discussionContent, setDiscussionContent] = useState('');
  const [includeReadButton, setIncludeReadButton] = useState(true);
  const [pinDurationDays, setPinDurationDays] = useState(7);

  const { data: existingSettings } = useIssueDiscussionSettings(issueId);

  // Load existing settings when available
  useEffect(() => {
    if (existingSettings) {
      setDiscussionContent(existingSettings.discussion_content || '');
      setIncludeReadButton(existingSettings.include_read_button);
      setPinDurationDays(existingSettings.pin_duration_days);
    }
  }, [existingSettings]);

  // Notify parent of changes
  useEffect(() => {
    onSettingsChange({
      discussionContent,
      includeReadButton,
      pinDurationDays
    });
  }, [discussionContent, includeReadButton, pinDurationDays, onSettingsChange]);

  const defaultContent = issueId ? 
    `Este espaço é dedicado para discutirmos esta edição. Compartilhe suas impressões, dúvidas e insights.` :
    `Este espaço é dedicado para discutirmos esta edição. Compartilhe suas impressões, dúvidas e insights.`;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg">Configurar Discussão da Comunidade</CardTitle>
        <p className="text-sm text-gray-400">
          Configure como a discussão desta edição aparecerá na comunidade quando publicada.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discussion-content">Conteúdo da publicação</Label>
          <Textarea
            id="discussion-content"
            placeholder={defaultContent}
            value={discussionContent}
            onChange={(e) => setDiscussionContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Deixe em branco para usar o texto padrão.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-read-button"
            checked={includeReadButton}
            onCheckedChange={(checked) => setIncludeReadButton(checked as boolean)}
          />
          <Label htmlFor="include-read-button" className="text-sm">
            Incluir botão "Ler esta edição" automaticamente
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pin-duration">Tempo de fixação</Label>
          <Select value={pinDurationDays.toString()} onValueChange={(value) => setPinDurationDays(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 dia</SelectItem>
              <SelectItem value="3">3 dias</SelectItem>
              <SelectItem value="7">7 dias (padrão)</SelectItem>
              <SelectItem value="14">14 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="0">Fixar permanentemente</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Por quanto tempo a discussão ficará fixada no topo da comunidade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
