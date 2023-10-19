export const VALID_USERNAME_REGEX = /^[0-9a-zA-Z_].*$/;
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_+.])(?=.*[0-9])(?=.*[a-z]).{6,}$/;
export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
