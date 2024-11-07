import type {
  Exercise,
  Pattern,
  Question,
  Recommendation,
  Startup,
  StartupExercise,
  StartupPattern,
  StartupQuestion,
  StrapiAuthResponse,
  StrapiError,
  StrapiExercisesResponse,
  StrapiLoginCredentials,
  StrapiPatternsResponse,
  StrapiPatternResponse,
  StrapiQuestionsResponse,
  StrapiRecommendationsResponse,
  StrapiStartupExercisesResponse,
  StrapiStartupPatternsResponse,
  StrapiStartupQuestionsResponse,
  StrapiStartupsResponse,
  StrapiSurveysResponse,
  Survey,
  User,
  UserRegistration,
} from '../types/strapi';
import { CategoryEnum } from '../utils/constants';

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

export async function strapiGetPatterns(category?: CategoryEnum): Promise<Pattern[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    let url = '/patterns?populate[0]=image&populate[1]=relatedPatterns';
    if (category) {
      url += `&filters[category][$eq]=${category}`;
    }

    const response = await fetchApi<StrapiPatternsResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading patterns');
  }
}

export async function strapiGetPattern(documentId: string): Promise<Pattern> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const url = `/patterns/${documentId}?populate[0]=image&populate[1]=relatedPatterns`;

    const response = await fetchApi<StrapiPatternResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading pattern');
  }
}

export async function strapiGetExercises(): Promise<Exercise[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiExercisesResponse>('/exercises', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading exercises');
  }
}

export async function strapiGetSurveys(): Promise<Survey[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiSurveysResponse>('/surveys', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading surveys');
  }
}

export async function strapiGetQuestions(): Promise<Question[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiQuestionsResponse>('/questions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading questions');
  }
}

export async function strapiGetStartups(): Promise<Startup[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiStartupsResponse>('/startups', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startups');
  }
}

export async function strapiGetStartupPatterns(startupId?: string): Promise<StartupPattern[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    let url =
      '/startup-patterns?populate[0]=pattern&populate[1]=pattern.image&populate[2]=pattern.relatedPatterns';
    if (startupId) {
      url += `&filters[startup][documentId][$eq]=${startupId}`;
    }

    const response = await fetchApi<StrapiStartupPatternsResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup patterns');
  }
}

export async function strapiGetStartupExercises(): Promise<StartupExercise[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiStartupExercisesResponse>('/startup-exercises', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup exercises');
  }
}

export async function strapiGetStartupQuestions(): Promise<StartupQuestion[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiStartupQuestionsResponse>('/startup-questions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup questions');
  }
}

export async function strapiGetRecommendations(): Promise<Recommendation[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetchApi<StrapiRecommendationsResponse>('/recommendations', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading recommendations');
  }
}
