import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import addressReducer from "./slices/addressSlice";
import categoryReducer from "./slices/categorySlice";
import garmentReducer from "./slices/garmentSlice";
import serviceReducer from "./slices/serviceSlice";
import pricingReducer from "./slices/pricingSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  address: addressReducer,
  category: categoryReducer,
  garment: garmentReducer,
  service: serviceReducer,
  pricing: pricingReducer,
  cart: cartReducer,
  order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
