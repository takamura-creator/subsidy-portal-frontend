"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import UserRoleChangeDialog from "@/components/admin/UserRoleChangeDialog";
import {
  fetchAdminUsers,
  suspendUser,
  unsuspendUser,
  type AdminUser,
  ApiError,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "owner", label: "企業" },
  { key: "contractor", label: "業者" },
  { key: "admin", label: "管理者" },
  { key: "suspended", label: "停止中" },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "企業",
  contractor: "業者",
  admin: "管理者",
};

const PER_PAGE = 20;

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminUser | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isSuspended = activeTab === "suspended";
      const isRole = ["owner", "contractor", "admin"].includes(activeTab);
      const res = await fetchAdminUsers({
        role: isRole ? activeTab : undefined,
        status: isSuspended ? "suspended" : undefined,
        page,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      // エラー時は空表示
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    if (!requireAuth(["admin"], "/admin/users")) return;
    load();
  }, [load]);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  async function handleSuspendToggle(user: AdminUser) {
    setActionLoading(true);
    try {
      if (user.status === "suspended") {
        await unsuspendUser(user.id);
      } else {
        await suspendUser(user.id);
      }
      setSuspendConfirm(null);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "操作に失敗しました");
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: "id",
      label: "#",
      render: (row: AdminUser) => (
        <span className="text-text2 text-xs">{row.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "email",
      label: "メール",
      sortable: true,
      render: (row: AdminUser) => (
        <span className="text-xs">{row.email}</span>
      ),
    },
    {
      key: "company_name",
      label: "会社名",
      sortable: true,
    },
    {
      key: "role",
      label: "ロール",
      render: (row: AdminUser) => (
        <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium bg-secondary/10 text-secondary">
          {ROLE_LABELS[row.role] ?? row.role}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "登録日",
      sortable: true,
      render: (row: AdminUser) =>
        new Date(row.created_at).toLocaleDateString("ja-JP"),
    },
    {
      key: "status",
      label: "状態",
      render: (row: AdminUser) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "操作",
      render: (row: AdminUser) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === "suspended" ? (
            <Button
              size="sm"
              onClick={() => setSuspendConfirm(row)}
            >
              解除
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRoleChangeTarget(row)}
              >
                ロール変更
              </Button>
              <button
                type="button"
                onClick={() => setSuspendConfirm(row)}
                className="rounded-[10px] border border-error px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 transition-colors"
              >
                停止
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-slide-in">
      <PageHeader
        title="ユーザー管理"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "ユーザー管理" },
        ]}
      />

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-text2">
          <p>該当するユーザーはいません</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / PER_PAGE),
            onPageChange: setPage,
          }}
        />
      )}

      {/* ロール変更ダイアログ */}
      {roleChangeTarget && (
        <UserRoleChangeDialog
          userId={roleChangeTarget.id}
          email={roleChangeTarget.email}
          currentRole={roleChangeTarget.role}
          onClose={() => setRoleChangeTarget(null)}
          onChanged={() => {
            setRoleChangeTarget(null);
            load();
          }}
        />
      )}

      {/* 停止/解除確認ダイアログ */}
      {suspendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
            <h3 className="text-lg font-medium text-text mb-3">
              {suspendConfirm.status === "suspended" ? "ユーザーを再有効化しますか？" : "ユーザーを停止しますか？"}
            </h3>
            <p className="text-sm text-text2 mb-4">
              対象: <span className="font-medium text-text">{suspendConfirm.email}</span>
              {suspendConfirm.status !== "suspended" && (
                <>
                  <br />停止されたユーザーはログインできなくなります。
                </>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setSuspendConfirm(null)} disabled={actionLoading}>
                キャンセル
              </Button>
              {suspendConfirm.status === "suspended" ? (
                <Button size="sm" onClick={() => handleSuspendToggle(suspendConfirm)} disabled={actionLoading}>
                  {actionLoading ? "処理中..." : "解除する"}
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSuspendToggle(suspendConfirm)}
                  disabled={actionLoading}
                  className="rounded-[10px] bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                >
                  {actionLoading ? "処理中..." : "停止する"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
