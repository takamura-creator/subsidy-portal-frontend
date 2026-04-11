"use client";

import type { ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface Sort {
  key: string;
  direction: "asc" | "desc";
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sort?: Sort;
  onSort?: (key: string) => void;
  pagination?: Pagination;
  onRowClick?: (row: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  sort,
  onSort,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div>
      {/* テーブル（横スクロール対応） */}
      <div className="overflow-x-auto rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-text2 whitespace-nowrap ${
                    col.sortable ? "cursor-pointer select-none hover:text-text" : ""
                  }`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sort?.key === col.key && (
                      sort.direction === "asc"
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-border last:border-0 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-bg-surface" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text whitespace-nowrap">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={pagination.currentPage <= 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            className="px-3 py-1.5 text-sm rounded-[10px] border border-border text-text2 hover:bg-bg-surface disabled:opacity-40 disabled:pointer-events-none transition"
          >
            前へ
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => pagination.onPageChange(p)}
              className={`w-8 h-8 text-sm rounded-[10px] transition ${
                p === pagination.currentPage
                  ? "bg-primary text-white"
                  : "border border-border text-text2 hover:bg-bg-surface"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            className="px-3 py-1.5 text-sm rounded-[10px] border border-border text-text2 hover:bg-bg-surface disabled:opacity-40 disabled:pointer-events-none transition"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
