import instance from "./instance";

export const categoryApi = {
  getAll: () => instance.get("/categories"),
  getById: (id) => instance.get(`/categories/${id}`),
  create: (data) => instance.post("/categories", data),
  update: (id, data) => instance.put(`/categories/${id}`, data),
  delete: (id) => instance.delete(`/categories/${id}`),
};
