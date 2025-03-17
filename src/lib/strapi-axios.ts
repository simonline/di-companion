import axiosInstance from './axios';
import type {
  StrapiAuthResponse,
  StrapiError,
  StrapiLoginCredentials,
  User,
  UserRegistration,
} from '../types/strapi';

const STRAPI_API_PREFIX = '/api'; // Strapi v5 uses /api prefix by default

// Helper function to store JWT token
const storeToken = (token: string): void => {
  localStorage.setItem('strapi_jwt', token);
};

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options: any = {}): Promise<T> {
  try {
    const url = `${STRAPI_API_PREFIX}${endpoint}`;
    const response = await axiosInstance({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers,
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw {
        error: {
          message: error.response.data.error?.message || 'API request failed',
          ...error.response.data.error,
        },
      } as StrapiError;
    }
    throw error;
  }
}

export async function strapiMe(): Promise<User> {
  try {
    return await fetchApi<User>(
      '/users/me?populate[startups][filters][publishedAt][$notNull]=true',
    );
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading user');
  }
}

export async function strapiLogin(
  identifier: string,
  password: string,
): Promise<StrapiAuthResponse> {
  try {
    const response = await fetchApi<StrapiAuthResponse>('/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      } as StrapiLoginCredentials),
    });

    if (response.jwt) {
      storeToken(response.jwt);
    }

    return response;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Login failed');
  }
}

export async function strapiRegister(user: UserRegistration): Promise<StrapiAuthResponse> {
  try {
    const response = await fetchApi<StrapiAuthResponse>('/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (response.jwt) {
      storeToken(response.jwt);
    }

    return response;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Registration failed');
  }
}

export async function strapiLogout(): Promise<void> {
  try {
    localStorage.removeItem('strapi_jwt');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('user');
  }
}
