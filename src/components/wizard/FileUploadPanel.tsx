"use client";

import { useRef, useState, useCallback } from "react";
import type { CollectedInfo, RequiredDocument } from "./types";

type UploadRecord = CollectedInfo["uploads"][number];

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface FileState {
  documentKey: string;
  filename: string;
  size: number;
  progress: number; // 0–100
  error?: string;
  localId: string;
}

interface Props {
  documents: RequiredDocument[];
  uploads: UploadRecord[];
  onUploadsChange: (uploads: UploadRecord[]) => void;
}

export default function FileUploadPanel({
  documents,
  uploads,
  onUploadsChange,
}: Props) {
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});

  if (documents.length === 0) {
    return (
      <p className="text-[13px] text-text-muted py-4 text-center">
        この補助金ではファイルアップロードは不要です。
      </p>
    );
  }

  function getUploadForKey(key: string): UploadRecord | undefined {
    return uploads.find((u) => u.document_key === key);
  }

  function handleFileAccepted(doc: RequiredDocument, file: File) {
    // Validate extension
    if (doc.accept) {
      const acceptedExts = doc.accept
        .split(",")
        .map((s) => s.trim().toLowerCase());
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      const mimeMatch = acceptedExts.some(
        (a) => a.startsWith(".") ? a === fileExt : file.type.startsWith(a)
      );
      if (!mimeMatch) {
        setFileStates((prev) => ({
          ...prev,
          [doc.key]: {
            documentKey: doc.key,
            filename: file.name,
            size: file.size,
            progress: 0,
            error: `対応していない形式です。許可: ${doc.accept}`,
            localId: "",
          },
        }));
        return;
      }
    }

    // Validate size
    if (file.size > MAX_BYTES) {
      setFileStates((prev) => ({
        ...prev,
        [doc.key]: {
          documentKey: doc.key,
          filename: file.name,
          size: file.size,
          progress: 0,
          error: `ファイルサイズが上限（10MB）を超えています（${formatBytes(file.size)}）`,
          localId: "",
        },
      }));
      return;
    }

    const localId = `local_${doc.key}_${Date.now()}`;

    // Simulate staged upload with progress
    setFileStates((prev) => ({
      ...prev,
      [doc.key]: {
        documentKey: doc.key,
        filename: file.name,
        size: file.size,
        progress: 0,
        localId,
      },
    }));

    // Animate progress to simulate staging (no real network call: no applicationId yet)
    let pct = 0;
    const tick = setInterval(() => {
      pct += 25;
      setFileStates((prev) => ({
        ...prev,
        [doc.key]: { ...prev[doc.key], progress: Math.min(pct, 100) },
      }));
      if (pct >= 100) {
        clearInterval(tick);
        // Commit to uploads list
        const record: UploadRecord = {
          file_id: localId,
          document_key: doc.key,
          filename: file.name,
          size: file.size,
        };
        onUploadsChange([
          ...uploads.filter((u) => u.document_key !== doc.key),
          record,
        ]);
      }
    }, 120);
  }

  function handleRemove(key: string) {
    setFileStates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onUploadsChange(uploads.filter((u) => u.document_key !== key));
  }

  return (
    <section aria-labelledby="upload-panel-heading">
      <h3
        id="upload-panel-heading"
        className="text-[14px] font-bold text-navy mb-4"
        style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
      >
        必要書類のアップロード
      </h3>

      <div className="space-y-4">
        {documents.map((doc) => {
          const uploaded = getUploadForKey(doc.key);
          const staged = fileStates[doc.key];

          return (
            <DropZone
              key={doc.key}
              doc={doc}
              uploaded={uploaded}
              staged={staged}
              onFileAccepted={(f) => handleFileAccepted(doc, f)}
              onRemove={() => handleRemove(doc.key)}
            />
          );
        })}
      </div>

      <p className="text-[11px] text-text-muted mt-3">
        ※ ファイルサイズ上限: 10MB / ファイルはブラウザ内で一時保存されます（送信は申請確定時）
      </p>
    </section>
  );
}

// ── DropZone ─────────────────────────────────────────────────

interface DropZoneProps {
  doc: RequiredDocument;
  uploaded?: UploadRecord;
  staged?: FileState;
  onFileAccepted: (file: File) => void;
  onRemove: () => void;
}

function DropZone({ doc, uploaded, staged, onFileAccepted, onRemove }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileAccepted(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const isComplete = !!uploaded && staged?.progress === 100;
  const isLoading = staged && staged.progress < 100 && !staged.error;
  const hasError = !!staged?.error;

  return (
    <div className="border border-border rounded-[10px] p-4 bg-white">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-semibold text-navy">{doc.label}</span>
        {doc.required && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
            必須
          </span>
        )}
        {isComplete && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            ✓ 完了
          </span>
        )}
        {doc.accept && (
          <span className="text-[10px] text-text-muted ml-auto">
            対応: {doc.accept}
          </span>
        )}
      </div>

      {/* Uploaded file display */}
      {uploaded && (
        <div className="flex items-center gap-2 p-2 rounded-[8px] bg-green-50 border border-green-200 mb-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 4h10v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" fill="none" stroke="var(--hc-primary)" strokeWidth="1.5"/>
            <path d="M6 1h4l2 3H4L6 1z" fill="none" stroke="var(--hc-primary)" strokeWidth="1.5"/>
          </svg>
          <span className="flex-1 text-[12px] text-green-800 font-medium truncate">
            {uploaded.filename}
          </span>
          <span className="text-[11px] text-green-600">{formatBytes(uploaded.size)}</span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${doc.label}を削除`}
            className="text-[11px] text-red-500 hover:text-red-700 transition px-1.5 py-0.5 rounded hover:bg-red-50"
          >
            削除
          </button>
        </div>
      )}

      {/* Progress bar */}
      {isLoading && staged && (
        <div className="mb-2" role="progressbar" aria-valuenow={staged.progress} aria-valuemin={0} aria-valuemax={100} aria-label="アップロード進捗">
          <div className="flex justify-between text-[11px] text-text-muted mb-1">
            <span>準備中… {staged.filename}</span>
            <span>{staged.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${staged.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {hasError && staged && (
        <p className="text-[12px] text-red-600 mb-2" role="alert">
          {staged.error}
        </p>
      )}

      {/* Drop zone (only if not already uploaded) */}
      {!uploaded && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`${doc.label}をアップロード。ドラッグ&ドロップまたはクリックでファイルを選択`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={[
            "border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer transition-colors",
            dragging
              ? "border-primary bg-blue-50"
              : "border-border hover:border-primary hover:bg-[var(--hc-bg,#f7f9fc)]",
          ].join(" ")}
        >
          <svg
            className="mx-auto mb-2 text-text-muted"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <path d="M14 4v14M9 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-[13px] text-text-muted">
            <span className="font-semibold text-primary">クリック</span>または
            ドラッグ＆ドロップ
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {doc.accept ? `対応形式: ${doc.accept} / ` : ""}最大 10MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={doc.accept || undefined}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
