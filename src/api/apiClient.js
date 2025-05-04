import axios from "axios";
import { getAccessToken, removeTokens } from "../config/secureStore";
// import Config from "react-native-config";
import useRefreshToken from "../hooks/login/useRefreshToken";
import { API_URL } from "@env";

const API_BASE_URL = API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

//* Interceptor để tự động thêm Access Token vào request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
  }
  return config;
});

//* Interceptor để tự động refresh token nếu bị 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenMutation = useRefreshToken();
        const newAccessToken = await refreshTokenMutation.mutateAsync();

        if (newAccessToken) {
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token không hợp lệ:", refreshError);
        await removeTokens(); // Xóa token nếu refresh thất bại
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
