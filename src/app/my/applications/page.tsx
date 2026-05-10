import { redirect } from "next/navigation";

/**
 * 申請一覧ページはダッシュボードに統合されたため /my にリダイレクト。
 * /my/applications/[id]（詳細）と /my/applications/new（新規）は引き続き有効。
 */
export default function ApplicationsIndex() {
  redirect("/my");
}
