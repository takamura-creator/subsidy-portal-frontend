import { redirect } from "next/navigation";

// /apply は廃止（ウィザード形式に移行）→ /match にリダイレクト
export default function ApplyPage() {
  redirect("/match");
}
