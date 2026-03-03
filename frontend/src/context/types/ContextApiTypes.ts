type ApiErrorData = {
  error?: string;
  details?: string;
  attemptsLeft?: number;
  [key: string]: unknown;
};
type ThemeMode = "light" | "dark";

type AuthUser = {
  id: number;
  username: string;
  role: "admin" | "empleado";
};

type LoginInput = {
  username: string;
  password_hash: string;
};

type RegisterInput = {
  nombre: string;
  username: string;
  email: string;
  password_hash: string;
};

type ResendOtp = {
  email: string;
};

type ResetPasswordInput = {
  email: string;
  otp: string;
  newPassword: string;
};

type RequestOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

type ApiContextValue = {
  baseUrl: string;
  request<T>(path: string, init?: RequestOptions): Promise<T>;
  theme: ThemeMode;
  isDark: boolean;
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  resendOtp: (input: ResendOtp) => Promise<void>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  logout: () => void;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  toggleTheme: () => void;
};


export type { ApiErrorData, ThemeMode, AuthUser, LoginInput, RegisterInput, ResendOtp, ResetPasswordInput, RequestOptions, ApiContextValue };