export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  givenName: string;
  familyName: string;
  startups: Startup[];
}

export interface Startup {
  documentId: string;
  name: string;
  startDate: string;
  foundersCount: number;
  background: string;
  idea: string;
  industry: string;
  industry_other: string | null;
  targetMarket: string;
  phase: string;
  isisProblemValidated: boolean;
  qualifiedConversationsCount: number;
  isTargetGroupDefined: boolean;
  isisPrototypeValidated: boolean;
  isisMvpTested: boolean;
}

export interface StrapiAuthResponse {
  jwt: string;
  user: User;
}

export interface StrapiLoginCredentials {
  identifier: string;
  password: string;
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export enum CategoryEnum {
  the_entrepreneur,
  time_space,
  sustainability_responsibility,
  team_collaboration,
  customers_stakeholders_ecosystem,
  the_solution,
}

export enum PhaseEnum {
  start,
  discover_explore,
  transform,
  create,
  implement,
}

export interface Pattern {
  name: string;
  description: string;
  image: string;
  categories: CategoryEnum[];
  phases: PhaseEnum[];
  relatedPatterns: Pattern[];
}

export interface StrapiPatternResponse {
  data: Pattern[];
}
