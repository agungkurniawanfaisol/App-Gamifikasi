"use client";

import { List } from "lucide-react";
import { CollapsibleLearnRail } from "@/components/student/collapsible-learn-rail";
import {
  LearningStepsCompactScope,
  useLearningStepsPanel,
} from "@/components/student/learning-steps-context";
import { labels } from "@/lib/labels";

export function LearningStepsPanel({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useLearningStepsPanel();

  return (
    <CollapsibleLearnRail
      side="left"
      collapsed={collapsed}
      onToggle={toggle}
      collapsedIcon={List}
      collapsedTooltip={labels.student.stepsOpen}
      toggleExpandLabel={labels.student.stepsExpand}
      toggleCollapseLabel={labels.student.stepsCollapse}
      panelClassName="border-border"
      collapsedWidthClass="w-20"
      useCollapsedCard
    >
      <LearningStepsCompactScope compact={collapsed}>
        {children}
      </LearningStepsCompactScope>
    </CollapsibleLearnRail>
  );
}
