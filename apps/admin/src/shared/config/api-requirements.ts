export interface ApiRequirementEndpoint {
  method: string;
  path: string;
  description?: string;
}

export interface ApiRequirementBlock {
  title: string;
  summary: string;
  endpoints: ApiRequirementEndpoint[];
}
