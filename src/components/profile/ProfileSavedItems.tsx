
import React from 'react';
import { useSavedItems } from './saved-items/useSavedItems';
import { SavedItemsList } from './saved-items/SavedItemsList';

interface ProfileSavedItemsProps {
  userId?: string;
  type: 'reviews' | 'posts';
}

export const ProfileSavedItems: React.FC<ProfileSavedItemsProps> = ({ userId, type }) => {
  const { items, loading } = useSavedItems(userId, type);
  
  return <SavedItemsList items={items} loading={loading} type={type} />;
};
