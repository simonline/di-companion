import Strapi from 'strapi-sdk-js';
import type {
  StrapiAuthResponse,
  StrapiLoginCredentials,
  StrapiRegisterCredentials,
  StrapiProfile,
  StrapiError,
  StrapiStartup,
} from '../types/strapi';

const STRAPI_URL = 'https://api.di.sce.de';
const STRAPI_API_PREFIX = '';

let strapiClient: Strapi | null = null;

export function getStrapi(): Strapi {
  if (!strapiClient) {
    strapiClient = new Strapi({
      url: STRAPI_URL,
      prefix: STRAPI_API_PREFIX,
      store: {
        key: 'strapi_jwt',
        useLocalStorage: true,
        cookieOptions: { path: '/' },
      },
      axiosOptions: {
        timeout: 30000,
      },
    });
  }
  return strapiClient;
}

export async function strapiLogin(
  identifier: string,
  password: string,
): Promise<StrapiAuthResponse> {
  const strapi = getStrapi();
  try {
    const response = await strapi.login({
      identifier,
      password,
    } as StrapiLoginCredentials);
    return response as StrapiAuthResponse;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Login failed');
  }
}

export async function strapiRegister(
  username: string,
  email: string,
  password: string,
): Promise<StrapiAuthResponse> {
  const strapi = getStrapi();
  try {
    const response = await strapi.register({
      username,
      email,
      password,
    } as StrapiRegisterCredentials);
    return response as StrapiAuthResponse;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Registration failed');
  }
}

export async function strapiLogout(): Promise<void> {
  const strapi = getStrapi();
  try {
    await strapi.logout();
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('user');
  }
}

interface CreateProfileData {
  given_name: string;
  family_name: string;
  user: number;
}

interface CreateStartupData {
  startup_name: string;
  start_date: string;
  co_founders_count: number;
  co_founders_background: string;
  idea_description: string;
  product_type: string;
  industry: string;
  industry_other?: string | null;
  target_market: string;
  phase: string;
  problem_validated: boolean;
  qualified_conversations: number;
  core_target_group_defined: boolean;
  prototype_validated: boolean;
  mvp_tested: boolean;
  users: number[];
}

export async function register(
  userData: StrapiRegisterCredentials,
  profileData: Omit<CreateProfileData, 'user'>,
  startupData: Omit<CreateStartupData, 'users'>,
): Promise<{
  auth: StrapiAuthResponse;
  profile: StrapiProfile;
  startup: StrapiStartup; // Define proper startup type if needed
}> {
  const strapi = getStrapi();

  try {
    // Step 1: Register user
    const authResponse = await strapiRegister(userData.username, userData.email, userData.password);

    // Step 2: Create profile
    const profile = await strapi.create('profiles', {
      data: {
        ...profileData,
        user: authResponse.user.id,
      },
    });

    // Step 3: Create startup
    const startup = await strapi.create('startups', {
      data: {
        ...startupData,
        users: [authResponse.user.id],
      },
    });

    return {
      auth: authResponse,
      profile: profile.data,
      startup: startup.data,
    };
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Registration process failed');
  }
}
