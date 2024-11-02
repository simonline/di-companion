import type {
  StrapiAuthResponse,
  StrapiLoginCredentials,
  StrapiPatternResponse,
  UserRegistration,
  StrapiError,
  Pattern,
  Startup,
  User,
} from '../types/strapi';

const STRAPI_URL = 'https://api.di.sce.de';
const STRAPI_API_PREFIX = '/api'; // Strapi v5 uses /api prefix by default

// Helper function to get the stored JWT token
const getStoredToken = (): string | null => {
  return localStorage.getItem('strapi_jwt');
};

// Helper function to store JWT token
const storeToken = (token: string): void => {
  localStorage.setItem('strapi_jwt', token);
};

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${STRAPI_URL}${STRAPI_API_PREFIX}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw {
      error: {
        message: error.error?.message || 'API request failed',
        ...error,
      },
    } as StrapiError;
  }

  return response.json();
}

export async function strapiMe(): Promise<User> {
  try {
    const token = getStoredToken();
    console.log(token);
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<User>(
      '/users/me?populate[startups][filters][publishedAt][$notNull]=true',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response;
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

export async function strapiCreateStartup(startup: Startup): Promise<Startup> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<Startup>('/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: startup,
      }),
    });

    return response;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup creation failed');
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

export async function strapiGetPatterns(): Promise<Pattern[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiPatternResponse>(
      '/patterns?populate[0]=image&populate[1]=relatedPatterns',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading patterns');
  }
}
