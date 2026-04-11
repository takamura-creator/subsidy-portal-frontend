import { redirect } from "next/navigation";

// /products は廃止（中立ポジショニング）→ トップにリダイレクト
export default function ProductsPage() {
  redirect("/");
}
