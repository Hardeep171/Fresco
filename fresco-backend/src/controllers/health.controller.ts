import type { RequestHandler } from "express";

import { ApiResponse } from "../utils/api-response.js";

export const getHealth: RequestHandler = (_request, response) => {
  return ApiResponse.send(response, 200, "Service is healthy.", {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
};
