import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  Database,
  Gift,
  Home,
  Key,
  Layers,
  LayoutDashboard,
  Medal,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessageSquareQuote,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { labels } from "@/lib/labels";

export type NavLeaf = {
  kind: "leaf";
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  kind: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

export type NavTreeItem = NavLeaf | NavGroup;

export const adminNavTree: NavTreeItem[] = [
  {
    kind: "group",
    id: "overview",
    label: labels.nav.groups.overview,
    icon: LayoutDashboard,
    children: [
      {
        kind: "leaf",
        href: "/admin/dashboard",
        label: labels.nav.dashboard,
        icon: LayoutDashboard,
        exact: true,
      },
      {
        kind: "leaf",
        href: "/admin/analytics",
        label: labels.nav.analytics,
        icon: BarChart3,
      },
    ],
  },
  {
    kind: "group",
    id: "content",
    label: labels.nav.groups.content,
    icon: Layers,
    children: [
      {
        kind: "leaf",
        href: "/admin/levels",
        label: labels.nav.levels,
        icon: Layers,
      },
      {
        kind: "leaf",
        href: "/admin/assistant-knowledge",
        label: labels.nav.assistantKnowledge,
        icon: BookOpen,
      },
    ],
  },
  {
    kind: "group",
    id: "people",
    label: labels.nav.groups.people,
    icon: Users,
    children: [
      {
        kind: "leaf",
        href: "/admin/users",
        label: labels.nav.users,
        icon: Users,
      },
      {
        kind: "leaf",
        href: "/admin/testimonials",
        label: labels.nav.testimonials,
        icon: MessageSquareQuote,
      },
      {
        kind: "leaf",
        href: "/admin/chat",
        label: labels.nav.chatMonitor,
        icon: MessageSquare,
      },
      {
        kind: "leaf",
        href: "/admin/ranking",
        label: labels.nav.ranking,
        icon: Trophy,
      },
    ],
  },
  {
    kind: "group",
    id: "engagement",
    label: labels.nav.groups.engagement,
    icon: Sparkles,
    children: [
      {
        kind: "leaf",
        href: "/admin/gamification",
        label: labels.nav.gamification,
        icon: Sparkles,
      },
      {
        kind: "leaf",
        href: "/admin/announcements",
        label: labels.nav.announcements,
        icon: Megaphone,
      },
    ],
  },
  {
    kind: "group",
    id: "system",
    label: labels.nav.groups.system,
    icon: Settings,
    children: [
      {
        kind: "leaf",
        href: "/admin/database",
        label: labels.nav.database,
        icon: Database,
      },
      {
        kind: "leaf",
        href: "/admin/settings",
        label: labels.nav.settings,
        icon: Settings,
      },
      {
        kind: "leaf",
        href: "/admin/api-tokens",
        label: labels.nav.apiTokens,
        icon: Key,
      },
    ],
  },
];

export const studentNavTree: NavTreeItem[] = [
  {
    kind: "group",
    id: "home",
    label: labels.nav.groups.home,
    icon: Home,
    children: [
      {
        kind: "leaf",
        href: "/dashboard",
        label: labels.nav.home,
        icon: Home,
        exact: true,
      },
      {
        kind: "leaf",
        href: "/dashboard/announcements",
        label: labels.nav.announcements,
        icon: Megaphone,
      },
    ],
  },
  {
    kind: "group",
    id: "learning",
    label: labels.nav.groups.learning,
    icon: BookOpen,
    children: [
      {
        kind: "leaf",
        href: "/dashboard/learn",
        label: labels.nav.learn,
        icon: BookOpen,
      },
      {
        kind: "leaf",
        href: "/dashboard/chat",
        label: labels.nav.chat,
        icon: MessageCircle,
      },
    ],
  },
  {
    kind: "group",
    id: "progress",
    label: labels.nav.groups.progress,
    icon: Medal,
    children: [
      {
        kind: "leaf",
        href: "/dashboard/ranking",
        label: labels.nav.ranking,
        icon: Medal,
      },
      {
        kind: "leaf",
        href: "/dashboard/badges",
        label: labels.nav.badges,
        icon: Award,
      },
      {
        kind: "leaf",
        href: "/dashboard/certificates",
        label: labels.nav.certificates,
        icon: ScrollText,
      },
      {
        kind: "leaf",
        href: "/dashboard/rewards",
        label: labels.nav.rewards,
        icon: Gift,
      },
      {
        kind: "leaf",
        href: "/dashboard/challenges",
        label: labels.nav.challenges,
        icon: Target,
      },
    ],
  },
];

export function isNavLeafActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((child) =>
    isNavLeafActive(pathname, child.href, child.exact)
  );
}

export function flattenNavLeaves(items: NavTreeItem[]): NavLeaf[] {
  return items.flatMap((item) =>
    item.kind === "leaf" ? [item] : item.children
  );
}
