
import { create } from 'zustand';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

interface SidebarState {
  // Data
  config: SidebarConfig | null;
  stats: SiteStats | null;
  onlineUsers: OnlineUser[];
  comments: CommentHighlight[];
  threads: TopThread[];
  poll: Poll | null;
  userVote: number | null;
  
  // UI State
  commentCarouselIndex: number;
  isRulesExpanded: boolean;
  isMobileDrawerOpen: boolean;
  changelogHidden: boolean;
  
  // Loading states
  isLoadingConfig: boolean;
  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingComments: boolean;
  isLoadingThreads: boolean;
  isLoadingPoll: boolean;
  
  // Actions
  setConfig: (config: SidebarConfig) => void;
  setStats: (stats: SiteStats) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setComments: (comments: CommentHighlight[]) => void;
  setThreads: (threads: TopThread[]) => void;
  setPoll: (poll: Poll | null) => void;
  setUserVote: (vote: number | null) => void;
  setCommentCarouselIndex: (index: number) => void;
  toggleRules: () => void;
  toggleMobileDrawer: () => void;
  hideChangelog: () => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // Initial state
  config: null,
  stats: null,
  onlineUsers: [],
  comments: [],
  threads: [],
  poll: null,
  userVote: null,
  commentCarouselIndex: 0,
  isRulesExpanded: false,
  isMobileDrawerOpen: false,
  changelogHidden: false,
  isLoadingConfig: false,
  isLoadingStats: false,
  isLoadingUsers: false,
  isLoadingComments: false,
  isLoadingThreads: false,
  isLoadingPoll: false,
  
  // Actions
  setConfig: (config) => set({ config }),
  setStats: (stats) => set({ stats }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setComments: (comments) => set({ comments }),
  setThreads: (threads) => set({ threads }),
  setPoll: (poll) => set({ poll }),
  setUserVote: (userVote) => set({ userVote }),
  setCommentCarouselIndex: (commentCarouselIndex) => set({ commentCarouselIndex }),
  toggleRules: () => set((state) => ({ isRulesExpanded: !state.isRulesExpanded })),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
  hideChangelog: () => set({ changelogHidden: true }),
  setLoading: (key, loading) => set((state) => ({ ...state, [`isLoading${key}`]: loading })),
}));
