import { workerEnvSchema, type WorkerEnv } from '@sadafgold/shared/worker-env';

export function getWorkerEnv(): WorkerEnv {
  return workerEnvSchema.parse(process.env);
}
