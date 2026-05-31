import { Injectable } from '@nestjs/common';

export interface RequestMetric {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  at: string;
}

@Injectable()
export class MetricsService {
  private totalRequests = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private readonly recent: RequestMetric[] = [];
  private readonly maxRecent = 200;
  private readonly startedAt = Date.now();

  recordRequest(input: {
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
  }) {
    this.totalRequests += 1;
    this.totalDurationMs += input.durationMs;
    if (input.statusCode >= 500) {
      this.totalErrors += 1;
    }

    this.recent.push({
      ...input,
      at: new Date().toISOString(),
    });

    if (this.recent.length > this.maxRecent) {
      this.recent.shift();
    }
  }

  getSnapshot() {
    const avgDurationMs =
      this.totalRequests === 0
        ? 0
        : Math.round((this.totalDurationMs / this.totalRequests) * 100) / 100;

    const statusCodes = this.recent.reduce<Record<string, number>>((acc, item) => {
      const bucket = `${item.statusCode}`;
      acc[bucket] = (acc[bucket] ?? 0) + 1;
      return acc;
    }, {});

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgDurationMs,
      statusCodes,
      recentSample: this.recent.slice(-20),
    };
  }
}
