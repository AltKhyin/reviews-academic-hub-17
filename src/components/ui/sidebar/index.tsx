
import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarContext, SidebarProvider, useSidebar } from "./sidebar-context"
import {
  Sidebar,
  SidebarRail,
  SidebarTrigger,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MOBILE
} from "./sidebar-components"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarSeparator
} from "./sidebar-sections"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel
} from "./sidebar-groups"
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "./sidebar-menu"
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "./sidebar-submenu"

// Wrap SidebarProvider with TooltipProvider
const EnhancedSidebarProvider: typeof SidebarProvider = React.forwardRef(
  (props, ref) => (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        ref={ref}
        {...props}
        className={`group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar ${props.className || ""}`}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...props.style,
        } as React.CSSProperties}
      />
    </TooltipProvider>
  )
)
EnhancedSidebarProvider.displayName = "SidebarProvider"

// Override SidebarProvider with enhanced version
export { EnhancedSidebarProvider as SidebarProvider }

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
