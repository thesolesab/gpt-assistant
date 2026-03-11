import { z } from "zod";
import { insertMessageSchema, messages } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  chat: {
    send: {
      method: "POST" as const,
      path: "/api/chat" as const,
      input: z.object({
        message: z.string().min(1),
      }),
      responses: {
        200: z.object({
          reply: z.string(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/chat/history" as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        500: errorSchemas.internal,
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
