export interface SecurityConfig {
  MAX_LOGIN_ATTEMPTS: number;
  LOCKOUT_DURATION: number; // in minutes
  PASSWORD_MIN_LENGTH: number;
  SESSION_TIMEOUT: number; // in minutes
  REQUIRE_2FA: boolean;
}

export const securityConfig: SecurityConfig = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15,
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 60,
  REQUIRE_2FA: false, // Can be enabled for extra security
};
