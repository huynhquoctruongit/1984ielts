import axios from "axios";
import { interceptorError } from "./refresh-token";

export const AxiosController = axios.create({
  baseURL: import.meta.env.VITE_CTRL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const AxiosServerController = axios.create({
  baseURL: import.meta.env.VITE_CTRL,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosController.interceptors.response.use(function (response: any) {
  return response.data;
}, interceptorError);

AxiosController.interceptors.request.use(function (config: any) {
  const token = window?.localStorage?.getItem("auth_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  if (config.url === "/users/me" && !token) return false;
  return config;
});

export const fetcherController: any = (url: any, params: any) => {
  return AxiosController.get(url, { params });
};
export default AxiosController;
