"use client";

import { Database, MapPin, FileText, Target } from "lucide-react";
import SidebarLayout from "@/components/shared/SidebarLayout";
import type { SidebarEntry } from "@/components/shared/Sidebar";

/** /results 系ページのサイドバーナビゲーション */
const RESULTS_SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/results", label: "補助金実績一覧", icon: Database },
  { separator: true },
  { href: "/results/東京都",   label: "東京都",   icon: MapPin },
  { href: "/results/神奈川県", label: "神奈川県", icon: MapPin },
  { href: "/results/千葉県",   label: "千葉県",   icon: MapPin },
  { href: "/results/埼玉県",   label: "埼玉県",   icon: MapPin },
  { href: "/results/静岡県",   label: "静岡県",   icon: MapPin },
  { href: "/results/山梨県",   label: "山梨県",   icon: MapPin },
  { separator: true },
  { href: "/subsidies", label: "補助金一覧",       icon: FileText },
  { href: "/match",     label: "補助金マッチング", icon: Target },
];

export default function ResultsSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout sidebarItems={RESULTS_SIDEBAR_ITEMS}>
      {children}
    </SidebarLayout>
  );
}
