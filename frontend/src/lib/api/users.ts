import { userSchema } from "@/types/transit";
import { getResource } from "./client";
export const usersApi = {
  me: (accessToken: string, signal?: AbortSignal) =>
    getResource("users/me/", userSchema, signal, accessToken),
};
