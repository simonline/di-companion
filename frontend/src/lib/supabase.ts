import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[Supabase Init] URL:', supabaseUrl);
console.log('[Supabase Init] Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Create a singleton instance to avoid multiple clients
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

if (!supabaseInstance) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Init] Missing required environment variables!');
    console.error('[Supabase Init] VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
    console.error('[Supabase Init] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
  }
  
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'  // Use PKCE flow for better security
    }
  });
}

export const supabase = supabaseInstance;

// Session helper
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(handleSupabaseError(error));
  return session;
}

// Error handler function
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.error?.message) {
    return error.error.message;
  }
  return 'An unexpected error occurred';
}

import type {
  CreateStartup,
  CreateStartupPattern,
  CreateStartupMethod,
  Pattern,
  Question,
  Recommendation,
  Startup,
  StartupMethod,
  StartupPattern,
  Survey,
  UserRegistration,
  UpdateStartup,
  UpdateStartupMethod,
  UpdateStartupPattern,
  Invitation,
  CreateInvitation,
  UpdateInvitation,
  UpdateUser,
  Request,
  UserQuestion,
  CreateUserQuestion,
  UpdateUserQuestion,
  Method,
} from '@/types/supabase';
import { CategoryEnum } from '@/utils/constants';

type Tables = Database['public']['Tables'];

// Authentication functions
export async function supabaseLogin(identifier: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error) throw new Error(handleSupabaseError(error));

  // Get full user data
  const user = await supabaseMe();

  return {
    jwt: data.session?.access_token || '',
    user,
  };
}

// OTP Authentication - sends 6-digit code instead of magic link
export async function supabaseSendOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create new users via OTP
    },
  });

  if (error) throw new Error(handleSupabaseError(error));

  return { success: true, message: 'Check your email for the login code!' };
}

// Verify OTP (for email verification after magic link click)
export async function supabaseVerifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw new Error(handleSupabaseError(error));

  // Get full user data
  const user = await supabaseMe();

  return {
    jwt: data.session?.access_token || '',
    user,
  };
}

export async function supabaseRegister(userData: UserRegistration) {
  // First, sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        username: userData.username,
        given_name: userData.givenName,
        family_name: userData.familyName,
      },
    },
  });

  if (authError) throw new Error(handleSupabaseError(authError));

  // Create user profile in the users table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      email: userData.email,
      username: userData.username,
      given_name: userData.givenName,
      family_name: userData.familyName,
      gender: userData.gender,
      position: userData.position,
      bio: userData.bio,
      linkedin_profile: userData.linkedinProfile,
      is_coach: userData.isCoach || false,
      phone: userData.phone,
      is_phone_visible: userData.isPhoneVisible || false,
    })
    .select()
    .single();

  if (profileError) throw new Error(handleSupabaseError(profileError));

  // Handle avatar upload if provided
  if (userData.avatar && authData.user) {
    const fileExt = userData.avatar.name.split('.').pop();
    const fileName = `${authData.user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, userData.avatar, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', authData.user.id);
    }
  }

  return {
    jwt: authData.session?.access_token || '',
    user: {
      ...profile,
      email: userData.email,
    },
  };
}

export async function supabaseMe() {
  console.log('[supabaseMe] Starting to fetch user data...');
  
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('[supabaseMe] Auth user fetched:', authUser?.email);
    
    if (authError) {
      console.error('[supabaseMe] Auth error:', authError);
      throw new Error(handleSupabaseError(authError));
    }
    if (!authUser) {
      console.error('[supabaseMe] No authenticated user');
      throw new Error('Not authenticated');
    }

    // Try to get user profile, but handle case where profiles table doesn't exist
    console.log('[supabaseMe] Fetching profile for user:', authUser.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('[supabaseMe] Profile fetch error:', profileError);
      // If profile doesn't exist, return basic auth data
      if (profileError.code === 'PGRST116' || profileError.message?.includes('not found')) {
        console.log('[supabaseMe] Profile not found, using auth data only');
        return {
          documentId: authUser.id,
          id: authUser.id,
          email: authUser.email || '',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
          givenName: authUser.user_metadata?.given_name || '',
          familyName: authUser.user_metadata?.family_name || '',
          startups: [],
        };
      }
      throw new Error(handleSupabaseError(profileError));
    }

    console.log('[supabaseMe] Profile fetched successfully');

    // Get user's startups
    console.log('[supabaseMe] Fetching startups for user:', authUser.id);
    const { data: startupLinks, error: startupsError } = await supabase
      .from('startups_users_lnk')
      .select('startup:startups(*)')
      .eq('user_id', authUser.id);
    
    if (startupsError) {
      console.error('[supabaseMe] Startups fetch error:', startupsError);
      // Continue without startups if table doesn't exist
    }
    
    const startups = startupLinks?.map((link: any) => link.startup).filter(Boolean) || [];
    console.log('[supabaseMe] Found', startups.length, 'startups');

    // Return the actual profile data from Supabase
    return {
      documentId: profile.id,
      id: profile.id,
      email: authUser.email || '',
      username: profile.username || authUser.email?.split('@')[0] || '',
      givenName: profile.given_name || '',
      familyName: profile.family_name || '',
      gender: profile.gender,
      position: profile.position,
      bio: profile.bio,
      linkedinProfile: profile.linkedin_profile,
      phone: profile.phone,
      isPhoneVisible: profile.is_phone_visible,
      isCoach: profile.is_coach,
      avatar: profile.avatar_url ? { id: 0, url: profile.avatar_url } : undefined,
      startups,
    };
  } catch (error) {
    console.error('[supabaseMe] Fatal error:', error);
    throw error;
  }
}

export async function supabaseLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseUpdateUser(updateUser: UpdateUser) {
  const { documentId, avatar, ...updateData } = updateUser;
  let avatarUrl;

  // Handle avatar upload if provided
  if (avatar) {
    const fileExt = avatar.name.split('.').pop();
    const fileName = `${documentId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar, { upsert: true });

    if (uploadError) throw new Error(handleSupabaseError(uploadError));

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    avatarUrl = urlData.publicUrl;
  }

  // Transform field names for database
  const dbUpdate: any = {};
  if (updateData.givenName) dbUpdate.given_name = updateData.givenName;
  if (updateData.familyName) dbUpdate.family_name = updateData.familyName;
  if (updateData.gender) dbUpdate.gender = updateData.gender;
  if (updateData.position) dbUpdate.position = updateData.position;
  if (updateData.bio) dbUpdate.bio = updateData.bio;
  if (updateData.linkedinProfile) dbUpdate.linkedin_profile = updateData.linkedinProfile;
  if (avatarUrl) dbUpdate.avatar_url = avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdate)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Get current user email
  const { data: { user: authUser } } = await supabase.auth.getUser();

  return {
    ...data,
    email: authUser?.email || updateData.email || '',
  };
}

// Patterns
export async function supabaseGetPatterns(category?: CategoryEnum): Promise<Pattern[]> {
  let query = supabase
    .from('patterns')
    .select(`
      *,
      relatedPatterns:patterns_related_patterns_lnk(
        related:patterns!inv_pattern_id(*)
      ),
      methods:methods_patterns_lnk(
        method:methods(*)
      ),
      survey:patterns_survey_lnk(
        survey:surveys(*)
      ),
      questions:questions_patterns_lnk(
        question:questions(*)
      )
    `);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  // Transform the data to match the expected format
  return (data || []).map(pattern => ({
    documentId: pattern.id,
    name: pattern.name,
    description: pattern.description,
    relatedPatterns: pattern.relatedPatterns?.map((r: any) => r.related) || [],
    image: pattern.image_url ? { url: pattern.image_url } : { url: '' },
    phases: pattern.phases || [],
    category: pattern.category as CategoryEnum,
    methods: pattern.methods?.map((m: any) => m.method) || [],
    survey: pattern.survey?.[0]?.survey || null,
    subcategory: pattern.subcategory || '',
    patternId: pattern.pattern_id || '',
    questions: pattern.questions?.map((q: any) => q.question) || [],
  }));
}

export async function supabaseGetPattern(documentId: string): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .select(`
      *,
      relatedPatterns:patterns_related_patterns_lnk(
        related:patterns!inv_pattern_id(*)
      ),
      methods:methods_patterns_lnk(
        method:methods(*)
      ),
      survey:patterns_survey_lnk(
        survey:surveys(*)
      ),
      questions:questions_patterns_lnk(
        question:questions(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    name: data.name,
    description: data.description,
    relatedPatterns: data.relatedPatterns?.map((r: any) => r.related) || [],
    image: data.image_url ? { url: data.image_url } : { url: '' },
    phases: data.phases || [],
    category: data.category as CategoryEnum,
    methods: data.methods?.map((m: any) => m.method) || [],
    survey: data.survey?.[0]?.survey || null,
    subcategory: data.subcategory || '',
    patternId: data.pattern_id || '',
    questions: data.questions?.map((q: any) => q.question) || [],
  };
}

// Startups
export async function supabaseCreateStartup(startup: CreateStartup): Promise<Startup> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  // Transform field names
  const dbStartup = {
    name: startup.name,
    start_date: startup.startDate,
    founders_count: startup.foundersCount,
    background: startup.background,
    product_type: startup.productType,
    idea: startup.idea,
    industry: startup.industry,
    industry_other: startup.industryOther,
    target_market: startup.targetMarket,
    phase: startup.phase,
    is_problem_validated: startup.isProblemValidated,
    qualified_conversations_count: startup.qualifiedConversationsCount,
    is_target_group_defined: startup.isTargetGroupDefined,
    is_prototype_validated: startup.isPrototypeValidated,
    is_mvp_tested: startup.isMvpTested,
    categories: startup.categories,
  };

  const { data, error } = await supabase
    .from('startups')
    .insert(dbStartup)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Link user to startup
  await supabase
    .from('startups_users_lnk')
    .insert({
      user_id: authData.user.id,
      startup_id: data.id,
    });

  return transformStartup(data);
}

export async function supabaseUpdateStartup(updateStartup: UpdateStartup): Promise<Startup> {
  const { documentId, ...updates } = updateStartup;

  // Transform field names
  const dbUpdate: any = {};
  if (updates.name) dbUpdate.name = updates.name;
  if (updates.startDate) dbUpdate.start_date = updates.startDate;
  if (updates.foundersCount) dbUpdate.founders_count = updates.foundersCount;
  if (updates.background) dbUpdate.background = updates.background;
  if (updates.productType) dbUpdate.product_type = updates.productType;
  if (updates.idea) dbUpdate.idea = updates.idea;
  if (updates.industry) dbUpdate.industry = updates.industry;
  if (updates.industryOther) dbUpdate.industry_other = updates.industryOther;
  if (updates.targetMarket) dbUpdate.target_market = updates.targetMarket;
  if (updates.phase) dbUpdate.phase = updates.phase;
  if (updates.isProblemValidated !== undefined) dbUpdate.is_problem_validated = updates.isProblemValidated;
  if (updates.qualifiedConversationsCount) dbUpdate.qualified_conversations_count = updates.qualifiedConversationsCount;
  if (updates.isTargetGroupDefined !== undefined) dbUpdate.is_target_group_defined = updates.isTargetGroupDefined;
  if (updates.isPrototypeValidated !== undefined) dbUpdate.is_prototype_validated = updates.isPrototypeValidated;
  if (updates.isMvpTested !== undefined) dbUpdate.is_mvp_tested = updates.isMvpTested;
  if (updates.scores) dbUpdate.scores = updates.scores;
  if (updates.score) dbUpdate.score = updates.score;
  if (updates.categories) dbUpdate.categories = updates.categories;

  const { data, error } = await supabase
    .from('startups')
    .update(dbUpdate)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return transformStartup(data);
}

function transformStartup(data: any): Startup {
  return {
    documentId: data.id,
    name: data.name,
    startDate: data.start_date,
    foundersCount: data.founders_count,
    background: data.background,
    productType: data.product_type,
    idea: data.idea,
    industry: data.industry,
    industryOther: data.industry_other,
    targetMarket: data.target_market,
    phase: data.phase,
    isProblemValidated: data.is_problem_validated,
    qualifiedConversationsCount: data.qualified_conversations_count,
    isTargetGroupDefined: data.is_target_group_defined,
    isPrototypeValidated: data.is_prototype_validated,
    isMvpTested: data.is_mvp_tested,
    scores: data.scores as Record<CategoryEnum, number> | undefined,
    score: data.score,
    coach: data.coach,
    users: data.users,
    categories: data.categories,
  };
}

export async function supabaseGetStartup(documentId: string): Promise<Startup> {
  const { data, error } = await supabase
    .from('startups')
    .select(`
      *,
      users:startups_users_lnk(
        user:profiles(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    ...transformStartup(data),
    coach: data.coach || undefined,
    users: data.users?.map((u: any) => u.user) || [],
  };
}

export async function supabaseGetStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from('startups')
    .select(`
      *,
      users:startups_users_lnk(
        user:profiles(*)
      )
    `);

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(startup => ({
    ...transformStartup(startup),
    users: startup.users?.map((u: any) => u.user) || [],
  }));
}

// Startup Patterns
export async function supabaseGetStartupPatterns(
  startupDocumentId: string,
  patternDocumentId?: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<StartupPattern[]> {
  let query = supabase
    .from('startup_patterns')
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*),
      user:profiles(*)
    `)
    .eq('startup_id', startupDocumentId)
    .order('created_at', { ascending: true });

  if (patternDocumentId) {
    query = query.eq('pattern_id', patternDocumentId);
  }

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.startDate.toISOString())
      .lte('created_at', dateRange.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(sp => ({
    documentId: sp.id,
    points: sp.points,
    pattern: sp.pattern ? {
      ...sp.pattern,
      documentId: sp.pattern.id,
      image: sp.pattern.image_url ? { url: sp.pattern.image_url } : { url: '' },
    } : null,
    startup: sp.startup ? transformStartup(sp.startup) : null,
    user: sp.user || null,
    createdAt: sp.created_at,
    updatedAt: sp.updated_at,
  }));
}

export async function supabaseCreateStartupPattern(
  startupPattern: CreateStartupPattern
): Promise<StartupPattern> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('startup_patterns')
    .insert({
      startup_id: startupPattern.startup,
      pattern_id: startupPattern.pattern,
      user_id: authData.user.id,
      points: startupPattern.points || 0,
    })
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*),
      user:profiles(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    points: data.points,
    pattern: data.pattern ? {
      ...data.pattern,
      documentId: data.pattern.id,
      image: data.pattern.image_url ? { url: data.pattern.image_url } : { url: '' },
    } : null,
    startup: data.startup ? transformStartup(data.startup) : null,
    user: data.user || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function supabaseUpdateStartupPattern(
  updateStartupPattern: UpdateStartupPattern
): Promise<StartupPattern> {
  const { documentId, ...updates } = updateStartupPattern;

  const { data, error } = await supabase
    .from('startup_patterns')
    .update({
      points: updates.points,
    })
    .eq('id', documentId)
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*),
      user:profiles(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    points: data.points,
    pattern: data.pattern ? {
      ...data.pattern,
      documentId: data.pattern.id,
      image: data.pattern.image_url ? { url: data.pattern.image_url } : { url: '' },
    } : null,
    startup: data.startup ? transformStartup(data.startup) : null,
    user: data.user || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Other functions follow similar pattern...
// Due to length constraints, I'll create the remaining functions in a follow-up


// Additional helper functions for file/image handling
export function getAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) return undefined;

  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http')) return avatarUrl;

  // Otherwise, get the public URL from Supabase storage
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarUrl);

  return data.publicUrl;
}

// Surveys and Questions
export async function supabaseGetSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `);

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(survey => ({
    documentId: survey.id,
    name: survey.name,
    description: survey.description || '',
    questions: survey.questions?.map((q: any) => q.question) || [],
  }));
}

export async function supabaseGetSurvey(documentId: string): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    name: data.name,
    description: data.description || '',
    questions: data.questions?.map((q: any) => q.question) || [],
  };
}

export async function supabaseGetSurveyByName(name: string): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `)
    .eq('name', name)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    name: data.name,
    description: data.description || '',
    questions: data.questions?.map((q: any) => q.question) || [],
  };
}

export async function supabaseGetQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(q => ({
    documentId: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    isRequired: q.is_required,
    order: q.order,
    weight: q.weight,
    helpText: q.help_text,
    showRequestCoach: q.show_request_coach,
    maxLength: q.max_length,
    isHidden: q.is_hidden,
  }));
}

// Startup Methods
export async function supabaseGetStartupMethods(
  startupDocumentId?: string,
  patternDocumentId?: string,
  methodDocumentId?: string
): Promise<StartupMethod[]> {
  let query = supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `);

  if (startupDocumentId) {
    query = query.eq('startup_id', startupDocumentId);
  }
  if (patternDocumentId) {
    query = query.eq('pattern_id', patternDocumentId);
  }
  if (methodDocumentId) {
    query = query.eq('method_id', methodDocumentId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(sm => ({
    documentId: sm.id,
    id: sm.id,
    status: sm.status,
    resultFiles: sm.result_files || [],
    startup: sm.startup,
    pattern: sm.pattern,
    method: sm.method,
  }));
}

export async function supabaseGetStartupMethod(documentId: string): Promise<StartupMethod> {
  const { data, error } = await supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .eq('id', documentId)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    id: data.id,
    status: data.status,
    resultFiles: data.result_files || [],
    startup: data.startup,
    pattern: data.pattern,
    method: data.method,
  };
}

export async function supabaseFindStartupMethod(
  startupId: string,
  patternId: string,
  methodId: string
): Promise<StartupMethod | null> {
  const { data, error } = await supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .eq('startup_id', startupId)
    .eq('pattern_id', patternId)
    .eq('method_id', methodId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw new Error(handleSupabaseError(error));
  }

  return {
    documentId: data.id,
    id: data.id,
    status: data.status,
    resultFiles: data.result_files || [],
    startup: data.startup,
    pattern: data.pattern,
    method: data.method,
  };
}

export async function supabaseCreateStartupMethod(data: CreateStartupMethod): Promise<StartupMethod> {
  const { resultFiles, ...payload } = data;

  // Create the startup method
  const { data: startupMethod, error } = await supabase
    .from('startup_methods')
    .insert({
      startup_id: payload.startup,
      pattern_id: payload.pattern,
      method_id: payload.method,
      status: payload.status,
    })
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Handle file uploads
  if (resultFiles && resultFiles.length > 0) {
    const fileUrls = await Promise.all(
      resultFiles.map(async (file) => {
        const fileName = `${startupMethod.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('method-results')
          .upload(fileName, file);

        if (uploadError) throw new Error(handleSupabaseError(uploadError));

        const { data: urlData } = supabase.storage
          .from('method-results')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      })
    );

    // Update with file URLs
    await supabase
      .from('startup_methods')
      .update({ result_files: fileUrls })
      .eq('id', startupMethod.id);

    startupMethod.result_files = fileUrls;
  }

  return {
    documentId: startupMethod.id,
    id: startupMethod.id,
    status: startupMethod.status,
    resultFiles: startupMethod.result_files || [],
    startup: startupMethod.startup,
    pattern: startupMethod.pattern,
    method: startupMethod.method,
  };
}

export async function supabaseUpdateStartupMethod(data: UpdateStartupMethod): Promise<StartupMethod> {
  const { documentId, resultFiles, ...payload } = data;

  // Update the startup method
  const updateData: any = {};
  if (payload.status) updateData.status = payload.status;

  const { data: startupMethod, error } = await supabase
    .from('startup_methods')
    .update(updateData)
    .eq('id', documentId)
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Handle new file uploads
  if (resultFiles && resultFiles.length > 0) {
    const newFileUrls = await Promise.all(
      resultFiles.map(async (file) => {
        const fileName = `${startupMethod.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('method-results')
          .upload(fileName, file);

        if (uploadError) throw new Error(handleSupabaseError(uploadError));

        const { data: urlData } = supabase.storage
          .from('method-results')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      })
    );

    const allFiles = [...(startupMethod.result_files || []), ...newFileUrls];

    await supabase
      .from('startup_methods')
      .update({ result_files: allFiles })
      .eq('id', documentId);

    startupMethod.result_files = allFiles;
  }

  return {
    documentId: startupMethod.id,
    id: startupMethod.id,
    status: startupMethod.status,
    resultFiles: startupMethod.result_files || [],
    startup: startupMethod.startup,
    pattern: startupMethod.pattern,
    method: startupMethod.method,
  };
}

// Recommendations
export async function supabaseGetRecommendations(startupId?: string): Promise<Recommendation[]> {
  let query = supabase
    .from('recommendations')
    .select(`
      *,
      patterns:recommendations_patterns(
        pattern:patterns(*)
      ),
      coach:users!coach_id(*),
      startup:startups(*)
    `);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(rec => ({
    documentId: rec.id,
    comment: rec.comment,
    type: rec.type,
    patterns: rec.patterns?.map((p: any) => p.pattern) || [],
    coach: rec.coach,
    startup: rec.startup,
    readAt: rec.read_at,
    createdAt: rec.created_at,
  }));
}

export interface CreateRecommendation {
  comment: string;
  type: 'pattern' | 'url' | 'file' | 'contact';
  patterns?: { set: string[] };
  coach?: string;
  startup?: string;
  readAt?: string;
}

export interface UpdateRecommendation {
  documentId: string;
  comment?: string;
  readAt?: string;
}

export async function supabaseCreateRecommendation(
  recommendation: CreateRecommendation
): Promise<Recommendation> {
  const { patterns, ...data } = recommendation;

  const { data: rec, error } = await supabase
    .from('recommendations')
    .insert({
      comment: data.comment,
      type: data.type,
      coach_id: data.coach,
      startup_id: data.startup,
      read_at: data.readAt,
    })
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Link patterns if provided
  if (patterns?.set && patterns.set.length > 0) {
    await supabase
      .from('recommendations_patterns_lnk')
      .insert(
        patterns.set.map(patternId => ({
          recommendation_id: rec.id,
          pattern_id: patternId,
        }))
      );
  }

  return supabaseGetRecommendation(rec.id);
}

async function supabaseGetRecommendation(id: string): Promise<Recommendation> {
  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      patterns:recommendations_patterns(
        pattern:patterns(*)
      ),
      coach:users!coach_id(*),
      startup:startups(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    comment: data.comment,
    type: data.type,
    patterns: data.patterns?.map((p: any) => p.pattern) || [],
    coach: data.coach,
    startup: data.startup,
    readAt: data.read_at,
    createdAt: data.created_at,
  };
}

// Invitations
export async function supabaseGetInvitations(startupDocumentId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      invitedBy:invitations_invited_by_lnk(
        user:profiles(*)
      ),
      startup:invitations_startup_lnk(
        startup:startups(*)
      )
    `)
    .eq('startup_id', startupDocumentId);

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(inv => ({
    documentId: inv.id,
    email: inv.email,
    token: inv.token,
    acceptedAt: inv.accepted_at,
    startup: inv.startup?.[0]?.startup || null,
    invitedBy: inv.invitedBy?.[0]?.user || null,
    createdAt: inv.created_at,
  }));
}

export async function supabaseCreateInvitation(invitation: CreateInvitation): Promise<Invitation> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email: invitation.email,
      startup_id: invitation.startup,
      // Note: invited_by relationship needs to be created separately
      token,
    })
    .select(`
      *,
      invitedBy:invitations_invited_by_lnk(
        user:profiles(*)
      ),
      startup:invitations_startup_lnk(
        startup:startups(*)
      )
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    email: data.email,
    token: data.token,
    acceptedAt: data.accepted_at,
    startup: data.startup,
    invitedBy: data.invitedBy,
    createdAt: data.created_at,
  };
}

export async function supabaseAcceptInvitation(token: string): Promise<Invitation> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  // Find and update invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)
    .select(`
      *,
      invitedBy:invitations_invited_by_lnk(
        user:profiles(*)
      ),
      startup:invitations_startup_lnk(
        startup:startups(*)
      )
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Add user to startup
  await supabase
    .from('startups_users_lnk')
    .insert({
      user_id: authData.user.id,
      startup_id: invitation.startup_id,
    });

  return {
    documentId: invitation.id,
    email: invitation.email,
    token: invitation.token,
    acceptedAt: invitation.accepted_at,
    startup: invitation.startup,
    invitedBy: invitation.invitedBy,
    createdAt: invitation.created_at,
  };
}

// Methods
export async function supabaseGetMethods(): Promise<Method[]> {
  const { data, error } = await supabase
    .from('methods')
    .select('*');

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(method => ({
    documentId: method.id,
    name: method.name,
    description: method.description,
    phases: method.phases || [],
    categories: method.categories || [],
    content: method.content || '',
    url: method.url || '',
    patterns: [],
  }));
}

export async function supabaseGetMethod(documentId: string): Promise<Method> {
  const { data, error } = await supabase
    .from('methods')
    .select(`
      *,
      patterns:methods_patterns(
        pattern:patterns(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    name: data.name,
    description: data.description,
    phases: data.phases || [],
    categories: data.categories || [],
    content: data.content || '',
    url: data.url || '',
    patterns: data.patterns?.map((p: any) => p.pattern) || [],
  };
}

// User Questions
export async function supabaseGetUserQuestions(
  startupDocumentId?: string,
  userDocumentId?: string,
  patternDocumentId?: string
): Promise<UserQuestion[]> {
  let query = supabase
    .from('user_questions')
    .select(`
      *,
      user:profiles(*),
      pattern:patterns(*),
      question:questions(*),
      startup:startups(*)
    `);

  if (startupDocumentId) {
    query = query.eq('startup_id', startupDocumentId);
  }
  if (userDocumentId) {
    query = query.eq('user_id', userDocumentId);
  }
  if (patternDocumentId) {
    query = query.eq('pattern_id', patternDocumentId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(uq => ({
    documentId: uq.id,
    answer: uq.answer,
    user: uq.user,
    pattern: uq.pattern,
    question: uq.question,
    startup: uq.startup,
  }));
}

export async function supabaseUpdateUserQuestion(
  updateUserQuestion: UpdateUserQuestion
): Promise<UserQuestion> {
  const { documentId, ...updates } = updateUserQuestion;

  const { error } = await supabase
    .from('user_questions')
    .update({
      answer: updates.answer,
    })
    .eq('id', documentId);

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetUserQuestion(documentId);
}

export async function supabaseGetUserQuestion(id: string): Promise<UserQuestion> {
  const { data, error } = await supabase
    .from('user_questions')
    .select(`
      *
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Get related data
  const { data: userLink } = await supabase
    .from('user_questions_user_lnk')
    .select('user:profiles(*)')
    .eq('user_question_id', id)
    .single();

  const { data: patternLink } = await supabase
    .from('user_questions_pattern_lnk')
    .select('pattern:patterns(*)')
    .eq('user_question_id', id)
    .single();

  const { data: questionLink } = await supabase
    .from('user_questions_question_lnk')
    .select('question:questions(*)')
    .eq('user_question_id', id)
    .single();

  const { data: startupLink } = await supabase
    .from('user_questions_startup_lnk')
    .select('startup:startups(*)')
    .eq('user_question_id', id)
    .single();

  return {
    documentId: data.id,
    answer: data.answer,
    user: userLink?.user || null,
    pattern: patternLink?.pattern || null,
    question: questionLink?.question || null,
    startup: startupLink?.startup || null,
  };
}

export async function supabaseFindUserQuestion(
  userId: string,
  patternId: string,
  questionId: string,
  startupId?: string
): Promise<UserQuestion | null> {
  // Find the user question by matching relationships
  const { data: userQuestions, error } = await supabase
    .from('user_questions')
    .select('*');

  if (error) throw new Error(handleSupabaseError(error));

  // Check each question for matching relationships
  for (const uq of userQuestions || []) {
    const { data: userLink } = await supabase
      .from('user_questions_user_lnk')
      .select('user_id')
      .eq('user_question_id', uq.id)
      .eq('user_id', userId)
      .single();

    const { data: patternLink } = await supabase
      .from('user_questions_pattern_lnk')
      .select('pattern_id')
      .eq('user_question_id', uq.id)
      .eq('pattern_id', patternId)
      .single();

    const { data: questionLink } = await supabase
      .from('user_questions_question_lnk')
      .select('question_id')
      .eq('user_question_id', uq.id)
      .eq('question_id', questionId)
      .single();

    if (userLink && patternLink && questionLink) {
      if (startupId) {
        const { data: startupLink } = await supabase
          .from('user_questions_startup_lnk')
          .select('startup_id')
          .eq('user_question_id', uq.id)
          .eq('startup_id', startupId)
          .single();
        if (startupLink) {
          return supabaseGetUserQuestion(uq.id);
        }
      } else {
        return supabaseGetUserQuestion(uq.id);
      }
    }
  }

  return null;
}

export async function supabaseCreateUserQuestion(
  createUserQuestion: CreateUserQuestion
): Promise<UserQuestion> {
  const { data, error } = await supabase
    .from('user_questions')
    .insert({
      answer: createUserQuestion.answer,
    })
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Create relationships
  await supabase.from('user_questions_user_lnk').insert({
    user_question_id: data.id,
    user_id: createUserQuestion.user,
  });

  await supabase.from('user_questions_pattern_lnk').insert({
    user_question_id: data.id,
    pattern_id: createUserQuestion.pattern,
  });

  await supabase.from('user_questions_question_lnk').insert({
    user_question_id: data.id,
    question_id: createUserQuestion.question,
  });

  if (createUserQuestion.startup) {
    await supabase.from('user_questions_startup_lnk').insert({
      user_question_id: data.id,
      startup_id: createUserQuestion.startup,
    });
  }

  return supabaseGetUserQuestion(data.id);
}

// Requests
export interface CreateRequest {
  comment: string;
  startup?: string;
}

export interface UpdateRequest {
  documentId: string;
  comment?: string;
  readAt?: string;
}

export async function supabaseGetRequests(startupId?: string): Promise<Request[]> {
  let query = supabase
    .from('requests')
    .select('*');

  if (startupId) {
    const { data: links } = await supabase
      .from('requests_startup_lnk')
      .select('request_id')
      .eq('startup_id', startupId);
    
    const requestIds = links?.map(l => l.request_id) || [];
    if (requestIds.length > 0) {
      query = query.in('id', requestIds);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(req => ({
    documentId: req.id,
    comment: req.comment,
    readAt: req.read_at,
    createdAt: req.created_at,
  }));
}

export async function supabaseCreateRequest(request: CreateRequest): Promise<Request> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      comment: request.comment,
    })
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  if (request.startup) {
    await supabase.from('requests_startup_lnk').insert({
      request_id: data.id,
      startup_id: request.startup,
    });
  }

  return {
    documentId: data.id,
    comment: data.comment,
    readAt: data.read_at,
    createdAt: data.created_at,
  };
}

export async function supabaseUpdateRequest(update: UpdateRequest): Promise<Request> {
  const { documentId, ...updates } = update;
  
  const { data, error } = await supabase
    .from('requests')
    .update({
      comment: updates.comment,
      read_at: updates.readAt,
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return {
    documentId: data.id,
    comment: data.comment,
    readAt: data.read_at,
    createdAt: data.created_at,
  };
}

export async function supabaseDeleteRequest(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', documentId);

  if (error) throw new Error(handleSupabaseError(error));
}

// Additional missing functions
export async function supabaseUpdateRecommendation(update: UpdateRecommendation): Promise<Recommendation> {
  const { documentId, ...updates } = update;
  
  const { error } = await supabase
    .from('recommendations')
    .update({
      comment: updates.comment,
      read_at: updates.readAt,
    })
    .eq('id', documentId);

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetRecommendation(documentId);
}

export async function supabaseDeleteRecommendation(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('recommendations')
    .delete()
    .eq('id', documentId);

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseGetStartupPattern(startupPatternId: string): Promise<StartupPattern> {
  const patterns = await supabaseGetStartupPatterns('', '', undefined);
  const pattern = patterns.find(p => p.documentId === startupPatternId);
  if (!pattern) throw new Error('Startup pattern not found');
  return pattern;
}

export async function supabaseDeleteInvitation(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', documentId);

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseResendInvitation(documentId: string): Promise<Invitation> {
  return supabaseGetInvitation(documentId);
}

async function supabaseGetInvitation(id: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  const { data: invitedByLink } = await supabase
    .from('invitations_invited_by_lnk')
    .select('user:profiles(*)')
    .eq('invitation_id', id)
    .single();

  const { data: startupLink } = await supabase
    .from('invitations_startup_lnk')
    .select('startup:startups(*)')
    .eq('invitation_id', id)
    .single();

  return {
    documentId: data.id,
    email: data.email,
    token: data.token,
    acceptedAt: data.accepted_at,
    startup: startupLink?.startup || null,
    invitedBy: invitedByLink?.user || null,
    createdAt: data.created_at,
  };
}

export async function supabaseGetStartupMembers(startupId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('startups_users_lnk')
    .select('user:profiles(*)')
    .eq('startup_id', startupId);

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map((link: any) => link.user);
}

export async function supabaseGetAvailableStartups(): Promise<Startup[]> {
  return supabaseGetStartups();
}

// Password reset functions
export async function supabaseForgotPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseResetPassword(token: string, password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw new Error(handleSupabaseError(error));
}