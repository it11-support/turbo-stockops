import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

const EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] | undefined) ?? "7d";

export function signJwt(
  payload: object,
  expiry?: jwt.SignOptions["expiresIn"],
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiry || EXPIRES_IN });
}

export function verifyJwt<T = unknown>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
