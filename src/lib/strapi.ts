import type {
  CreateStartup,
  CreateStartupPattern,
  CreateStartupExercise,
  CreateStartupQuestion,
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
  StrapiLoginCredentials,
  StrapiSingleResponse,
  StrapiCollectionResponse,
  Survey,
  User,
  UserRegistration,
  UpdateStartup,
  UpdateStartupExercise,
  UpdateStartupPattern,
  UpdateStartupQuestion,
  Invitation,
  CreateInvitation,
  UpdateInvitation,
  UpdateUser,
  Request,
} from '../types/strapi';
import { CategoryEnum } from '../utils/constants';
import axiosInstance from './axios';

const STRAPI_API_PREFIX = '/api'; // Strapi v5 uses /api prefix by default

// Helper function to store JWT token
const storeToken = (token: string): void => {
  localStorage.setItem('strapi_jwt', token);
};

// Helper function to get the full avatar URL
export const getAvatarUrl = (avatarUrl?: string): string | undefined => {
  if (!avatarUrl) return undefined;

  return avatarUrl.startsWith('http') ? avatarUrl : `${import.meta.env.VITE_API_URL}${avatarUrl}`;
};

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options: any = {}): Promise<T> {
  try {
    const url = `${STRAPI_API_PREFIX}${endpoint}`;
    const config: any = {
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    // Handle request body
    if (options.body) {
      if (options.body instanceof FormData) {
        // For FormData, don't set Content-Type header (browser will set it with boundary)
        config.data = options.body;
        delete config.headers['Content-Type'];
      } else {
        // For JSON data
        config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;

        // Ensure Content-Type is set for JSON
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      }
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error: any) {
    console.error('API request error:', error);
    if (error.response && error.response.data) {
      console.error('Error response data:', error.response.data);
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

async function fetchSingleApi<T>(endpoint: string, options: any = {}): Promise<T> {
  const response = await fetchApi<StrapiSingleResponse<T>>(endpoint, options);
  return response.data;
}

async function fetchCollectionApi<T>(endpoint: string, options: any = {}): Promise<T[]> {
  const response = await fetchApi<StrapiCollectionResponse<T>>(endpoint, options);
  return response.data;
}

async function fetchPaginatedApi<T>(endpoint: string, options: any = {}): Promise<T[]> {
  let page = 1;
  const pageSize = 100; // Maximum page size in Strapi v5
  let hasMore = true;
  let allData: T[] = [];

  while (hasMore) {
    const paginatedEndpoint = `${endpoint}${
      endpoint.includes('?') ? '&' : '?'
    }pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

    const response = await fetchApi<StrapiCollectionResponse<T>>(paginatedEndpoint, options);

    if (!response || !response.data) {
      console.error('Invalid response structure:', response);
      return [];
    }

    allData = [...allData, ...response.data];

    // Check if there are more pages
    if (response?.meta?.pagination) {
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
    } else {
      hasMore = false;
    }
    page++;
  }

  return allData;
}

export async function strapiMe(): Promise<User> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchApi<User>(
      '/users/me?populate[startups][filters][publishedAt][$notNull]=true&populate[startups][populate][coach]=*&populate[avatar]=*&populate[coachees]=*',
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
    const { avatar, ...userData } = user;

    console.log('Registering user:', userData);

    // First, register the user without the avatar
    const response = await fetchApi<StrapiAuthResponse>('/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.jwt) {
      storeToken(response.jwt);
    }

    // If there's an avatar, upload it after user creation
    if (avatar && response.user?.id) {
      console.log('Uploading avatar for newly registered user:', response.user.id);

      try {
        // Validate file size before upload attempt
        if (avatar.size > 5 * 1024 * 1024) {
          // 5MB size limit
          console.warn('Avatar file too large, skipping upload');
        } else {
          // Validate file type (basic check)
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
          if (!validTypes.includes(avatar.type)) {
            console.warn('Invalid avatar file type, skipping upload');
          } else {
            const formData = new FormData();
            formData.append('files', avatar, avatar.name);
            formData.append('refId', response.user.id.toString());
            formData.append('ref', 'plugin::users-permissions.user');
            formData.append('field', 'avatar');
            await fetchApi<any>(`/upload`, {
              method: 'POST',
              body: formData,
            });

            // Refresh user data to include the avatar
            const updatedUser = await strapiMe();
            response.user = updatedUser;
          }
        }
      } catch (uploadError) {
        // Log the error but continue with registration
        console.error('Avatar upload error:', uploadError);
        // Don't throw an error, just continue with the registration
      }
    }

    return response;
  } catch (error) {
    console.error('Error in strapiRegister:', error);
    const strapiError = error as StrapiError;

    // Extract more descriptive error messages
    if (
      strapiError.error?.message?.includes('payload too large') ||
      strapiError.error?.message?.includes('request entity too large')
    ) {
      throw new Error('Image file is too large. Maximum upload size is 5MB.');
    } else if (
      strapiError.error?.message?.includes('image') ||
      strapiError.error?.message?.includes('file type')
    ) {
      throw new Error('Invalid image format. Please upload a valid image file (JPG, PNG, GIF).');
    } else if (strapiError.error?.message?.includes('email')) {
      throw new Error(strapiError.error.message || 'Email is invalid or already in use.');
    } else if (strapiError.error?.message?.includes('password')) {
      throw new Error(strapiError.error.message || 'Password does not meet requirements.');
    } else if (strapiError.error?.message) {
      throw new Error(strapiError.error.message);
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
}

export async function strapiCreateStartup(startup: CreateStartup): Promise<Startup> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Startup>('/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: startup,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup creation failed');
  }
}

export async function strapiUpdateStartup(updateStartup: UpdateStartup): Promise<Startup> {
  try {
    const { documentId, ...payload } = updateStartup;
    const url = `/startups/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Startup>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup update failed');
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
    // No need to manually add token - the axios interceptor will handle it
    let url = '/patterns?';
    url += '&populate[relatedPatterns]=*';
    url += '&populate[image][fields][0]=url';
    url += '&populate[exercise][fields][0]=documentId';
    url += '&populate[survey][fields][0]=documentId';
    if (category) {
      url += `&filters[category][$eq]=${category}`;
    }

    return await fetchPaginatedApi<Pattern>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading patterns');
  }
}

export async function strapiGetPattern(documentId: string): Promise<Pattern> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url = `/patterns/${documentId}`;
    url += '?populate[relatedPatterns]=*';
    url += '&populate[image][fields][0]=url';
    url += '&populate[exercise][fields][0]=documentId';
    url += '&populate[survey][fields][0]=documentId';

    return await fetchSingleApi<Pattern>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading pattern');
  }
}

export async function fetchPatternsById(patternIds: string[]): Promise<Pattern[]> {
  try {
    console.log('Fetching patterns by IDs:', patternIds);

    if (!patternIds || !Array.isArray(patternIds) || patternIds.length === 0) {
      console.warn('No valid pattern IDs provided');
      return [];
    }

    // Filter out any non-string values to prevent API errors
    const validIds = patternIds.filter((id) => typeof id === 'string');
    if (validIds.length !== patternIds.length) {
      console.warn('Some pattern IDs were invalid:', patternIds);
    }

    const patterns = await Promise.all(
      validIds.map((patternId) => {
        console.log('Fetching pattern with ID:', patternId);
        return strapiGetPattern(patternId);
      }),
    );
    return patterns;
  } catch (error) {
    console.error('Error fetching patterns by IDs:', error);
    throw error;
  }
}

export async function strapiGetExercises(): Promise<Exercise[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchPaginatedApi<Exercise>('/exercises');
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading exercises');
  }
}

export async function strapiGetSurveys(): Promise<Survey[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchPaginatedApi<Survey>('/surveys');
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading surveys');
  }
}

export async function strapiGetQuestions(): Promise<Question[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchCollectionApi<Question>('/questions');
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading questions');
  }
}

export async function strapiGetStartups(): Promise<Startup[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchPaginatedApi<Startup>('/startups');
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startups');
  }
}

export async function strapiGetStartupPatterns(
  startupDocumentId: string,
  patternDocumentId?: string,
): Promise<StartupPattern[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url =
      '/startup-patterns?populate[0]=pattern&populate[1]=pattern.image&populate[2]=pattern.relatedPatterns';
    url += '&populate[3]=startup';
    url += `&filters[startup][documentId][$eq]=${startupDocumentId}`;
    if (patternDocumentId) {
      url += `&filters[pattern][documentId][$eq]=${patternDocumentId}`;
    }
    url += '&sort=createdAt';

    return await fetchPaginatedApi<StartupPattern>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup patterns');
  }
}

export async function strapiGetStartupPattern(documentId?: string): Promise<StartupPattern> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const url = `/startup-patterns/${documentId}?populate[0]=pattern&populate[1]=pattern.image&populate[2]=pattern.relatedPatterns`;

    return await fetchSingleApi<StartupPattern>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup patterns');
  }
}

export async function strapiCreateStartupPattern(
  startupPattern: CreateStartupPattern,
): Promise<StartupPattern> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<StartupPattern>('/startup-patterns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: startupPattern,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup pattern creation failed');
  }
}

export async function strapiUpdateStartupPattern(
  updateStartupPattern: UpdateStartupPattern,
): Promise<StartupPattern> {
  try {
    const { documentId, ...payload } = updateStartupPattern;
    const url = `/startup-patterns/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<StartupPattern>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup pattern update failed');
  }
}

export async function strapiGetStartupExercises(
  startupDocumentId?: string,
  patternDocumentId?: string,
  exerciseDocumentId?: string,
): Promise<StartupExercise[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url = '/startup-exercises?populate[resultFiles][filters][publishedAt][$notNull]=true';
    if (startupDocumentId) {
      url += `&filters[startup][documentId][$eq]=${startupDocumentId}`;
    }
    if (patternDocumentId) {
      url += `&filters[pattern][documentId][$eq]=${patternDocumentId}`;
    }
    if (exerciseDocumentId) {
      url += `&filters[exercise][documentId][$eq]=${exerciseDocumentId}`;
    }

    return await fetchPaginatedApi<StartupExercise>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup exercises');
  }
}

export async function strapiGetStartupExercise(documentId: string): Promise<StartupExercise> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const url = `/startup-exercises/${documentId}`;

    return await fetchSingleApi<StartupExercise>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup exercise');
  }
}

export async function strapiFindStartupExercise(
  startupDocumentId: string,
  patternDocumentId: string,
  exerciseDocumentId: string,
): Promise<StartupExercise | null> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const startupExercises = await strapiGetStartupExercises(
      startupDocumentId,
      patternDocumentId,
      exerciseDocumentId,
    );
    if (startupExercises.length === 0) {
      return null;
    }
    return startupExercises[0];
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup exercise');
  }
}

export async function strapiCreateStartupExercise(
  createStartupExercise: CreateStartupExercise,
): Promise<StartupExercise> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const { resultFiles, ...payload } = createStartupExercise;
    // First create the startup exercise
    const startupExercise = await fetchSingleApi<StartupExercise>('/startup-exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
    if (!startupExercise.id) {
      throw new Error('Startup exercise creation failed');
    }
    // Then upload the files, linking them to the startup exercise
    await Promise.all(
      resultFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('files', file, file.name);
        formData.append('refId', startupExercise.id);
        formData.append('ref', 'api::startup-exercise.startup-exercise');
        formData.append('field', 'resultFiles');
        const response = await fetchApi<{ documentId: string }[]>(`/upload`, {
          method: 'POST',
          body: formData,
        });
        return response[0].documentId;
      }),
    );

    return startupExercise;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup exercise creation failed');
  }
}

export async function strapiUpdateStartupExercise(
  updateStartupExercise: UpdateStartupExercise,
): Promise<StartupExercise> {
  try {
    const { documentId, ...payload } = updateStartupExercise;
    const url = `/startup-exercises/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<StartupExercise>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup exercise update failed');
  }
}

export async function strapiGetStartupQuestions(
  startupDocumentId?: string,
  patternDocumentId?: string,
  surveyDocumentId?: string,
): Promise<StartupQuestion[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url = '/startup-questions?populate[question][fields][0]=documentId';
    if (startupDocumentId) {
      url += `&filters[startup][documentId][$eq]=${startupDocumentId}`;
    }
    if (patternDocumentId) {
      url += `&filters[pattern][documentId][$eq]=${patternDocumentId}`;
    }
    if (surveyDocumentId) {
      url += `&filters[question][survey][documentId][$eq]=${surveyDocumentId}`;
    }

    return await fetchCollectionApi<StartupQuestion>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup questions');
  }
}

export async function strapiGetStartupQuestion(documentId: string): Promise<StartupQuestion> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const url = `/startup-questions/${documentId}`;

    return await fetchSingleApi<StartupQuestion>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup question');
  }
}

export async function strapiFindStartupQuestion(
  startupDocumentId: string,
  patternDocumentId: string,
  questionDocumentId: string,
): Promise<StartupQuestion> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const startupQuestions = await strapiGetStartupQuestions();
    const startupQuestion = startupQuestions.find(
      (sq) =>
        sq.startup.documentId === startupDocumentId &&
        sq.pattern.documentId === patternDocumentId &&
        sq.question.documentId === questionDocumentId,
    );
    if (!startupQuestion) {
      throw new Error('Startup question not found');
    }
    return startupQuestion;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup question');
  }
}

export async function strapiCreateStartupQuestion(
  createStartupQuestion: CreateStartupQuestion,
): Promise<StartupQuestion> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<StartupQuestion>('/startup-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: createStartupQuestion,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup question creation failed');
  }
}

export async function strapiUpdateStartupQuestion(
  updateStartupQuestion: UpdateStartupQuestion,
): Promise<StartupQuestion> {
  try {
    const { documentId, ...payload } = updateStartupQuestion;
    const url = `/startup-questions/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<StartupQuestion>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Startup question update failed');
  }
}

export async function strapiGetRecommendations(startupId?: string): Promise<Recommendation[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url = '/recommendations?populate[0]=patterns&populate[1]=coach&populate[2]=startup';
    if (startupId) {
      url += `&filters[startup][documentId][$eq]=${startupId}`;
    }
    return await fetchPaginatedApi<Recommendation>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading recommendations');
  }
}

export interface CreateRecommendation {
  comment: string;
  type: 'pattern' | 'url' | 'file' | 'contact';
  patterns?: string[];
  coach?: { id: number | string };
  startup?: { id: number | string };
  readAt?: string;
}

export async function strapiCreateRecommendation(
  recommendation: CreateRecommendation,
): Promise<Recommendation> {
  try {
    // Format the data for Strapi v5
    const formattedData = {
      ...recommendation,
      patterns: recommendation.patterns,
      coach: recommendation.coach ? recommendation.coach.id : undefined,
      startup: recommendation.startup ? recommendation.startup.id : undefined,
    };

    const url = '/recommendations?populate[0]=patterns&populate[1]=coach&populate[2]=startup';

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Recommendation>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: formattedData,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Recommendation creation failed');
  }
}

export interface UpdateRecommendation {
  documentId: string;
  comment?: string;
  type?: 'pattern' | 'url' | 'file' | 'contact';
  patterns?: string[];
  coach?: { id: number | string };
  startup?: { id: number | string };
  readAt?: string;
}

export async function strapiUpdateRecommendation(
  updateRecommendation: UpdateRecommendation,
): Promise<Recommendation> {
  try {
    const { documentId, ...payload } = updateRecommendation;
    const url = `/recommendations/${documentId}?populate[0]=patterns&populate[1]=coach&populate[2]=startup`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Recommendation>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Recommendation update failed');
  }
}

export async function strapiDeleteRecommendation(documentId: string): Promise<void> {
  try {
    const url = `/recommendations/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    await fetchApi(url, {
      method: 'DELETE',
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Recommendation deletion failed');
  }
}

export async function strapiGetExercise(documentId: string): Promise<Exercise> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const url = `/exercises/${documentId}`;

    return await fetchSingleApi<Exercise>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading exercise');
  }
}

export async function strapiGetSurvey(documentId: string): Promise<Survey> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    const url = `/surveys/${documentId}?populate[0]=questions`;

    return await fetchSingleApi<Survey>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading survey');
  }
}

export async function strapiGetInvitations(startupDocumentId: string): Promise<Invitation[]> {
  try {
    // Get all fields for invitedBy and explicitly filter by startup documentId
    const url = `/invitations?populate[startup]=*&populate[invitedBy]=*&filters[startup][documentId][$eq]=${startupDocumentId}`;

    const invitations = await fetchPaginatedApi<Invitation>(url);
    console.log(`Fetched ${invitations.length} invitations for startup ${startupDocumentId}`);

    return invitations;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading invitations');
  }
}

export async function strapiCreateInvitation(invitation: CreateInvitation): Promise<Invitation> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Invitation>('/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: invitation,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Invitation creation failed');
  }
}

export async function strapiUpdateInvitation(
  updateInvitation: UpdateInvitation,
): Promise<Invitation> {
  try {
    const { documentId, ...payload } = updateInvitation;
    const url = `/invitations/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Invitation>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Invitation update failed');
  }
}

export async function strapiDeleteInvitation(documentId: string): Promise<void> {
  try {
    const url = `/invitations/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    await fetchApi(url, {
      method: 'DELETE',
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Invitation deletion failed');
  }
}

export async function strapiResendInvitation(documentId: string): Promise<Invitation> {
  try {
    const url = `/invitations/${documentId}/resend`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Invitation>(url, {
      method: 'POST',
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Invitation resend failed');
  }
}

export async function strapiAcceptInvitation(token: string): Promise<Invitation> {
  try {
    const url = '/invitations/accept';

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Invitation>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Invitation acceptance failed');
  }
}

export async function strapiGetStartupMembers(startupDocumentId: string): Promise<User[]> {
  try {
    // With our custom backend controller, we're enforcing authorization there
    // So we only need to make the query with the startup filter
    const url = `/users?filters[startups][documentId][$eq]=${startupDocumentId}`;

    // The custom controller will handle authorization and filtering
    const members = await fetchApi<User[]>(url);

    console.log(`Found ${members.length} users that are members of startup ${startupDocumentId}`);

    return members;
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup members');
  }
}

/**
 * Update a user profile
 * @param updateUser User data to update
 * @returns Updated user data
 */
export async function strapiUpdateUser(updateUser: UpdateUser): Promise<User> {
  try {
    const { id, avatar, ...payload } = updateUser;

    if (!id) {
      throw new Error('User ID is required for update');
    }

    // Remove documentId from payload if it exists
    if ('documentId' in payload) {
      delete (payload as any).documentId;
    }

    const url = `/users/${id}`;

    // If there's an avatar, upload it first
    if (avatar) {
      try {
        const formData = new FormData();
        formData.append('files', avatar);
        formData.append('refId', id.toString());
        formData.append('ref', 'plugin::users-permissions.user');
        formData.append('field', 'avatar');
        await fetchApi<any>(`/upload`, {
          method: 'POST',
          body: formData,
        });
      } catch (uploadError) {
        console.error('Avatar upload failed:', uploadError);
        throw new Error('Avatar upload failed: ' + (uploadError as Error).message);
      }
    }

    // Then update the user data
    console.log('Updating user data:', payload);
    const updateResponse = await fetchApi<User>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('User update response:', updateResponse);

    // Refresh user data to get the updated user with avatar
    return await strapiMe();
  } catch (error) {
    console.error('Error in strapiUpdateUser:', error);
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'User update failed');
  }
}

export async function strapiGetStartup(documentId: string): Promise<Startup> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Startup>(`/startups/${documentId}`);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading startup');
  }
}

// Request CRUD Operations
export async function strapiGetRequests(startupId?: string): Promise<Request[]> {
  try {
    // No need to manually add token - the axios interceptor will handle it
    let url = '/requests?populate[0]=startup';
    if (startupId) {
      url += `&filters[startup][documentId][$eq]=${startupId}`;
    }
    return await fetchPaginatedApi<Request>(url);
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Error loading requests');
  }
}

export interface CreateRequest {
  comment: string;
  startup?: { id: number | string };
  readAt?: string;
}

export async function strapiCreateRequest(request: CreateRequest): Promise<Request> {
  try {
    // Format the data for Strapi v5
    const formattedData = {
      ...request,
      startup: request.startup ? request.startup.id : undefined,
    };

    const url = '/requests?populate[0]=startup';

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Request>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: formattedData,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Request creation failed');
  }
}

export interface UpdateRequest {
  documentId: string;
  comment?: string;
  startup?: { id: number | string };
  readAt?: string;
}

export async function strapiUpdateRequest(updateRequest: UpdateRequest): Promise<Request> {
  try {
    const { documentId, ...payload } = updateRequest;
    const url = `/requests/${documentId}?populate[0]=startup`;

    // No need to manually add token - the axios interceptor will handle it
    return await fetchSingleApi<Request>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Request update failed');
  }
}

export async function strapiDeleteRequest(documentId: string): Promise<void> {
  try {
    const url = `/requests/${documentId}`;

    // No need to manually add token - the axios interceptor will handle it
    await fetchApi(url, {
      method: 'DELETE',
    });
  } catch (error) {
    const strapiError = error as StrapiError;
    throw new Error(strapiError.error?.message || 'Request deletion failed');
  }
}
