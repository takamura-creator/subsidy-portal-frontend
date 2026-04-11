"use client";

import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";

const STANDARD_CERTS = [
  "電気工事士",
  "防犯設備士",
  "情報通信エンジニア",
  "電気通信工事担任者",
  "施工管理技士",
] as const;

interface CertificationSelectorProps {
  selected: string[];
  onChange: (certs: string[]) => void;
}

export default function CertificationSelector({
  selected,
  onChange,
}: CertificationSelectorProps) {
  const [customCert, setCustomCert] = useState("");

  // 標準資格のみ抽出
  const standardSelected = selected.filter((c) =>
    (STANDARD_CERTS as readonly string[]).includes(c)
  );
  // カスタム資格
  const customSelected = selected.filter(
    (c) => !(STANDARD_CERTS as readonly string[]).includes(c)
  );

  function toggleStandard(cert: string) {
    if (selected.includes(cert)) {
      onChange(selected.filter((s) => s !== cert));
    } else {
      onChange([...selected, cert]);
    }
  }

  function addCustom() {
    const trimmed = customCert.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomCert("");
    }
  }

  function removeCustom(cert: string) {
    onChange(selected.filter((s) => s !== cert));
  }

  return (
    <div className="space-y-4">
      {/* 定型資格 */}
      <div className="space-y-2">
        {STANDARD_CERTS.map((cert) => {
          const isChecked = standardSelected.includes(cert);
          return (
            <button
              key={cert}
              type="button"
              onClick={() => toggleStandard(cert)}
              className="flex items-center gap-3 w-full text-left py-1"
            >
              {isChecked ? (
                <CheckSquare className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-text2 shrink-0" />
              )}
              <span className="text-sm text-text">{cert}</span>
            </button>
          );
        })}
      </div>

      {/* カスタム資格 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          その他の資格
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-[10px] border border-border bg-bg-card px-3.5 py-2.5 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors"
            value={customCert}
            onChange={(e) => setCustomCert(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="資格名を入力"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customCert.trim()}
            className="rounded-[10px] bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            追加
          </button>
        </div>
        {customSelected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customSelected.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-accent/10 text-accent"
              >
                {cert}
                <button
                  type="button"
                  onClick={() => removeCustom(cert)}
                  className="hover:text-error"
                  aria-label={`${cert}を削除`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
