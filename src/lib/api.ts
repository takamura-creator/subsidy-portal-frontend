const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  role: "owner" | "contractor";
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
  role: "owner" | "contractor" | "admin";
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

// --- 業者案件（認証付き） ---

export type BizProjectStatus = "new" | "estimating" | "working" | "completed" | "declined";

export interface BizProject {
  id: string;
  company_name: string;
  subsidy_name: string;
  budget: number;
  deadline: string;
  status: BizProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface BizProjectDetail extends BizProject {
  company_industry?: string;
  company_address?: string;
  contact_name?: string;
  contact_email?: string;
  subsidy_rate?: string;
  subsidy_max_amount?: number;
  purpose?: string;
  camera_count?: number;
  planned_date?: string;
  documents?: Array<{ name: string; url?: string }>;
  quotation?: Quotation;
}

export interface Quotation {
  amount: number;
  duration_days: number;
  note?: string;
  file_url?: string;
  submitted_at?: string;
}

export interface BizStats {
  new_count: number;
  active_count: number;
  monthly_received: number;
  monthly_completed: number;
  month: string;
}

export async function fetchBizProjects(params?: {
  status?: string;
  page?: number;
}): Promise<{ total: number; projects: BizProject[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return authFetch(`${API_URL}/api/biz/projects?${query}`);
}

export async function fetchBizProjectsSummary(): Promise<BizStats> {
  return authFetch(`${API_URL}/api/biz/projects/summary`);
}

export async function fetchBizProject(id: string): Promise<BizProjectDetail> {
  return authFetch(`${API_URL}/api/biz/projects/${id}`);
}

export async function acceptProject(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/biz/projects/${id}/accept`, {
    method: "POST",
  });
}

export async function declineProject(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/biz/projects/${id}/decline`, {
    method: "POST",
  });
}

export async function submitQuotation(
  id: string,
  data: { amount: number; duration_days: number; note?: string }
): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/biz/projects/${id}/quotation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchBizStats(month?: string): Promise<BizStats> {
  const query = month ? `?month=${month}` : "";
  return authFetch(`${API_URL}/api/biz/stats${query}`);
}

// --- 業者プロフィール（認証付き） ---

export interface BizProfile {
  id: string;
  company_name: string;
  representative_name?: string;
  prefecture?: string;
  founded_year?: number;
  employees?: number;
  description?: string;
  areas: string[];
  qualifications: string[];
  photos: Array<{ id: string; url: string }>;
  phone?: string;
  email?: string;
}

export async function fetchBizProfile(): Promise<BizProfile> {
  return authFetch(`${API_URL}/api/biz/profile`);
}

export async function updateBizProfile(
  data: Partial<BizProfile>
): Promise<BizProfile> {
  return authFetch(`${API_URL}/api/biz/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// --- 管理画面 ---

export interface AdminDashboard {
  total_users: number;
  total_applications: number;
  pending_contractors: number;
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

export interface AdminContractor {
  id: string;
  company_name: string;
  areas: string[];
  qualifications: string[];
  project_count: number;
  rating: number;
  status: "pending" | "approved" | "suspended";
  created_at: string;
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

export async function fetchAdminContractors(params?: {
  status?: string;
  page?: number;
}): Promise<{ total: number; contractors: AdminContractor[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return authFetch(`${API_URL}/api/admin/contractors?${query}`);
}

export async function approveContractor(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/contractors/${id}/approve`, { method: "PUT" });
}

export async function suspendContractor(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/contractors/${id}/suspend`, { method: "PUT" });
}

export async function unsuspendContractor(id: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/api/admin/contractors/${id}/unsuspend`, { method: "PUT" });
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
  role: "owner" | "contractor" | "admin";
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
  role: "owner" | "contractor" | "admin"
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

// --- 工事業者（公開） ---

export interface Contractor {
  id: string;
  company_name: string;
  description: string;
  areas: string[];
  qualifications: string[];
  project_count: number;
  rating: number;
  review_count: number;
}

export async function fetchContractors(params?: {
  prefecture?: string;
  keyword?: string;
}): Promise<{ total: number; contractors: Contractor[] }> {
  const query = new URLSearchParams();
  if (params?.prefecture) query.set("prefecture", params.prefecture);
  if (params?.keyword) query.set("keyword", params.keyword);
  return apiFetch(`${API_URL}/api/contractors?${query}`, {
    next: { revalidate: 300 },
  });
}

export async function fetchContractor(id: string): Promise<Contractor> {
  return apiFetch(`${API_URL}/api/contractors/${id}`, {
    next: { revalidate: 300 },
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
