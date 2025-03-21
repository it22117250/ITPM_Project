import instance from "./instance";

export const userApi = {
  getAll: async () => {
    try {
      const response = await instance.get("/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch users" };
    }
  },

  getById: async (id) => {
    try {
      const response = await instance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: `Failed to fetch user with id: ${id}`,
        }
      );
    }
  },

  create: async (data) => {
    try {
      const response = await instance.post("/users", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create user" };
    }
  },

  update: async (id, data) => {
    try {
      const response = await instance.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: `Failed to update user with id: ${id}`,
        }
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await instance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: `Failed to delete user with id: ${id}`,
        }
      );
    }
  },

  login: async (credentials) => {
    try {
      const response = await instance.post("/users/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  register: async (userData) => {
    try {
      const response = await instance.post("/users/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  updateProfile: async (id, data) => {
    try {
      const response = await instance.patch(`/users/${id}/profile`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update profile" };
    }
  },

  changePassword: async (id, passwords) => {
    try {
      const response = await instance.put(
        `/users/${id}/change-password`,
        passwords
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to change password" };
    }
  },
};
