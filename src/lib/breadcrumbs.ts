import { labels } from "@/lib/labels";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isCurrent?: boolean;
};

const SKILL_LABELS: Record<string, string> = {
  speaking: labels.nav.breadcrumb.speaking,
  reading: labels.nav.breadcrumb.reading,
  listening: labels.nav.breadcrumb.listening,
};

const FORMAT_LABELS: Record<string, string> = {
  "multiple-choice": labels.nav.breadcrumb.multipleChoice,
  essay: labels.nav.breadcrumb.essay,
  "speech-recognition": labels.nav.breadcrumb.speechRecognition,
};

function crumb(
  label: string,
  href?: string,
  isCurrent?: boolean
): BreadcrumbItem {
  return { label, href, isCurrent };
}

function buildAdminBreadcrumbs(segments: string[]): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    crumb(labels.nav.breadcrumb.dashboard, "/admin/dashboard"),
  ];

  if (segments[0] === "dashboard") {
    items[0].isCurrent = true;
    return items;
  }

  if (segments[0] === "users") {
    items.push(crumb(labels.nav.breadcrumb.users, "/admin/users"));

    if (segments[1] === "new") {
      items[items.length - 1]!.href = "/admin/users";
      items.push(crumb(labels.nav.breadcrumb.newUser, undefined, true));
      return items;
    }

    const userId = segments[1];
    if (userId && /^\d+$/.test(userId)) {
      items[items.length - 1]!.href = "/admin/users";
      items.push(crumb(labels.nav.breadcrumb.editUser, undefined, true));
      return items;
    }

    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  if (segments[0] === "ranking") {
    items.push(crumb(labels.nav.breadcrumb.ranking, undefined, true));
    return items;
  }

  if (segments[0] === "analytics") {
    items.push(crumb(labels.nav.breadcrumb.analytics, undefined, true));
    return items;
  }

  if (segments[0] === "gamification") {
    items.push(crumb(labels.nav.breadcrumb.gamification, undefined, true));
    return items;
  }

  if (segments[0] === "announcements") {
    items.push(crumb(labels.nav.breadcrumb.announcements, undefined, true));
    return items;
  }

  if (segments[0] === "chat") {
    items.push(crumb(labels.nav.breadcrumb.chatMonitor, undefined, true));
    return items;
  }

  if (segments[0] === "database") {
    items.push(crumb(labels.nav.breadcrumb.database, undefined, true));
    return items;
  }

  if (segments[0] === "settings") {
    items.push(crumb(labels.nav.breadcrumb.settings, undefined, true));
    return items;
  }

  if (segments[0] === "testimonials") {
    items.push(crumb(labels.nav.breadcrumb.testimonials, undefined, true));
    return items;
  }

  if (segments[0] === "api-tokens") {
    items.push(crumb(labels.nav.breadcrumb.apiTokens, "/admin/api-tokens"));

    if (segments[1] === "audit" && !segments[2]) {
      items[items.length - 1]!.href = "/admin/api-tokens";
      items.push(crumb(labels.nav.breadcrumb.apiTokensAllActivity, undefined, true));
      return items;
    }

    const tokenId = segments[1];
    if (tokenId && /^\d+$/.test(tokenId) && segments[2] === "audit") {
      items[items.length - 1]!.href = "/admin/api-tokens";
      items.push(
        crumb(labels.nav.breadcrumb.apiTokenAudit, undefined, true)
      );
      return items;
    }

    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  if (segments[0] === "assistant-knowledge") {
    items.push(crumb(labels.nav.breadcrumb.assistantKnowledge, undefined, true));
    return items;
  }

  if (segments[0] === "profile") {
    items.push(crumb(labels.nav.breadcrumb.profile, undefined, true));
    return items;
  }

  if (segments[0] !== "levels") {
    return items;
  }

  items.push(crumb(labels.nav.breadcrumb.levels, "/admin/levels"));

  const levelId = segments[1];
  if (!levelId || !/^\d+$/.test(levelId)) {
    items[1]!.isCurrent = true;
    return items;
  }

  const groupsPath = `/admin/levels/${levelId}/groups`;
  items.push(crumb(labels.nav.breadcrumb.level, groupsPath));

  if (segments[2] !== "groups") {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  if (segments[3] === "create") {
    items[items.length - 1]!.href = groupsPath;
    items.push(crumb(labels.nav.breadcrumb.newGroup, undefined, true));
    return items;
  }

  const groupId = segments[3];
  if (!groupId || !/^\d+$/.test(groupId)) {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  const editPath = `/admin/levels/${levelId}/groups/${groupId}/edit`;
  items[items.length - 1]!.href = groupsPath;
  items.push(crumb(labels.nav.breadcrumb.group, editPath));

  if (segments[4] !== "edit") {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  if (segments[5] !== "items") {
    items.push(crumb(labels.nav.breadcrumb.content, undefined, true));
    return items;
  }

  items.push(crumb(labels.nav.breadcrumb.content, editPath));

  const itemSegment = segments[6];
  if (!itemSegment) {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  if (itemSegment === "new") {
    const newPath = `${editPath}/items/new`;
    items[items.length - 1]!.href = editPath;
    items.push(crumb(labels.nav.breadcrumb.addContent, newPath));

    const type = segments[7];
    if (!type) {
      items[items.length - 1]!.isCurrent = true;
      return items;
    }

    if (type === "material") {
      items[items.length - 1]!.isCurrent = true;
      items[items.length - 1]!.label = labels.nav.breadcrumb.newMaterial;
      return items;
    }

    if (type === "question") {
      items[items.length - 1]!.label = labels.nav.breadcrumb.newQuestion;
      items[items.length - 1]!.href = `${editPath}/items/new/question`;

      const skill = segments[8];
      if (!skill) {
        items[items.length - 1]!.isCurrent = true;
        return items;
      }

      const skillPath = `${editPath}/items/new/question/${skill}`;
      items.push(
        crumb(SKILL_LABELS[skill] ?? skill, skillPath)
      );

      const format = segments[9];
      if (!format) {
        items[items.length - 1]!.isCurrent = true;
        return items;
      }

      items[items.length - 1]!.href = skillPath;
      items.push(
        crumb(FORMAT_LABELS[format] ?? format, undefined, true)
      );
      return items;
    }
  }

  if (/^\d+$/.test(itemSegment)) {
    items[items.length - 1]!.href = editPath;
    items.push(crumb(labels.nav.breadcrumb.editItem, undefined, true));
    return items;
  }

  items[items.length - 1]!.isCurrent = true;
  return items;
}

function buildStudentBreadcrumbs(segments: string[]): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    crumb(labels.nav.breadcrumb.home, "/dashboard"),
  ];

  if (segments.length === 0) {
    items[0]!.isCurrent = true;
    return items;
  }

  if (segments[0] === "chat") {
    items.push(crumb(labels.nav.breadcrumb.aiChat, undefined, true));
    return items;
  }

  if (segments[0] === "ranking") {
    items.push(crumb(labels.nav.breadcrumb.ranking, undefined, true));
    return items;
  }

  if (segments[0] === "badges") {
    items.push(crumb(labels.nav.badges, undefined, true));
    return items;
  }

  if (segments[0] === "profile") {
    items.push(crumb(labels.nav.breadcrumb.profile, undefined, true));
    return items;
  }

  if (segments[0] !== "learn") {
    items[0]!.isCurrent = true;
    return items;
  }

  items.push(crumb(labels.nav.breadcrumb.learning, "/dashboard/learn"));

  const levelId = segments[1];
  if (!levelId || !/^\d+$/.test(levelId)) {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  const levelPath = `/dashboard/learn/${levelId}`;
  items.push(crumb(labels.nav.breadcrumb.level, levelPath));

  const groupId = segments[2];
  if (!groupId || !/^\d+$/.test(groupId)) {
    items[items.length - 1]!.isCurrent = true;
    return items;
  }

  const groupPath = `/dashboard/learn/${levelId}/${groupId}`;
  items[items.length - 1]!.href = levelPath;
  items.push(crumb(labels.nav.breadcrumb.group, groupPath, true));
  return items;
}

export function buildBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "admin") {
    return buildAdminBreadcrumbs(segments.slice(1));
  }

  if (segments[0] === "dashboard") {
    return buildStudentBreadcrumbs(segments.slice(1));
  }

  return [];
}

export function applyBreadcrumbOverrides(
  items: BreadcrumbItem[],
  overrides: Record<string, string>
): BreadcrumbItem[] {
  return items.map((item) => {
    if (!item.href || !overrides[item.href]) {
      return item;
    }
    return { ...item, label: overrides[item.href] };
  });
}

export function getResponsiveBreadcrumbItems(
  items: BreadcrumbItem[]
): { visible: BreadcrumbItem[]; collapsed: BreadcrumbItem[] } {
  if (items.length <= 3) {
    return { visible: items, collapsed: [] };
  }

  return {
    collapsed: items.slice(0, items.length - 2),
    visible: items.slice(items.length - 2),
  };
}
