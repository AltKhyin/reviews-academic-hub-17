// ABOUTME: An enhanced viewer for articles. Placeholder to fix build errors.
import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';

type ReviewType = 'native' | 'pdf' | 'mixed';

const SomeOtherComponent = ({ review_type }: { review_type: ReviewType }) => {
  return <div>{review_type}</div>;
};

const BlockComponent = ({ block }: { block: ReviewBlock }) => {
  return <div>{block.type}</div>;
};

export const EnhancedArticleViewer = () => {
  // 1. Fix review_type
  const article = { review_type: 'native' as string };
  const reviewType: ReviewType = article.review_type as ReviewType;

  // 2. Fix BlockType
  const rawBlock = { id: '1', type: 'paragraph' as string, content: {}, sort_index: 0, visible: true };
  const typedBlock: ReviewBlock = {
    ...rawBlock,
    type: rawBlock.type as BlockType, // Cast to BlockType
  };

  return (
    <div>
      <h1>Enhanced Article Viewer</h1>
      <SomeOtherComponent review_type={reviewType} />
      <BlockComponent block={typedBlock} />
      <BlockComponent block={{...rawBlock, type: rawBlock.type as BlockType}} />
    </div>
  );
};
