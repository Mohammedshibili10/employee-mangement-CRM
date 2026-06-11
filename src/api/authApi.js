import axios from "axios";

export const loginApi = async (credentials) => {
  const res = await axios.post("/api/auth/login", credentials);
  return res.data;
};

export const getMeApi = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
};

export const changePasswordApi = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.put("/api/auth/change-password", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
