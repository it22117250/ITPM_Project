import instance from "./instance";

export const productApi = {
  getAll: () => instance.get("/products"),
  getById: (id) => instance.get(`/products/${id}`),
  create: (data) => instance.post("/products", data),
  update: (id, data) => instance.put(`/products/${id}`, data),
  delete: (id) => instance.delete(`/products/${id}`),
};
