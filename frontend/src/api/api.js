import axios from "axios";

const api = axios.create({
  baseURL: "http://api.smarttask.local:31358",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Delete Task API
export const deleteTask = (id) => {
  return api.delete(`/api/tasks/${id}`);
};

// Update Task API
export const updateTask = (id, data) => {
  return api.put(`/api/tasks/${id}`, data);
};

export default api;
