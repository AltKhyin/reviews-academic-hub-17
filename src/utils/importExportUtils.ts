
// ABOUTME: Utilities for importing/exporting review content.
import { ReviewBlock, BlockType } from '@/types/review';

export const someExportFunction = () => {
  const blockData = {
    id: '1',
    type: 'paragraph' as const,
    content: {},
    sort_index: 0,
    visible: true,
  };

  // This assignment is now valid as `created_at` is removed.
  const reviewBlock: ReviewBlock = {
    ...blockData
  };

  return reviewBlock;
};

// This record now includes all BlockType keys to satisfy the type checking.
export const blockTypeInitialContent: Record<BlockType, any> = {
  text: { content: "" },
  heading: { text: "", level: 1 },
  paragraph: { text: "", content: "" },
  image: { url: "", caption: "" },
  video: { url: "", caption: "" },
  quote: { text: "", author: "" },
  list: { items: [], ordered: false },
  code: { code: "", language: "javascript" },
  table: { headers: [], rows: [[]] },
  divider: {},
  callout: { text: "", icon: "" },
  embed: { url: "" },
  poll: { question: "", options: [] },
  chart: { type: 'bar', data: [] },
  audio: { url: "" },
  file: { url: "", name: "" },
  gallery: { images: [] },
  timeline: { events: [] },
  comparison: { items: [] },
  accordion: { items: [] },
  tabs: { items: [] },
  figure: { url: "", caption: "" },
  number_card: { title: "", value: 0 },
  reviewer_quote: { text: "", reviewer: "" },
  citation_list: { citations: [] },
  snapshot_card: { title: "" },
  diagram: {},
  layout_grid: {},
  grid_2d: {},
};
