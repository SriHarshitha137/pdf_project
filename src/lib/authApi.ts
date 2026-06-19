import { api } from "./api";

export interface AuthUser {
  id: number;
  email: string;
  plan_type: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function registerUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await api.post("/api/v1/auth/register", {
    email,
    password,
  });
  return response.data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post("/api/v1/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
}

/**
 * Exchange a Google OAuth access_token for our app's JWT.
 * The backend verifies the token with Google, finds/creates the user,
 * and returns a JWT access_token.
 */
export async function googleLoginUser(
  googleAccessToken: string
): Promise<LoginResponse> {
  const response = await api.post("/api/v1/auth/google", {
    token: googleAccessToken,
  });
  return response.data;
}
