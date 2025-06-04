
// ABOUTME: Bookmarks configuration component
// Handles bookmark creation, editing, and removal

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SidebarConfig } from '@/types/sidebar';

interface BookmarksConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const BookmarksConfig: React.FC<BookmarksConfigProps> = ({
  config,
  onConfigChange
}) => {
  const addBookmark = () => {
    const newBookmark = {
      label: 'Novo Bookmark',
      url: 'https://example.com',
      icon: 'link'
    };
    onConfigChange({
      bookmarks: [...config.bookmarks, newBookmark]
    });
  };

  const removeBookmark = (index: number) => {
    const updatedBookmarks = config.bookmarks.filter((_, i) => i !== index);
    onConfigChange({ bookmarks: updatedBookmarks });
  };

  const updateBookmark = (index: number, field: string, value: string) => {
    const updatedBookmarks = config.bookmarks.map((bookmark, i) =>
      i === index ? { ...bookmark, [field]: value } : bookmark
    );
    onConfigChange({ bookmarks: updatedBookmarks });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookmarks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.bookmarks.map((bookmark, index) => (
          <div key={index} className="space-y-2 border rounded-md p-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor={`bookmark-label-${index}`}>Label</Label>
                <Input
                  id={`bookmark-label-${index}`}
                  value={bookmark.label}
                  onChange={(e) => updateBookmark(index, 'label', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`bookmark-url-${index}`}>URL</Label>
                <Input
                  id={`bookmark-url-${index}`}
                  value={bookmark.url}
                  onChange={(e) => updateBookmark(index, 'url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`bookmark-icon-${index}`}>Icon</Label>
                <Input
                  id={`bookmark-icon-${index}`}
                  value={bookmark.icon}
                  onChange={(e) => updateBookmark(index, 'icon', e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeBookmark(index)}
              className="mt-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addBookmark} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bookmark
        </Button>
      </CardContent>
    </Card>
  );
};
