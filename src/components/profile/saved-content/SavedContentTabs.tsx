
import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSavedItems } from '../ProfileSavedItems';

interface SavedContentTabsProps {
  userId?: string;
}

export const SavedContentTabs: React.FC<SavedContentTabsProps> = ({ userId }) => {
  return (
    <Card className="bg-[#1a1a1a] rounded-lg shadow-sm border border-[#2a2a2a]">
      <CardHeader className="px-6 pt-6 pb-0">
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="bg-[#212121] w-full md:w-auto justify-start">
            <TabsTrigger value="favorites" className="data-[state=active]:bg-[#2a2a2a]">
              Reviews Favoritas
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#2a2a2a]">
              Posts Salvos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="mt-6">
            <ProfileSavedItems type="reviews" userId={userId} />
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <ProfileSavedItems type="posts" userId={userId} />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};
