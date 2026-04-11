"use client";

import Link from "next/link";
import { Calendar, Banknote } from "lucide-react";
import type { BizProject } from "@/lib/api";

interface ProjectCardProps {
  project: BizProject;
  onAccept?: (id: string) => void;
}

export default function ProjectCard({ project, onAccept }: ProjectCardProps) {
  return (
    <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-text">{project.company_name}</h3>
          <p className="text-sm text-text2 mt-0.5">{project.subsidy_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-text2 mb-4">
        <span className="inline-flex items-center gap-1">
          <Banknote className="w-3.5 h-3.5" />
          ~{(project.budget / 10000).toLocaleString("ja-JP")}万円
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {project.deadline}
        </span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/biz/projects/${project.id}`}
          className="flex-1 text-center text-sm font-medium py-2 rounded-[10px] border border-border text-text2 hover:bg-bg-surface transition-colors"
        >
          詳細を見る
        </Link>
        {onAccept && project.status === "new" && (
          <button
            onClick={() => onAccept(project.id)}
            className="flex-1 text-center text-sm font-medium py-2 rounded-[10px] bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            対応可能
          </button>
        )}
      </div>
    </div>
  );
}
