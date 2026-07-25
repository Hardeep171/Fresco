import "express";

declare global {
  namespace Express {
    interface Request {
      // User added after authentication
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export {};
