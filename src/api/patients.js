import api from "./axiosConfig";

export const getPatients = () => api.get("/patients");
export const getStats = () => api.get("/patients/stats");
export const addPatient = (data) => api.post("/patients", data);
export const markVisited = (id) => api.put(`/patients/${id}/visit`, {});
