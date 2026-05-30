import { apiEnvSchema } from '@sadafgold/shared/api-env';

export const workerEnv = apiEnvSchema.parse(process.env);
