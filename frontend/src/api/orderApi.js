import instance from "./instance";

export const orderApi = {
  getAll: () => instance.get("/orders"),
  getById: (id) => instance.get(`/orders/${id}`),
  create: (data) => instance.post("/orders", data),
  update: (id, data) => instance.put(`/orders/${id}`, data),
  delete: (id) => instance.delete(`/orders/${id}`),
  // Additional order-specific endpoints if needed
  updateStatus: (id, status) =>
    instance.patch(`/orders/${id}/status`, { status }),
  getOrderItems: (id) => instance.get(`/orders/${id}/items`),
};
