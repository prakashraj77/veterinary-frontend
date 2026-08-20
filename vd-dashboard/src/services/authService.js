import api from "./api";

// The current Spring Boot backend does not expose authentication endpoints yet.
// Keep this service ready for the backend auth controller without faking login data.
export const login = async (payload) => (await api.post("/auth/login", payload)).data;
export const register = async (payload) => (await api.post("/auth/register", payload)).data;
export const sendOtp = async (payload) => (await api.post("/auth/send-otp", payload)).data;
export const verifyOtp = async (payload) => (await api.post("/auth/verify-otp", payload)).data;
