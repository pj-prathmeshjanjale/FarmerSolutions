import api from "./axios";

export const testBackend = () => api.get("/test");
