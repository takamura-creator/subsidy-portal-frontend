"use client";

import Link from "next/link";
import type { BizProject } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "見積中",
  working: "施工中",
  completed: "完了",
  declined: "辞退",
};

const STATUS_CLASS: Record<string, string> = {
  new: "bg-accent/10 text-accent",
  estimating: "bg-primary/10 text-primary",
  working: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  declined: "bg-border/30 text-text2",
};

interface ProjectRowProps {
  project: BizProject;
}

export default function ProjectRow({ project }: ProjectRowProps) {
  return (
    <Link
      href={`/biz/projects/${project.id}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-bg-surface transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-text2 tabular-nums">#{project.id.slice(0, 8)}</span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            STATUS_CLASS[project.status] ?? STATUS_CLASS.declined
          }`}
        >
          {STATUS_LABEL[project.status] ?? project.status}
        </span>
        <span className="text-sm text-text">{project.company_name}</span>
      </div>
      <span className="text-xs text-text2 hidden sm:inline">{project.subsidy_name}</span>
    </Link>
  );
}
