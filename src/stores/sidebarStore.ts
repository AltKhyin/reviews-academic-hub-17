
import { create } from 'zustand';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

interface SidebarState {
  // Data state
  config: SidebarConfig | null;
  stats: SiteStats | null;
  onlineUsers: OnlineUser[];
  comments: CommentHighlight[];
  threads: TopThread[];
  poll: Poll | null;
  userVote: number | null;
  
  // Loading states
  loadingStates: {
    Config: boolean;
    Stats: boolean;
    Users: boolean;
    Comments: boolean;
    Threads: boolean;
    Poll: boolean;
  };
  
  // UI state
  commentCarouselIndex: number;
  isMobileDrawerOpen: boolean;
  
  // Actions
  setConfig: (config: SidebarConfig | null) => void;
  setStats: (stats: SiteStats | null) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setComments: (comments: CommentHighlight[]) => void;
  setThreads: (threads: TopThread[]) => void;
  setPoll: (poll: Poll | null) => void;
  setUserVote: (vote: number | null) => void;
  setLoading: (section: keyof SidebarState['loadingStates'], loading: boolean) => void;
  setCommentCarouselIndex: (index: number) => void;
  toggleMobileDrawer: () => void;
  
  // Computed getters
  isLoadingConfig: boolean;
  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingComments: boolean;
  isLoadingThreads: boolean;
  isLoadingPoll: boolean;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // Initial state
  config: null,
  stats: null,
  onlineUsers: [],
  comments: [],
  threads: [],
  poll: null,
  userVote: null,
  loadingStates: {
    Config: false,
    Stats: false,
    Users: false,
    Comments: false,
    Threads: false,
    Poll: false,
  },
  commentCarouselIndex: 0,
  isMobileDrawerOpen: false,
  
  // Actions
  setConfig: (config) => set({ config }),
  setStats: (stats) => set({ stats }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setComments: (comments) => set({ comments, commentCarouselIndex: 0 }),
  setThreads: (threads) => set({ threads }),
  setPoll: (poll) => set({ poll }),
  setUserVote: (userVote) => set({ userVote }),
  setLoading: (section, loading) => set((state) => ({
    loadingStates: { ...state.loadingStates, [section]: loading }
  })),
  setCommentCarouselIndex: (commentCarouselIndex) => set({ commentCarouselIndex }),
  toggleMobileDrawer: () => set((state) => ({ 
    isMobileDrawerOpen: !state.isMobileDrawerOpen 
  })),
  
  // Computed getters
  get isLoadingConfig() { return get().loadingStates.Config; },
  get isLoadingStats() { return get().loadingStates.Stats; },
  get isLoadingUsers() { return get().loadingStates.Users; },
  get isLoadingComments() { return get().loadingStates.Comments; },
  get isLoadingThreads() { return get().loadingStates.Threads; },
  get isLoadingPoll() { return get().loadingStates.Poll; },
}));
