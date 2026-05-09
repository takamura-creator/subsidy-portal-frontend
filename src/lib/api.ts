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

export interface SubsidyDocument {
  key: string;
  label: string;
  accept?: string;
  required: boolean;
  note?: string;
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
  document_tier?: number;
  draft_subsidy_type?: string;
  required_documents?: SubsidyDocument[];
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
  const DEFAULT_TIMEOUT = 10000;
  const { signal: customSignal, ...restOptions } = options;
  const timeoutMs = customSignal ? undefined : DEFAULT_TIMEOUT;
  const effectiveSignal = customSignal ?? AbortSignal.timeout(DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...restOptions,
      signal: effectiveSignal,
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
      const sec = timeoutMs ? Math.round(timeoutMs / 1000) : "—";
      throw new ApiError(408, `リクエストがタイムアウトしました（${sec}秒）`);
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
  representative?: string;   // F5: 代表者名（任意）
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
    signal: AbortSignal.timeout(30000), // AI診断はAnthropicを呼ぶため30秒に延長
  });
}

// --- 認証付きAPI（マイページ用） ---

export interface ApplicationSummary {
  draft: number;
  submitted: number;
  approved: number;
  deadline_soon: number;
}

export interface Application {
  id: string;
  subsidy_id: string;
  subsidy_name?: string;
  company_name: string;
  estimated_cost?: number;
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
  prefecture?: string;   // F4: pref_code のエイリアス（バックエンドが同値で返す）
}

export async function fetchMyDashboard(): Promise<ApplicationListResponse> {
  const [list, summary] = await Promise.all([
    authFetch(`${API_URL}/api/applications?per_page=5&sort=-updated_at`) as Promise<ApplicationListResponse>,
    (authFetch(`${API_URL}/api/applications/summary`) as Promise<ApplicationSummary>).catch(
      (): ApplicationSummary => ({ draft: 0, submitted: 0, approved: 0, deadline_soon: 0 }),
    ),
  ]);
  return { ...list, summary };
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
  representative?: string;
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
        // リフレッシュも失敗 → ログアウトしてログインページへリダイレクト
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/login?returnUrl=${returnUrl}`;
        }
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
  items: Array<{ product_id: string; quantity: number; product_name?: string }>;
  ip_camera_count?: number;
  analog_camera_count?: number;
  nvr_count?: number;
  subsidy_rate?: number;
  subsidy_max?: number;
  company_name?: string;
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

// --- 問い合わせフォーム ---

export interface ContactRequest {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  estimate_id?: string;
  message: string;
  consent: boolean;
}

export interface ContactResponse {
  message: string;
  inquiry_id: string;
}

export async function submitContact(req: ContactRequest): Promise<ContactResponse> {
  return apiFetch(`${API_URL}/api/contact`, {
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

export type Tier2SubsidyType = "jizokuka" | "it_dounyu" | "monodzukuri" | "gyomu_kaizen";
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
    const detailMsg = Array.isArray(data.detail)
      ? data.detail.map((e: { msg?: string }) => e.msg ?? JSON.stringify(e)).join(", ")
      : (data.detail || "下書き生成でエラーが発生しました");
    throw new ApiError(res.status, detailMsg);
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

// --- ダッシュボード活動・通知・マッチング履歴（JR-DASHBOARD-LIVE-DATA） ---

export interface ActivityItem {
  id: string;
  event_type: string;
  description: string;
  entity_id?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  is_read: boolean;
  entity_id?: string;
  created_at: string;
}

export interface MatchHistoryItem {
  id: string;
  industry: string;
  employees: number;
  prefecture: string;
  purpose: string;
  results: Array<{
    subsidy_id?: string;
    match_score?: string;
    estimated_cost?: number;
    estimated_after_subsidy?: number;
    application_advice?: string;
  }>;
  match_count: number;
  created_at: string;
}

export interface MatchHistoryListResponse {
  total: number;
  matches: MatchHistoryItem[];
}

export async function fetchActivities(limit?: number): Promise<{ activities: ActivityItem[] }> {
  const query = new URLSearchParams();
  if (limit) query.set("limit", String(limit));
  return authFetch(`${API_URL}/api/dashboard/activities?${query}`);
}

export async function fetchNotifications(): Promise<{ notifications: NotificationItem[] }> {
  return authFetch(`${API_URL}/api/dashboard/notifications`);
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/dashboard/notifications/${id}/read`, { method: "PUT" });
}

export async function fetchMatchHistory(params?: {
  date_filter?: string;
  page?: number;
  per_page?: number;
}): Promise<MatchHistoryListResponse> {
  const query = new URLSearchParams();
  if (params?.date_filter) query.set("date_filter", params.date_filter);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  return authFetch(`${API_URL}/api/my/matches?${query}`);
}

export async function saveMatchHistory(data: {
  industry: string;
  employees: number;
  prefecture: string;
  purpose: string;
  results: unknown[];
  match_count: number;
}): Promise<{ id: string; message: string }> {
  return authFetch(`${API_URL}/api/my/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ============================================================
// Sprint 4 補助情報収集 API（JR-SUBSIDY-COLLECT-BACKEND）
// T2/T3 が利用する固定API契約
// ============================================================

export interface RequiredInfoField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "url" | string;
  required: boolean;
  source: string;
}

export interface RequiredDocument {
  key: string;
  label: string;
  accept: string;
  required: boolean;
}

export interface ExtractionResponse {
  extracted_fields: Record<string, string | number | null>;
  fallback: boolean;
  errors?: string[];
}

export interface UploadedFileInfo {
  file_id: string;
  application_id: string;
  document_key: string;
  filename: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface CollectedInfo {
  extracted: Record<string, string | number | null>;
  manual: Record<string, string | number | null>;
  uploads: UploadedFileInfo[];
}

/** ホームページURLからClaude LLMで会社情報を抽出 */
export async function extractFromHomepage(
  url: string,
  subsidyId: string,
): Promise<ExtractionResponse> {
  return authFetch(`${API_URL}/api/extractions/homepage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, subsidy_id: subsidyId }),
  });
}

/** 書類ファイルをアップロード */
export async function uploadDocument(
  applicationId: string,
  file: File,
  documentKey: string,
): Promise<UploadedFileInfo> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_key", documentKey);
  const res = await fetch(`${API_URL}/api/applications/${applicationId}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "アップロードに失敗しました");
    throw new ApiError(res.status, msg);
  }
  return res.json();
}

/** 抽出結果・手動入力・アップロード書類を統合取得 */
export async function getCollectedInfo(applicationId: string): Promise<CollectedInfo> {
  return authFetch(`${API_URL}/api/applications/${applicationId}/collected_info`);
}

/** 手動入力値を保存 */
export async function updateCollectedInfoManual(
  applicationId: string,
  manual: Record<string, string | number | null>,
): Promise<CollectedInfo> {
  return authFetch(`${API_URL}/api/applications/${applicationId}/collected_info`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manual }),
  });
}

/** LLM抽出結果をサーバーに保存 */
export async function saveExtractedInfo(
  applicationId: string,
  extractedFields: Record<string, string | number | null>,
): Promise<{ extracted: Record<string, unknown>; manual: Record<string, unknown> }> {
  return authFetch(`${API_URL}/api/applications/${applicationId}/collected_info/extracted`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_fields: extractedFields }),
  });
}

/** 補助金マスタから required_info_fields / required_documents を取得 */
export async function getSubsidySchema(subsidyId: string): Promise<{
  required_info_fields: RequiredInfoField[];
  required_documents: RequiredDocument[];
}> {
  const res = await apiFetch(`${API_URL}/api/subsidies/${subsidyId}`);
  return {
    required_info_fields: (res as Record<string, unknown>).required_info_fields as RequiredInfoField[] ?? [],
    required_documents: (res as Record<string, unknown>).required_documents as RequiredDocument[] ?? [],
  };
}

// --- Sprint 5: 公式様式自動差込（神奈川DX専用） ---

export type SprintFiveTaxStatus = "taxable" | "exempt" | "simplified";

export interface FilledCostItem {
  cost_category: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  is_tax_included: boolean;
  is_cloud_service?: boolean;
  contract_months?: number;
  eligible_months?: number;
}

export interface FilledCompanyInfo {
  company_name: string;
  company_name_kana?: string;
  address?: string;
  representative_title?: string;
  representative_name?: string;
  representative_name_kana?: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface FilledProjectInfo {
  application_date?: string;
  project_title?: string;
  schedule_start?: string;
  schedule_end?: string;
  current_challenges?: string;
  tool_name?: string;
  vendor_name?: string;
  vendor_address?: string;
  expected_effect_quantitative?: string;
  expected_effect_qualitative?: string;
  kpi_productivity?: number;
  security_measures?: string;
  data_utilization?: string;
  support_organization?: string;
  support_contents?: string;
  county_external_reason?: string;
}

export interface GenerateFilledRequest {
  subsidy_id: "kanagawa-dx-2026";
  application_id?: string;
  tax_status: SprintFiveTaxStatus;
  rate: number;
  company: FilledCompanyInfo;
  project?: FilledProjectInfo;
  cost_items: FilledCostItem[];
}

export interface GeneratedFile {
  template_id: string;
  filename: string;
  download_url: string;
  unfilled_fields: string[];
}

export interface GenerateFilledWarning {
  code: string;
  message: string;
  field?: string;
}

export interface SubsidyCalculation {
  total_cost_excl_tax: number;
  eligible_amount: number;
  subsidy_amount: number;
  self_funding: number;
  rate_applied: number;
}

export interface GenerateFilledResponse {
  generated_files: GeneratedFile[];
  warnings: GenerateFilledWarning[];
  subsidy_calculation: SubsidyCalculation;
}

export async function generateFilledDocuments(
  req: GenerateFilledRequest,
): Promise<GenerateFilledResponse> {
  const res = await fetch(`${API_URL}/api/documents/generate-filled`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.detail || "公式様式の差込生成に失敗しました");
  }
  return res.json();
}

export async function downloadFilledDocument(downloadUrl: string): Promise<Blob> {
  const res = await fetch(`${API_URL}${downloadUrl}`, {
    method: "GET",
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new ApiError(res.status, "差込済み書類のダウンロードに失敗しました");
  }
  return res.blob();
}

// --- M-3: 認証付きファイルダウンロード（JR-FILEUPLOAD-HARDEN） ---

/**
 * アップロード済み書類を認証付きエンドポイント経由でダウンロードする。
 * ファイルパスを直接参照せず、バックエンドで所有権確認・復号を行う。
 */
export async function downloadUploadedFile(
  applicationId: string,
  fileId: string
): Promise<Blob> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${API_URL}/api/applications/${applicationId}/uploads/${fileId}`,
    {
      headers: { Authorization: `Bearer ${token ?? ""}` },
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) {
    throw new ApiError(res.status, "ファイルのダウンロードに失敗しました");
  }
  return res.blob();
}

// --- Sprint 6: 事業計画書AIドラフト生成 ---

export interface DraftChapter {
  chapter_id: string;
  title: string;
  content: string;
  version_num: number;
  generated_by: string;
  has_ng_word: boolean;
  requires_info: boolean;
}

export interface AIDraftResponse {
  draft_id: string;
  application_id: string;
  subsidy_id: string;
  status: string;
  chapters: DraftChapter[];
  created_at: string;
  warning?: string;   // F3-3: モック時・AIキー未設定時の警告メッセージ
}

export interface AIDraftRequest {
  subsidy_id: string;
  subsidy_name: string;
  company_name: string;
  industry: string;
  company_info?: Record<string, string>;
  collected_answers?: Record<string, string>;
  drill_down_answers?: Array<{ question: string; answer: string }>;
}

export async function generateAIDraft(
  appId: string,
  req: AIDraftRequest,
): Promise<AIDraftResponse> {
  return authFetch(`${API_URL}/api/v1/applications/${appId}/draft/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: AbortSignal.timeout(120000),
  });
}

export async function fetchDraft(
  appId: string,
  draftId: string,
): Promise<AIDraftResponse> {
  return authFetch(`${API_URL}/api/v1/applications/${appId}/draft/${draftId}`);
}

export interface ScoreBreakdownItem {
  criterion: string;
  score: number;
  max: number;
  feedback: string;
}

export interface ScoreResponse {
  score_breakdown: ScoreBreakdownItem[];
  feedback: string[];
  confidence_level: string;
  disclaimer?: string;  // M7 修正: 採択保証なし免責
}

export async function scoreApplication(
  appId: string,
  subsidyId: string,
  fieldValues?: Record<string, string>,
): Promise<ScoreResponse> {
  return authFetch(`${API_URL}/api/applications/${appId}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subsidy_id: subsidyId,
      field_values: fieldValues ?? {},
    }),
  });
}

// --- Sprint 7: 書類収集ガイド ---

export interface DocGuideItem {
  doc_id: string;
  name: string;
  issuing_office: string;
  cost_yen: number;
  estimated_days: number;
  validity_months: number | null;
  online_available: boolean;
  online_url: string | null;
  applicable_entities: string[];
  exclude_for_npo: boolean;
  office_info?: PrefectureOfficeInfo;
}

export interface PrefectureOfficeInfo {
  nearest_office: string;
  address: string;
  phone: string;
  business_hours: string;
  notes: string;
}

export interface ChecklistItem {
  doc_id: string;
  acquired: boolean;
}

export interface DeadlineCalcResponse {
  application_date: string;
  lead_days: number;
  latest_obtain_date: string;
}

export async function fetchDocumentGuide(entityType: string): Promise<DocGuideItem[]> {
  const query = new URLSearchParams({ entity_type: entityType });
  return apiFetch(`${API_URL}/api/docs-guide/documents?${query}`);
}

export async function fetchPrefectureGuide(
  prefecture: string,
  issuingOffice: string,
): Promise<PrefectureOfficeInfo & { prefecture: string; issuing_office: string }> {
  return apiFetch(
    `${API_URL}/api/docs-guide/prefecture/${encodeURIComponent(prefecture)}/${encodeURIComponent(issuingOffice)}`,
  );
}

export async function fetchChecklist(appId: string): Promise<ChecklistItem[]> {
  return authFetch(`${API_URL}/api/applications/${appId}/checklist`);
}

export async function updateChecklist(
  appId: string,
  docId: string,
  acquired: boolean,
): Promise<{ success: boolean; doc_id: string; acquired: boolean }> {
  return authFetch(`${API_URL}/api/applications/${appId}/checklist`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId, acquired }),
  });
}

// --- Phase 3: 戦略情報 ---

export interface BonusItem {
  id: string;
  name: string;
  description: string;
  acquisition_days: number;
  difficulty: string;
  strategic_value: string;
  applicable_subsidies: string[];
  how_to_acquire: string;
  priority: string;
  warnings: string[];
}

export interface RedFlag {
  id: string;
  pattern: string;
  severity: string;
  detail: string;
  advice: string;
}

export interface IndustryContext {
  name: string;
  bottleneck: string;
  solution: string;
  ripple_effect: string;
  loss_formula: { formula: string; example: string };
  kpi_targets: Array<{ category: string; name: string; target: string; value_scenario: string }>;
  before_after: Array<{ metric: string; before: string; after: string; improvement: string }>;
}

export async function fetchBonusItems(): Promise<{ items: BonusItem[] }> {
  return apiFetch(`${API_URL}/api/v1/strategy/bonus-items`);
}

export async function fetchIndustryContext(industry: string): Promise<IndustryContext> {
  return apiFetch(`${API_URL}/api/v1/strategy/industry/${encodeURIComponent(industry)}`);
}

// ── 事業計画書 半自動作成 ──────────────────────────────────────

export interface BPRationale {
  title: string;
  rationale: string;
  source: string;
}

export interface BPQuestion {
  id: string;
  question: string;
  type: "single" | "multi";
  required: boolean;
  max_select?: number;
  options: { value: string; label: string; description: string }[];
}

export interface BPAnswers {
  facility_type: string;
  challenges: string[];
  existing_equipment: string;
  scale: string;
  expected_effects: string[];
}

export interface BPGenerateResult {
  business_content: string;
  purpose: string;
  num_units: number;
  expected_effects: string;
  unit_breakdown: { location: string; count: number }[];
  unit_rationale?: string;
  schedule?: { phase: string; duration: string; milestone: string }[];
  before_after?: string;
  loss_calculation?: { annual_loss: number; profit_rate: number; required_additional_revenue: number };
  evidence_sources?: string[];
  rationales?: Record<string, BPRationale>;
}

export async function fetchBPQuestions(): Promise<{ questions: BPQuestion[] }> {
  return apiFetch(`${API_URL}/api/v1/business-plan/questions`, { cache: "no-store" });
}

export async function previewBusinessPlan(answers: BPAnswers): Promise<BPGenerateResult> {
  return authFetch(`${API_URL}/api/v1/business-plan/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
}

export async function generateAndSaveBusinessPlan(
  appId: string,
  answers: BPAnswers
): Promise<BPGenerateResult> {
  return authFetch(`${API_URL}/api/v1/business-plan/applications/${appId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
}

// ── Sprint strategy / その他 不足 API スタブ ────────────────────

export type AISectionType = string;
export interface GenerateSectionResponse { section: string; text: string; disclaimer: string }
export async function postGenerateSection(_req: unknown): Promise<GenerateSectionResponse> {
  return authFetch(`${API_URL}/api/v1/ai-section/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(_req) });
}

export type TimelineTaskStatus = "pending" | "in_progress" | "done" | "skipped";
export type TimelineTaskCategory = "document" | "application" | "review" | "other";
export interface TimelineTask { id: string; label: string; status: TimelineTaskStatus; category: TimelineTaskCategory; due_date?: string; note?: string }
export interface TimelinePhase { id: string; label: string; tasks: TimelineTask[] }
export interface ActionTimelineResponse { phases: TimelinePhase[]; subsidy_id: string }
export async function getActionTimeline(subsidyId: string, appId?: string): Promise<ActionTimelineResponse> {
  const q = appId ? `?app_id=${appId}` : "";
  return authFetch(`${API_URL}/api/v1/strategy/action-timeline/${subsidyId}${q}`);
}

export type StrategyIndustry = string;
export interface RoiSideInput { label: string; value: number }
export interface RoiSimulateRequest { industry: StrategyIndustry; before: RoiSideInput[]; after: RoiSideInput[] }
export interface RoiSimulateResponse { roi_months: number; annual_saving: number; break_even: number }
export async function postRoiSimulate(req: RoiSimulateRequest): Promise<RoiSimulateResponse> {
  return authFetch(`${API_URL}/api/v1/strategy/roi-simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
}

export interface LossCalcRequest { industry: StrategyIndustry; monthly_incidents: number; avg_loss_per_incident: number; hourly_wage: number; hours_per_incident: number }
export interface LossCalcResponse { annual_direct_loss: number; annual_labor_loss: number; total_annual_loss: number; required_additional_revenue: number }
export async function postLossCalc(req: LossCalcRequest): Promise<LossCalcResponse> {
  return authFetch(`${API_URL}/api/v1/strategy/loss-calc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
}

export interface DeductionCheckResponse { is_deductible: boolean; reason: string; tax_rate: number }
export async function postDeductionCheck(req: unknown): Promise<DeductionCheckResponse> {
  return authFetch(`${API_URL}/api/v1/strategy/deduction-check`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
}

export interface TaxClassifyResponse { category: string; label: string; advice: string }
export async function postTaxClassify(req: unknown): Promise<TaxClassifyResponse> {
  return authFetch(`${API_URL}/api/v1/strategy/tax-classify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
}

export interface PendingReminder { id: string; subsidy_name: string; deadline: string; days_left: number }
export async function fetchPendingReminders(): Promise<{ reminders: PendingReminder[] }> {
  return authFetch(`${API_URL}/api/my/reminders/pending`);
}

export interface ApplicationStatusResponse { status: string; phase: string; available_transitions: string[] }
export async function getApplicationStatus(appId: string): Promise<ApplicationStatusResponse> {
  return authFetch(`${API_URL}/api/applications/${appId}/status`);
}
export async function patchApplicationStatus(appId: string, status: string): Promise<ApplicationStatusResponse> {
  return authFetch(`${API_URL}/api/applications/${appId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}

// --- Sprint 7: ドラフト永続化・インライン編集 ---

export async function patchDraftChapter(
  appId: string,
  draftId: string,
  chapterId: string,
  content: string,
): Promise<DraftChapter> {
  return authFetch(`${API_URL}/api/v1/applications/${appId}/draft/${draftId}/chapters/${chapterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export interface UsageInfo {
  used: number;
  limit: number;
  year_month: string;
}

export async function fetchUsageRemaining(): Promise<UsageInfo> {
  return authFetch(`${API_URL}/api/v1/applications/usage`);
}

export async function exportDraftBlob(
  appId: string,
  draftId: string,
  format: "pdf" | "docx" = "pdf",
): Promise<Blob> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(
    `${API_URL}/api/v1/applications/${appId}/draft/${draftId}/export?format=${format}`,
    { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new ApiError(res.status, `Export failed: ${res.statusText}`);
  return res.blob();
}

export interface DrillDownQuestionItem {
  question_id: string;
  chapter_id: string;
  question_text: string;
  priority: number;
}

export async function fetchDrillDownQuestions(
  applicationId: string,
  chapterIds: string[],
): Promise<DrillDownQuestionItem[]> {
  const token = getToken();
  const res = await fetch(
    `${API_URL}/api/v1/applications/${applicationId}/drill-down-questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ chapter_ids: chapterIds }),
    },
  );
  if (!res.ok) throw new ApiError(res.status, "Failed to fetch drill-down questions");
  const data = await res.json();
  return data.questions ?? [];
}
