import axios from "axios";
import { interceptorError } from "./refresh-token";

export const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_CMS,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosClient.interceptors.response.use(function (response: any) {
  // response.config.headers["Content-Type"] = "application/json;audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg";
  // response.headers["content-type"] = "application/json;audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg";
  return response;
}, interceptorError);

AxiosClient.interceptors.request.use(function (config: any) {
  const token = window?.localStorage?.getItem("auth_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// export const fetcherClient = (agr) => {
//   if (typeof agr === "string") {
//     if (agr) {
//       return AxiosClient.get(agr);
//     }
//   }

//   if (typeof agr === "object") {
//     const [url, params] = agr;
//     if (params) {
//       return AxiosClient.get(url, { params: params });
//     }
//     if (agr && !params) {
//       return AxiosClient.get(agr);
//     }
//   }
// };

// axios for API Go
export const AxiosAPI = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    "Content-Type": "application/json",
  },
});
AxiosAPI.interceptors.response.use(function (response: any) {
  return response;
}, interceptorError);

AxiosAPI.interceptors.request.use(async function (config: any) {
  const token = window?.localStorage?.getItem("auth_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export const fetcherClient = (url: any, params: any) => {
  if (url) {
    if (url.indexOf("/v1/e-learning") > -1) {
      return AxiosAPI.get(url, { params });
    } else {
      if (typeof url === "string") return AxiosClient.get(url, { params });
      else if (typeof url === "object") return AxiosClient.get(url[0], { params: url[1] });
    }
  }
};
export const optionsFetch = {
  fetcher: fetcherClient,
};
export default AxiosClient;
