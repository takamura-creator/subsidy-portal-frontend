"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchDocumentGuide,
  fetchChecklist,
  updateChecklist,
  type DocGuideItem,
  type ChecklistItem,
} from "@/lib/api";

interface Props {
  appId: string;
  entityType?: string;
}

export default function DocsGuidePanel({ appId, entityType = "株式会社" }: Props) {
  const [docs, setDocs] = useState<DocGuideItem[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsData, checklistData] = await Promise.all([
        fetchDocumentGuide(entityType),
        fetchChecklist(appId).catch(() => [] as ChecklistItem[]),
      ]);
      setDocs(docsData);
      const checkMap: Record<string, boolean> = {};
      for (const item of checklistData) {
        checkMap[item.doc_id] = item.acquired;
      }
      setChecklist(checkMap);
    } catch {
      setError("書類データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [appId, entityType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheck = async (docId: string, acquired: boolean) => {
    setChecklist((prev) => ({ ...prev, [docId]: acquired }));
    try {
      await updateChecklist(appId, docId, acquired);
    } catch {
      // ロールバック
      setChecklist((prev) => ({ ...prev, [docId]: !acquired }));
    }
  };

  const toggleExpand = (docId: string) => {
    setExpandedDoc((prev) => (prev === docId ? null : docId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">書類情報を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-sm text-blue-600 underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const acquiredCount = docs.filter((d) => checklist[d.doc_id]).length;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">書類収集チェックリスト</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            法人格: <span className="font-medium">{entityType}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{acquiredCount}</span>
          <span className="text-gray-500 text-sm"> / {docs.length} 取得済み</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all"
              style={{ width: docs.length > 0 ? `${(acquiredCount / docs.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* 書類リスト */}
      <div className="space-y-3">
        {docs.map((doc) => {
          const acquired = checklist[doc.doc_id] ?? false;
          const isExpanded = expandedDoc === doc.doc_id;

          return (
            <div
              key={doc.doc_id}
              className={`border rounded-lg transition-colors ${
                acquired ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              {/* メイン行 */}
              <div className="flex items-start gap-3 p-4">
                {/* チェックボックス */}
                <input
                  type="checkbox"
                  id={`check-${doc.doc_id}`}
                  checked={acquired}
                  onChange={(e) => handleCheck(doc.doc_id, e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`check-${doc.doc_id}`}
                    className={`font-medium cursor-pointer ${acquired ? "line-through text-gray-400" : "text-gray-900"}`}
                  >
                    {doc.name}
                  </label>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span>📍 {doc.issuing_office}</span>
                    {doc.cost_yen > 0 && <span>💴 {doc.cost_yen.toLocaleString()}円</span>}
                    {doc.cost_yen === 0 && <span>💴 無料</span>}
                    {doc.estimated_days > 0 && <span>🕐 約{doc.estimated_days}日</span>}
                    {doc.validity_months && (
                      <span>📅 有効期限: {doc.validity_months}ヶ月</span>
                    )}
                  </div>
                  {/* オンライン申請リンク */}
                  {doc.online_available && doc.online_url && (
                    <a
                      href={doc.online_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                    >
                      🌐 オンライン申請可能
                    </a>
                  )}
                </div>
                {/* 展開ボタン */}
                <button
                  onClick={() => toggleExpand(doc.doc_id)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "▲ 閉じる" : "▼ 窓口詳細"}
                </button>
              </div>

              {/* 展開: 都道府県別窓口情報 */}
              {isExpanded && doc.office_info && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50 rounded-b-lg">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">窓口情報</h4>
                  <dl className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                    <div className="flex gap-2">
                      <dt className="text-gray-400 w-20 flex-shrink-0">窓口名</dt>
                      <dd>{doc.office_info.nearest_office}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 w-20 flex-shrink-0">住所</dt>
                      <dd>{doc.office_info.address}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 w-20 flex-shrink-0">電話番号</dt>
                      <dd>{doc.office_info.phone}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 w-20 flex-shrink-0">受付時間</dt>
                      <dd>{doc.office_info.business_hours}</dd>
                    </div>
                    {doc.office_info.notes && (
                      <div className="flex gap-2">
                        <dt className="text-gray-400 w-20 flex-shrink-0">備考</dt>
                        <dd>{doc.office_info.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {docs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>対応する書類がありません</p>
        </div>
      )}
    </div>
  );
}
