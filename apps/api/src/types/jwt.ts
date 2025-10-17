import { JWTPayload } from "hono/utils/jwt/types";

export type JwtPayload = JWTPayload & { id: string };
