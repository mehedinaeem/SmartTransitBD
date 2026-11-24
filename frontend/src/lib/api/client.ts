import { z } from "zod";
const mode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";
if (!["mock", "django"].includes(mode))
  throw new Error("NEXT_PUBLIC_API_MODE must be mock or django");
export const apiMode = mode as "mock" | "django";
const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (apiMode === "django" && !configuredUrl)
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required in Django mode");
const baseUrl =
  apiMode === "mock" ? "/api/mock" : configuredUrl!.replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
// Bearer tokens must be supplied by a future auth integration; no tokens are persisted here.
export async function getResource<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    signal,
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!response.ok)
    throw new ApiError(response.status, `Request failed (${response.status})`);
  return schema.parse(await response.json());
}
export const listSchema = <T>(schema: z.ZodType<T>) =>
  apiMode === "mock"
    ? z.array(schema)
    : z
        .object({
          count: z.number().int().nonnegative(),
          next: z.string().nullable(),
          previous: z.string().nullable(),
          results: z.array(schema),
        })
        .transform((page) => page.results);

export async function postResource<T>(
  path: string,
  schema: z.ZodType<T>,
  body: unknown,
  options: { idempotencyKey: string; signal?: AbortSignal },
): Promise<T> {
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    method: "POST",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": options.idempotencyKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new ApiError(response.status, `Request failed (${response.status})`);
  return schema.parse(await response.json());
}
