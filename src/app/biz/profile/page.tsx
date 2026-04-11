"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import InfoSection from "@/components/shared/InfoSection";
import ProfileForm, { type ProfileFormData } from "@/components/contractors/ProfileForm";
import AreaSelector from "@/components/contractors/AreaSelector";
import CertificationSelector from "@/components/contractors/CertificationSelector";
import PhotoGallery from "@/components/contractors/PhotoGallery";
import { fetchBizProfile, updateBizProfile, type BizProfile, ApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { ExternalLink } from "lucide-react";

const INITIAL_FORM: ProfileFormData = {
  company_name: "",
  representative_name: "",
  prefecture: "",
  founded_year: "",
  employees: "",
  description: "",
};

export default function BizProfilePage() {
  const [profile, setProfile] = useState<BizProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);
  const [areas, setAreas] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Array<{ id: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!requireAuth(["contractor", "admin"], "/biz/profile")) return;

    fetchBizProfile()
      .then((p) => {
        setProfile(p);
        setFormData({
          company_name: p.company_name || "",
          representative_name: p.representative_name || "",
          prefecture: p.prefecture || "",
          founded_year: p.founded_year != null ? String(p.founded_year) : "",
          employees: p.employees != null ? String(p.employees) : "",
          description: p.description || "",
        });
        setAreas(p.areas || []);
        setQualifications(p.qualifications || []);
        setPhotos(p.photos || []);
      })
      .catch(() => {
        // プロフィール未作成の場合は空フォームを表示
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateBizProfile({
        company_name: formData.company_name,
        representative_name: formData.representative_name || undefined,
        prefecture: formData.prefecture || undefined,
        founded_year: formData.founded_year ? Number(formData.founded_year) : undefined,
        employees: formData.employees ? Number(formData.employees) : undefined,
        description: formData.description || undefined,
        areas,
        qualifications,
      });
      setProfile(updated);
      setSaveMsg("プロフィールを更新しました");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(
        err instanceof ApiError ? err.message : "保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in space-y-6">
      <PageHeader
        title="プロフィール編集"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/biz" },
          { label: "プロフィール" },
        ]}
      />

      <div className="rounded-[10px] border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-text2">
        ※ このプロフィールは{" "}
        {profile?.id ? (
          <a
            href={`/contractors/${profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            公開ページ
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          "公開ページ"
        )}
        {" "}に表示されます
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 基本情報 */}
        <InfoSection title="基本情報">
          <ProfileForm
            data={formData}
            onChange={setFormData}
            onSave={handleSave}
            saving={saving}
            saveMsg={saveMsg}
          />
        </InfoSection>

        {/* 対応エリア */}
        <InfoSection title="対応エリア">
          <AreaSelector selected={areas} onChange={setAreas} />
        </InfoSection>

        {/* 資格・認定 */}
        <InfoSection title="資格・認定">
          <CertificationSelector
            selected={qualifications}
            onChange={setQualifications}
          />
        </InfoSection>

        {/* 実績写真 */}
        <InfoSection title="実績写真">
          <PhotoGallery photos={photos} />
        </InfoSection>
      </div>
    </div>
  );
}
