import * as SecureStore from "expo-secure-store";

//* Hàm lưu token vào SecureStore
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await SecureStore.setItemAsync("accessToken", accessToken, {
      secure: true,
    });
    await SecureStore.setItemAsync("refreshToken", refreshToken, {
      secure: true,
    });
    console.log("Tokens đã được lưu thành công!");
  } catch (error) {
    console.error("Lỗi khi lưu token:", error);
  }
};

//* Hàm lấy Access Token
export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync("accessToken");
  } catch (error) {
    console.error("Lỗi khi lấy Access Token:", error);
    return null;
  }
};

//* Hàm lấy Refresh Token
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync("refreshToken");
  } catch (error) {
    console.error("Lỗi khi lấy Refresh Token:", error);
    return null;
  }
};

//* Hàm xóa token khi đăng xuất
export const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    console.log("Tokens đã bị xóa!");
  } catch (error) {
    console.error("Lỗi khi xóa token:", error);
  }
};
