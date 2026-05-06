const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (!process.env.NEXT_PUBLIC_API_URL) {
  const message =
    "[HOJYO CAME] NEXT_PUBLIC_API_URL が未設定です。localhost:8000 にフォールバックしています。" +
    " 本番環境では Railway の環境変数に NEXT_PUBLIC_API_URL を設定してください。";
  if (process.env.NODE_ENV === "production") {
    console.error(message);
  } else if (typeof window === "undefined") {
    console.warn(message);
  }
}

export interface Subsidy {
  id: string;
  name: string;
  category: string;
  ministry: string;
  pref_code: string;
  prefecture: string;
  max_amount: number;
  rate_min: number;
  rate_max: number;
  target_industries: string[];
  max_employees: number | null;
  deadline: string;
  status: string;
  description: string;
  application_tips: string;
  source_url: string;
}

export interface MatchRequest {
  industry: string;
  employees: number;
  prefecture: string;
  purpose: string;
}

export interface MatchedSubsidy {
  subsidy: Subsidy;
  match_score: string;
  estimated_cost: number;
  estimated_after_subsidy: number;
  application_advice: string;
}

export interface MatchResponse {
  input_params: MatchRequest;
  matches: MatchedSubsidy[];
  overall_recommendation: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<T> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      ...options,
    });
    if (!res.ok) {
      const message =
        res.status === 429
          ? "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。"
          : `APIエラーが発生しました（ステータス: ${res.status}）`;
      throw new ApiError(res.status, message);
    }
    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError(408, "リクエストがタイムアウトしました（10秒）");
    }
    throw new ApiError(0, "ネットワークエラーが発生しました");
  }
}

export async function fetchSubsidies(params?: {
  prefecture?: string;
  category?: string;
  industry?: string;
}): Promise<{ total: number; subsidies: Subsidy[] }> {
  const query = new URLSearchParams();
  if (params?.prefecture) query.set("prefecture", params.prefecture);
  if (params?.category) query.set("category", params.category);
  if (params?.industry) query.set("industry", params.industry);
  return apiFetch(`${API_URL}/api/subsidies?${query}`, {
    next: { revalidate: 300 },
  });
}

export async function fetchSubsidy(id: string): Promise<Subsidy> {
  return apiFetch(`${API_URL}/api/subsidies/${id}`, {
    next: { revalidate: 300 },
  });
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "owner";
  company_name: string;
  pref_code: string;
}

export interface RegisterResponse {
  message: string;
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return apiFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function matchSubsidies(
  req: MatchRequest
): Promise<MatchResponse> {
  return apiFetch(`${API_URL}/api/subsidies/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

// --- 認証付きAPI（マイページ用） ---

export interface ApplicationSummary {
  submitted: number;
  approved: number;
  deadline_soon: number;
}

export interface Application {
  id: string;
  subsidy_id: string;
  subsidy_name?: string;
  company_name: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResponse {
  total: number;
  applications: Application[];
  summary?: ApplicationSummary;
}

export interface UserProfile {
  id: string;
  email: string;
  role: "owner" | "admin";
  company_name: string;
  pref_code: string;
}

export async function fetchMyDashboard(): Promise<ApplicationListResponse> {
  return authFetch(`${API_URL}/api/applications?summary=true`);
}

export async function fetchMyApplications(params?: {
  status?: string;
  page?: number;
  sort?: string;
}): Promise<ApplicationListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.sort) query.set("sort", params.sort);
  return authFetch(`${API_URL}/api/applications?${query}`);
}

export async function updateApplication(
  id: string,
  data: Partial<Application>
): Promise<Application> {
  return authFetch(`${API_URL}/api/applications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  return authFetch(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
  });
}

export async function fetchProfile(): Promise<UserProfile> {
  return authFetch(`${API_URL}/api/auth/me`);
}

// --- 申請詳細・ウィザード・設定（T3追加分） ---

export interface ApplicationDocument {
  name: string;
  uploaded: boolean;
  url?: string;
}

/** 申請詳細（GET /api/applications/[id]の完全レスポンス） */
export interface ApplicationDetail extends Application {
  industry?: string;
  employees?: number;
  annual_revenue?: number;
  prefecture?: string;
  representative_name?: string;
  phone?: string;
  email?: string;
  plan_text?: string;
  documents?: ApplicationDocument[];
  subsidy?: Subsidy;
  submitted_at?: string;
}

/** ユーザープロフィール詳細 */
export interface UserProfileDetail extends UserProfile {
  representative_name?: string;
  industry?: string;
  employees?: number;
  annual_revenue?: number;
  prefecture?: string;
  phone?: string;
}

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  return authFetch(`${API_URL}/api/applications/${id}`);
}

export async function createApplication(
  data: Record<string, unknown>
): Promise<ApplicationDetail> {
  return authFetch(`${API_URL}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function generatePdf(id: string): Promise<Blob> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/api/applications/${id}/generate-pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new ApiError(res.status, "PDF生成に失敗しました");
  }
  return res.blob();
}

export async function fetchProfileDetail(): Promise<UserProfileDetail> {
  return authFetch(`${API_URL}/api/auth/me`);
}

export async function updateProfile(
  data: Partial<UserProfileDetail>
): Promise<UserProfileDetail> {
  return authFetch(`${API_URL}/api/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/auth/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(password: string): Promise<void> {
  return authFetch(`${API_URL}/api/auth/me`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

// --- 管理画面 ---

export interface AdminDashboard {
  total_users: number;
  total_applications: number;
  total_matches: number;
  recent_activities: Array<{
    type: string;
    detail: string;
    created_at: string;
  }>;
}

export interface AdminSubsidy extends Subsidy {
  admin_status: "active" | "expired" | "draft";
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  return authFetch(`${API_URL}/api/admin/dashboard`);
}

export async function fetchAdminSubsidies(params?: {
  status?: string;
  page?: number;
  keyword?: string;
}): Promise<{ total: number; subsidies: AdminSubsidy[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.keyword) query.set("keyword", params.keyword);
  return authFetch(`${API_URL}/api/admin/subsidies?${query}`);
}

export async function fetchAdminSubsidy(id: string): Promise<AdminSubsidy> {
  return authFetch(`${API_URL}/api/admin/subsidies/${id}`);
}

export async function createSubsidy(data: Partial<Subsidy>): Promise<AdminSubsidy> {
  return authFetch(`${API_URL}/api/admin/subsidies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateSubsidy(id: string, data: Partial<Subsidy>): Promise<AdminSubsidy> {
  return authFetch(`${API_URL}/api/admin/subsidies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteSubsidy(id: string): Promise<void> {
  return authFetch(`${API_URL}/api/admin/subsidies/${id}`, { method: "DELETE" });
}

export async function importSubsidiesCSV(file: File): Promise<{ imported: number; errors: string[] }> {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/api/admin/subsidies/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new ApiError(res.status, "CSVインポートに失敗しました");
  return res.json();
}

export type AdminApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected";

export interface AdminApplication {
  id: string;
  user_email: string;
  company_name: string;
  subsidy_id: string;
  subsidy_name?: string;
  status: AdminApplicationStatus;
  industry?: string;
  employees?: number;
  annual_revenue?: number;
  prefecture?: string;
  representative_name?: string;
  phone?: string;
  email?: string;
  plan_text?: string;
  documents?: ApplicationDocument[];
  subsidy?: Subsidy;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export async function fetchAdminApplications(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ total: number; applications: AdminApplication[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  return authFetch(`${API_URL}/api/admin/applications?${query}`);
}

export async function updateApplicationStatus(
  id: string,
  status: AdminApplicationStatus
): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/applications/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export interface AdminUser {
  id: string;
  email: string;
  company_name: string;
  role: "owner" | "admin";
  status: "active" | "suspended";
  created_at: string;
}

export async function fetchAdminUsers(params?: {
  role?: string;
  status?: string;
  page?: number;
}): Promise<{ total: number; users: AdminUser[] }> {
  const query = new URLSearchParams();
  if (params?.role) query.set("role", params.role);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return authFetch(`${API_URL}/api/admin/users?${query}`);
}

export async function updateUserRole(
  id: string,
  role: "owner" | "admin"
): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

export async function suspendUser(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/users/${id}/suspend`, {
    method: "PUT",
  });
}

export async function unsuspendUser(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/users/${id}/unsuspend`, {
    method: "PUT",
  });
}

// --- リフレッシュトークン ---

export async function refreshToken(): Promise<LoginResponse> {
  const token = localStorage.getItem("refresh_token");
  if (!token) throw new ApiError(401, "リフレッシュトークンがありません");
  return apiFetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  });
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

/** 認証付きAPI呼び出し。401時にリフレッシュトークンで自動リトライする */
export async function authFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };

  try {
    return await apiFetch<T>(url, { ...options, headers });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // アクセストークン期限切れ → リフレッシュ試行
      try {
        const res = await refreshToken();
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
        const retryHeaders: Record<string, string> = {
          ...(options.headers as Record<string, string>),
          Authorization: `Bearer ${res.access_token}`,
        };
        return await apiFetch<T>(url, { ...options, headers: retryHeaders });
      } catch {
        // リフレッシュも失敗 → 再ログインが必要
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        throw new ApiError(401, "セッションが期限切れです。再度ログインしてください。");
      }
    }
    throw err;
  }
}

// --- 交付実績 ---

export interface SubsidyRecipient {
  id: string;
  subsidy_name: string;
  subsidy_category: string;
  fiscal_year: number;
  recipient_name: string;
  recipient_prefecture: string;
  recipient_city: string;
  industry: string;
  grant_amount: number;
  project_summary: string;
  source_url: string;
  source_ministry: string;
  published_date: string;
  created_at: string;
}

export interface RecipientListResponse {
  total: number;
  recipients: SubsidyRecipient[];
}

export interface PrefectureSummary {
  prefecture: string;
  count: number;
  total_amount: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  total_amount: number;
}

export interface FiscalYearSummary {
  fiscal_year: number;
  count: number;
  total_amount: number;
}

export interface RecipientStatsResponse {
  total_records: number;
  total_amount: number;
  by_prefecture: PrefectureSummary[];
  by_category: CategorySummary[];
  by_fiscal_year: FiscalYearSummary[];
}

export async function fetchRecipients(params?: {
  prefecture?: string;
  category?: string;
  fiscal_year?: number;
  keyword?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}): Promise<RecipientListResponse> {
  const query = new URLSearchParams();
  if (params?.prefecture) query.set("prefecture", params.prefecture);
  if (params?.category) query.set("category", params.category);
  if (params?.fiscal_year) query.set("fiscal_year", String(params.fiscal_year));
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  return apiFetch(`${API_URL}/api/recipients?${query}`, {
    next: { revalidate: 300 },
  });
}

export async function fetchRecipientStats(): Promise<RecipientStatsResponse> {
  return apiFetch(`${API_URL}/api/recipients/stats`, {
    next: { revalidate: 300 },
  });
}

export async function fetchPrefecturesSummary(): Promise<PrefectureSummary[]> {
  return apiFetch(`${API_URL}/api/recipients/prefectures`, {
    next: { revalidate: 300 },
  });
}

// --- Sprint 1: 製品 / エリア判定 / 見積もり ---

export interface ProductSpec {
  codec?: string;
  ir?: boolean;
  dual_light?: boolean;
  lens?: string;
  sensor?: string;
  onvif?: boolean;
  poe?: boolean;
  outdoor?: boolean;
  hdd_bay?: number;
  channels?: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  type: "camera" | "nvr" | "xvr";
  form_factor?: string;
  resolution?: string;
  price_usd?: number | null;
  price_jpy?: number | null;
  specs?: ProductSpec;
  features?: string[];
  recommended_nvr?: string[];
  use_cases?: string[];
  subsidy_eligible?: string[];
  current_lineup?: boolean;
}

export interface InstallationCosts {
  ip_camera: { per_unit_jpy: number; description?: string };
  analog_camera: { per_unit_jpy: number; description?: string };
  nvr: { per_unit_jpy: number; description?: string };
  network_setup: { per_site_jpy: number; description?: string };
}

export interface ProductListResponse {
  total: number;
  products: Product[];
  installation_costs: InstallationCosts;
}

export interface RecommendedPackage {
  id: string;
  name: string;
  tier: "economy" | "standard" | "premium" | "large";
  total_jpy: number;
  camera_count: number;
  description: string;
  items: Array<{ product_id: string; quantity: number }>;
}

export interface PackageListResponse {
  packages: RecommendedPackage[];
}

export async function fetchProducts(params?: {
  category_id?: string;
  current_lineup?: boolean;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.category_id) query.set("category_id", params.category_id);
  if (params?.current_lineup !== undefined) query.set("current_lineup", String(params.current_lineup));
  return apiFetch(`${API_URL}/api/products?${query}`, {
    next: { revalidate: 300 },
  });
}

export async function fetchPackages(): Promise<PackageListResponse> {
  return apiFetch(`${API_URL}/api/products/packages`, {
    next: { revalidate: 300 },
  });
}

export interface AreaCheckResponse {
  in_service_area: boolean;
  prefecture: string;
  service_prefectures: string[];
}

export async function checkArea(prefecture: string): Promise<AreaCheckResponse> {
  const query = new URLSearchParams({ prefecture });
  return apiFetch(`${API_URL}/api/area/check?${query}`);
}

export interface EstimateItem {
  product_id: string;
  product_name?: string;
  role?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface EstimateRequest {
  subsidy_id?: string;
  items: Array<{ product_id: string; quantity: number }>;
  site_count?: number;
}

export interface Estimate {
  id: string;
  user_id?: string;
  subsidy_id?: string;
  items: EstimateItem[];
  installation_cost: number;
  network_setup_cost: number;
  total_before_subsidy: number;
  subsidy_amount: number;
  self_payment: number;
  status: "draft" | "confirmed";
  created_at: string;
  updated_at: string;
}

export async function createEstimate(req: EstimateRequest): Promise<Estimate> {
  return authFetch(`${API_URL}/api/estimates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function fetchEstimates(): Promise<{ total: number; estimates: Estimate[] }> {
  return authFetch(`${API_URL}/api/estimates`);
}

export async function fetchEstimate(id: string): Promise<Estimate> {
  return authFetch(`${API_URL}/api/estimates/${id}`);
}

export async function generateEstimatePdf(id: string): Promise<Blob> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/api/estimates/${id}/generate-pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new ApiError(res.status, "見積書PDFの生成に失敗しました");
  }
  return res.blob();
}

export interface LeadCaptureRequest {
  email: string;
  prefecture: string;
  source: string;
  consent: boolean;
}

export async function submitLead(req: LeadCaptureRequest): Promise<{ message: string }> {
  return apiFetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

// --- Sprint 2: 申請書類生成（Tier 1: 神奈川県テンプレート差込） ---

export type Tier1SubsidyType = "kanagawa_digital";

export interface Tier1CompanyInfo {
  name: string;
  representative_name: string;
  address: string;
  prefecture: string;
  industry: string;
  employees: number;
}

export interface DocumentTemplate {
  id: string;
  subsidy_type: string;
  name: string;
  format: "docx" | "xlsx";
  auto_fill_level: "full" | "partial" | "manual";
  description: string;
}

export interface DocumentGenerateRequest {
  estimate_id: string;
  subsidy_type: Tier1SubsidyType;
  template_id: string; // 例: "form_1", "form_1_2", "all"
  company_info: Tier1CompanyInfo;
  additional_fields?: Record<string, string>;
}

export async function fetchDocumentTemplates(params?: {
  subsidy_type?: string;
}): Promise<DocumentTemplate[]> {
  const query = new URLSearchParams();
  if (params?.subsidy_type) query.set("subsidy_type", params.subsidy_type);
  return apiFetch(`${API_URL}/api/documents/templates?${query}`);
}

/**
 * Word/Excel ファイル本体を Blob で取得する。
 * 単一テンプレート時は .docx/.xlsx、`template_id="all"` 時は .zip が返る。
 */
export async function generateDocument(req: DocumentGenerateRequest): Promise<{
  blob: Blob;
  filename: string;
  contentType: string;
}> {
  const res = await fetch(`${API_URL}/api/documents/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      data.detail || "書類の生成に失敗しました",
    );
  }
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  // Content-Disposition から filename を抜き出し（なければフォールバック）
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/);
  const fallback =
    req.template_id === "all"
      ? `documents_${req.estimate_id.slice(0, 8)}.zip`
      : `${req.template_id}_${req.estimate_id.slice(0, 8)}`;
  const filename = match?.[1] ?? fallback;
  return { blob: await res.blob(), filename, contentType };
}

// --- Sprint 2: 申請書類下書き生成（Tier 2） ---
// Sprint 3 Task 0: 型命名統一（フリーレン提案D）
// Tier 1 (kanagawa_digital) と Tier 2 (jizokuka/it_dounyu/monodzukuri) を明示的に分離。
// `DocumentSubsidyType` は両 Tier の union で、画面側の分岐判定に使用する。

export type Tier2SubsidyType = "jizokuka" | "it_dounyu" | "monodzukuri";
export type DocumentSubsidyType = Tier1SubsidyType | Tier2SubsidyType;

export interface DraftCompanyInfo {
  name: string;
  representative_name: string;
  industry: string;
  employees: number;
  prefecture: string;
  address: string;
  annual_revenue?: number;
}

export interface DraftGenerateRequest {
  estimate_id: string;
  subsidy_type: Tier2SubsidyType;
  company_info: DraftCompanyInfo;
  business_description?: string;
}

export interface DraftSection {
  title: string;
  content: string;
  notes?: string | null;
  max_chars?: number | null;
}

export interface DraftGenerateResponse {
  subsidy_type: Tier2SubsidyType;
  sections: DraftSection[];
  generated_at: string;
  disclaimer: string;
  model: string;
  fallback: boolean;
}

export async function requestDraftGeneration(
  req: DraftGenerateRequest,
): Promise<DraftGenerateResponse> {
  const res = await fetch(`${API_URL}/api/documents/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      data.detail || "下書き生成でエラーが発生しました",
    );
  }
  return res.json();
}

// --- AI書類作成補助 ---

export interface DraftAssistRequest {
  subsidy_id: string;
  company_info: {
    name: string;
    industry: string;
    employees: number;
    prefecture: string;
  };
  field: "purpose" | "business_plan" | "expected_effect";
  user_input: string;
}

export interface DraftAssistResponse {
  draft_text: string;
  tips: string[];
  confidence: "high" | "medium" | "low";
}

export async function fetchAiStatus(): Promise<{ available: boolean }> {
  const res = await fetch(`${API_URL}/api/ai/status`);
  if (!res.ok) return { available: false };
  return res.json();
}

export async function requestDraftAssist(req: DraftAssistRequest): Promise<DraftAssistResponse> {
  const res = await fetch(`${API_URL}/api/ai/draft-assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.detail || "AI機能でエラーが発生しました");
  }
  return res.json();
}
