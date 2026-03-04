import API from "./api";

export const userService = {
    getAll: () => API.get("/api/v1/users"),
    getById: (id: number | string) => API.get(`/api/v1/users/${id}`),
    create: (data: any) => API.post("/api/v1/users", data),
    update: (id: number | string, data: any) => API.put(`/api/v1/users/${id}`, data),
    delete: (id: number | string) => API.delete(`/api/v1/users/${id}`),
};
