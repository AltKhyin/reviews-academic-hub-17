// ABOUTME: A viewer for articles. Placeholder to fix build errors.
import React from 'react';

type ReviewType = 'native' | 'pdf' | 'mixed';

const SomeComponent = ({ review_type }: { review_type: ReviewType }) => {
  return <div>{review_type}</div>;
};

export const ArticleViewer = () => {
  const article = {
    // This is coming from DB as string
    review_type: 'pdf' as string, 
  };

  // Fix for error 1: Cast or validate
  const reviewType: ReviewType = article.review_type as ReviewType;

  // Fix for error 2: Use correct value in comparison
  if (reviewType === 'pdf') { // instead of 'hybrid'
    console.log('PDF viewer');
  }

  return (
    <div>
      <h1>Article Viewer</h1>
      <SomeComponent review_type={reviewType} />
    </div>
  );
};

export default ArticleViewer;
