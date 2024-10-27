export interface StrapiProfile {
  id: number;
  given_name: string;
  family_name: string;
  user: number | StrapiUser;
  created_at: string;
  updated_at: string;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
  profile: StrapiProfile;
}

export interface StrapiStartup {}

export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiLoginCredentials {
  identifier: string;
  password: string;
}

export interface StrapiRegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface UserData extends StrapiUser {}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}
