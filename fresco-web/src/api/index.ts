export * from "./client";
export * from "./error";
export * from "./interceptors";
export * from "./auth.api";
export * from "./user.api";
export * from "./address.api";
export * from "./category.api";
export * from "./garment.api";
export * from "./service.api";
export * from "./pricing.api";
export * from "./cart.api";
export * from "./order.api";
export * from "./assignment.api";
export * from "./inspection.api";
export * from "./payment.api";
export * from "./delivery-task.api";

import { setupInterceptors } from "./interceptors";

// Initialize request and response interceptors
setupInterceptors();
