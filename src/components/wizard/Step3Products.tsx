"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchProducts,
  fetchPackages,
  type Product,
  type InstallationCosts,
  type RecommendedPackage,
  ApiError,
} from "@/lib/api";
import type { ProductSelection } from "./types";

interface Props {
  selected: ProductSelection[];
  onBack: () => void;
  onNext: (items: ProductSelection[]) => void;
}

export default function Step3Products({ selected, onBack, onNext }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<RecommendedPackage[]>([]);
  const [installCosts, setInstallCosts] = useState<InstallationCosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(selected.map((s) => [s.productId, s.quantity])),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [prodRes, pkgRes] = await Promise.allSettled([
          fetchProducts({ current_lineup: true }),
          fetchPackages(),
        ]);
        if (cancelled) return;
        if (prodRes.status === "fulfilled") {
          setProducts(prodRes.value.products);
          setInstallCosts(prodRes.value.installation_costs);
        } else {
          setLoadError("製品情報の取得に失敗しました。");
        }
        if (pkgRes.status === "fulfilled") {
          setPackages(pkgRes.value.packages);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "製品情報の取得に失敗しました。",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productsById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  );

  const selectedItems: ProductSelection[] = useMemo(() => {
    return Object.entries(qty)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const p = productsById[id];
        return {
          productId: id,
          name: p?.name ?? id,
          quantity: n,
          unitPrice: p?.price_jpy ?? estimateJpy(p?.price_usd),
          categoryId: p?.category_id ?? "",
        };
      });
  }, [qty, productsById]);

  const totals = useMemo(() => calcTotals(selectedItems, installCosts), [selectedItems, installCosts]);

  function applyPackage(pkg: RecommendedPackage) {
    const next: Record<string, number> = {};
    for (const item of pkg.items) {
      next[item.product_id] = (next[item.product_id] ?? 0) + item.quantity;
    }
    setQty(next);
  }

  function setQuantity(id: string, n: number) {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(999, n | 0)) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    onNext(selectedItems);
  }

  const cameras = products.filter((p) => p.type === "camera");
  const nvrs = products.filter((p) => p.type === "nvr" || p.type === "xvr");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Step 3：製品・構成選択
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          AVTECH製品から必要な台数を選んでください。おすすめパッケージから一括選択もできます。
        </p>
      </div>

      {loading ? (
        <p className="text-[13px] text-text-muted">読み込み中...</p>
      ) : loadError ? (
        <p className="text-[13px] text-error">{loadError}</p>
      ) : (
        <>
          {/* おすすめパッケージ */}
          {packages.length > 0 && (
            <section>
              <h3 className="text-[14px] font-bold text-navy mb-2">おすすめパッケージ</h3>
              <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
                ※ 下記の参考合計は製品価格＋工事費＋ネットワーク構築費の概算です。補助金適用前の値となります。
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {packages.map((pkg) => {
                  const breakdown = calcPackageBreakdown(pkg, installCosts);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => applyPackage(pkg)}
                      className="text-left border border-border rounded-[10px] p-4 bg-white hover:border-primary transition"
                    >
                      <p className="text-[11px] font-semibold tracking-widest text-[color:var(--hc-accent)] uppercase mb-1">
                        {pkg.tier}
                      </p>
                      <p className="font-bold text-navy text-[14px] mb-2">{pkg.name}</p>
                      {breakdown ? (
                        <>
                          <p className="text-[11px] text-text-muted">
                            製品 {pkg.total_jpy.toLocaleString("ja-JP")}円 + 工事{" "}
                            {breakdown.installation.toLocaleString("ja-JP")}円
                          </p>
                          <p className="text-[11px] text-text-muted mb-1.5">
                            + ネットワーク {breakdown.network.toLocaleString("ja-JP")}円
                          </p>
                          <p className="font-bold text-primary text-[14px] mb-2">
                            参考合計 {breakdown.total.toLocaleString("ja-JP")}円〜
                          </p>
                        </>
                      ) : (
                        <p className="text-[12px] text-text-muted mb-2">
                          カメラ{pkg.camera_count}台 / 製品 {pkg.total_jpy.toLocaleString("ja-JP")}円〜
                        </p>
                      )}
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {pkg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* カメラ */}
          <ProductTable
            title="カメラ"
            products={cameras}
            qty={qty}
            onChange={setQuantity}
          />

          {/* レコーダー */}
          <ProductTable
            title="NVR / XVR（レコーダー）"
            products={nvrs}
            qty={qty}
            onChange={setQuantity}
          />
        </>
      )}

      {/* 小計 */}
      <div className="bg-bg border border-border rounded-[10px] p-4 text-[13px]">
        <div className="flex justify-between">
          <span className="text-text-muted">製品小計</span>
          <span className="font-semibold text-navy">{totals.productSubtotal.toLocaleString("ja-JP")}円</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">工事費（概算）</span>
          <span className="font-semibold text-navy">{totals.installationCost.toLocaleString("ja-JP")}円</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">ネットワーク構築費</span>
          <span className="font-semibold text-navy">{totals.networkSetupCost.toLocaleString("ja-JP")}円</span>
        </div>
        <div className="border-t border-border mt-2 pt-2 flex justify-between">
          <span className="text-text font-semibold">合計（税抜・補助金適用前）</span>
          <span className="text-primary font-bold text-[16px]">{totals.total.toLocaleString("ja-JP")}円</span>
        </div>
        <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
          ※ 工事費は台数 × 概算単価の目安値です。実際の見積もりは現場調査後に確定します。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={selectedItems.length === 0}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ（見積もり生成）
        </button>
      </div>
    </form>
  );
}

function ProductTable({
  title,
  products,
  qty,
  onChange,
}: {
  title: string;
  products: Product[];
  qty: Record<string, number>;
  onChange: (id: string, n: number) => void;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <h3 className="text-[14px] font-bold text-navy mb-2">{title}</h3>
      <div className="border border-border rounded-[10px] overflow-hidden bg-white">
        <ul className="divide-y divide-border">
          {products.map((p) => {
            const price = p.price_jpy ?? estimateJpy(p.price_usd);
            const current = qty[p.id] ?? 0;
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{p.name}</p>
                  <p className="text-[11px] text-text-muted">
                    {p.resolution ?? ""}
                    {p.form_factor ? ` / ${p.form_factor}` : ""}
                    {p.price_usd ? ` / 参考 $${p.price_usd}` : ""}
                  </p>
                </div>
                <div className="text-right text-text-muted">
                  <p className="text-[11px]">単価</p>
                  <p className="font-semibold text-navy">{price.toLocaleString("ja-JP")}円</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange(p.id, current - 1)}
                    aria-label={`${p.name}の台数を1減らす`}
                    className="w-8 h-8 rounded-full border border-border text-text hover:border-primary hover:text-primary"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={current}
                    onChange={(e) => onChange(p.id, Number(e.target.value))}
                    className="w-14 text-center border border-border rounded-[8px] py-1.5 text-[13px]"
                    aria-label={`${p.name}の台数`}
                  />
                  <button
                    type="button"
                    onClick={() => onChange(p.id, current + 1)}
                    aria-label={`${p.name}の台数を1増やす`}
                    className="w-8 h-8 rounded-full border border-border text-text hover:border-primary hover:text-primary"
                  >
                    ＋
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function calcPackageBreakdown(
  pkg: RecommendedPackage,
  installCosts: InstallationCosts | null,
): { installation: number; network: number; total: number } | null {
  if (!installCosts) return null;
  // パッケージは現行ラインナップのIPカメラ + 1台NVR構成（products.json準拠）
  // 工事費は台数 × IP カメラ単価 + NVR台数 × NVR 単価。ネットワーク構築費は1現場分。
  const nvrCount = pkg.items
    .filter((it) => /nvr|avh|dgh/i.test(it.product_id))
    .reduce((sum, it) => sum + it.quantity, 0);
  const installation =
    pkg.camera_count * installCosts.ip_camera.per_unit_jpy +
    nvrCount * installCosts.nvr.per_unit_jpy;
  const network = installCosts.network_setup.per_site_jpy;
  return {
    installation,
    network,
    total: pkg.total_jpy + installation + network,
  };
}

function estimateJpy(usd?: number | null): number {
  // price_jpy 未設定時のフォールバック（1 USD ≈ 160円 × マージン2倍の概算）
  if (!usd) return 0;
  return Math.round(usd * 320);
}

function calcTotals(
  items: ProductSelection[],
  installCosts: InstallationCosts | null,
): { productSubtotal: number; installationCost: number; networkSetupCost: number; total: number } {
  const productSubtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  if (!installCosts) {
    return { productSubtotal, installationCost: 0, networkSetupCost: 0, total: productSubtotal };
  }
  const cameraUnits = items
    .filter((it) => it.categoryId.includes("camera"))
    .reduce((sum, it) => sum + it.quantity, 0);
  const nvrUnits = items
    .filter((it) => it.categoryId.includes("nvr") || it.categoryId.includes("xvr"))
    .reduce((sum, it) => sum + it.quantity, 0);
  const installationCost =
    cameraUnits * installCosts.ip_camera.per_unit_jpy +
    nvrUnits * installCosts.nvr.per_unit_jpy;
  const networkSetupCost = items.length > 0 ? installCosts.network_setup.per_site_jpy : 0;
  return {
    productSubtotal,
    installationCost,
    networkSetupCost,
    total: productSubtotal + installationCost + networkSetupCost,
  };
}
