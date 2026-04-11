"use client";

import { ImagePlus, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onUpload?: () => void;
  onDelete?: (id: string) => void;
}

export default function PhotoGallery({
  photos,
  onUpload,
  onDelete,
}: PhotoGalleryProps) {
  function handleUploadClick() {
    if (onUpload) {
      onUpload();
    } else {
      alert("写真アップロード機能は近日実装予定です");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-[10px] overflow-hidden border border-border bg-bg-card group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="実績写真"
              className="w-full h-full object-cover"
            />
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {photos.length < 10 && (
          <button
            type="button"
            onClick={handleUploadClick}
            className="aspect-square rounded-[10px] border-2 border-dashed border-border bg-bg-card flex flex-col items-center justify-center gap-1.5 text-text2 hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">追加</span>
          </button>
        )}
      </div>
      <p className="text-xs text-text2">
        最大10枚（JPG/PNG、5MB以下）・現在 {photos.length}/10枚
      </p>
    </div>
  );
}
