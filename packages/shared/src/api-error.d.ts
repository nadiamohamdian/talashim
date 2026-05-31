export interface ApiErrorBody {
    message?: string | string[];
    statusCode?: number;
    error?: string;
}
export declare function parseApiErrorMessage(data: unknown, fallback?: string): string;
//# sourceMappingURL=api-error.d.ts.map