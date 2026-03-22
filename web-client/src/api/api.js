import axios from "axios";

export const api = axios.create({
  baseURL: "vistasplus-api.vercel.app/api/v1",
  // baseURL: "http://localhost:8000/api/v1",
  // baseURL: "http://localhost:7000/api/v1",
  withCredentials: true,
});
