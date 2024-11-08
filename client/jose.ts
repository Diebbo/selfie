"use server";
import * as jose from "jose";

export enum AuthLevel {
  authenticated,
  unauthenticated,
  notVerified,
}

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.JWT_SECRET),
};

export const isAuthenticated = async (token: string) => {
  try {
    const decoded: any = await jose.jwtVerify(token, jwtConfig.secret);
    if (decoded?.payload.isVerified) {
      return AuthLevel.authenticated;
    } else {
      return AuthLevel.notVerified;
    }
  } catch (err) {
    return AuthLevel.unauthenticated;
  }
};
