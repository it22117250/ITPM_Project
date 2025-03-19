import instance from "./instance";

export const supplierApi = {
  getAll: () => instance.get("/suppliers"),
  getById: (id) => instance.get(`/suppliers/${id}`),
  create: (data) => instance.post("/suppliers", data),
  update: (id, data) => instance.put(`/suppliers/${id}`, data),
  delete: (id) => instance.delete(`/suppliers/${id}`),
};
