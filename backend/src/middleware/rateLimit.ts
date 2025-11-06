import rateLimit from "express-rate-limit";

const windowMsDefault = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxRequestsDefault = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300);

export const generalRateLimiter = rateLimit({
  windowMs: windowMsDefault,
  max: maxRequestsDefault,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Too many requests, please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Too many login attempts, please try again later.",
  },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Too many password reset attempts, please try again later.",
  },
});
