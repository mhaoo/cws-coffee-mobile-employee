// login.js
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import GeneralButton from "../../../components/button/generalButton";
import useLogin from "../../../hooks/login/useLogin";
import { saveTokens } from "../../../config/secureStore";
import { useAuth } from "../../../contexts/authContext";

const { width, height } = Dimensions.get("window");

const loginImage = require("../../../images/loginImage.png");
const logoImage = require("../../../images/logo-no-background.png");

export default Login = function ({ navigation }) {
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordValidity = (value) => {
    const isNonWhiteSpace = /^\S*$/;
    if (!isNonWhiteSpace.test(value)) {
      return "Mật khẩu không được chứa khoảng trắng";
    }
    return null;
  };

  const handleLogin = async () => {
    // if (!isValidEmail(inputEmail)) {
    //   Alert.alert("Email không hợp lệ", "Vui lòng nhập đúng định dạng email");
    //   return;
    // }
    if (checkPasswordValidity(inputPass)) {
      Alert.alert("Mật khẩu không hợp lệ", checkPasswordValidity(inputPass));
      return;
    }
    // loginMutation.mutate(
    //   { email: inputEmail, password: inputPass },
    //   {
    //     onSuccess: async (response) => {
    //       const { accessToken, refreshToken } = response.data;
    //       console.log(
    //         "accessToken:",
    //         accessToken,
    //         "refreshToken:",
    //         refreshToken
    //       );
    //       await signIn(email, pass);
    //       await saveTokens(accessToken, refreshToken); //TODO Lưu token vào SecureStore
    //       Alert.alert("Đăng nhập thành công");
    //       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
    //     },
    //     onError: (error) => {
    //       Alert.alert(
    //         "Đăng nhập thất bại",
    //         error.response?.data?.message || "Có lỗi xảy ra"
    //       );
    //     },
    //   }
    // );

    try {
      await signIn(inputEmail, inputPass); // login + fetch profile
      Alert.alert("Đăng nhập thành công");
      navigation.replace("MainApp"); // sang Drawer
    } catch (err) {
      Alert.alert(
        "Đăng nhập thất bại",
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
    }

    // navigation.replace("MainApp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Container chính sử dụng flex row */}
      <View style={styles.layoutContainer}>
        {/* ==================== Phần Ảnh Bên Trái (50%) ==================== */}
        <View style={styles.leftPane}>
          <Image
            source={loginImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        {/* ==================== Phần Form Bên Phải (ScrollView chiếm 50%) ==================== */}
        {/* ScrollView nhận flex: 1 để chiếm nửa màn hình */}
        <ScrollView
          style={styles.rightScrollView}
          contentContainerStyle={styles.rightContentContainer}
          keyboardShouldPersistTaps="handled" // Giúp nhấn nút trong ScrollView dễ hơn khi bàn phím mở
        >
          {/* Form container không cần style phức tạp về layout nữa */}
          <View style={styles.formContainer}>
            {/* ----- Logo ----- */}
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* ----- Welcome Texts ----- */}
            <Text style={styles.mainTitle}>CHÀO MỪNG QUAY TRỞ LẠI</Text>
            <Text style={styles.subTitle}>
              Vui lòng điền thông tin đăng nhập của bạn
            </Text>

            {/* ----- Tên đăng nhập ----- */}
            <Text style={styles.label}>Email đăng nhập</Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: isFocusedEmail ? "#93540A" : "#A8A8A8" },
              ]}
              placeholder="Nhập email"
              placeholderTextColor="#A8A8A8"
              onChangeText={setInputEmail}
              value={inputEmail}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
              selectionColor={isFocusedEmail ? "#93540A" : "#A8A8A8"}
            ></TextInput>

            {/* ----- Mật khẩu ----- */}
            <Text style={styles.label}>Mật khẩu</Text>
            <View
              style={[
                styles.passwordInputContainer,
                { borderColor: isFocusedPass ? "#93540A" : "#A8A8A8" },
              ]}
            >
              <TextInput
                style={[
                  styles.passwordInput,
                  { borderColor: isFocusedPass ? "#93540A" : "#A8A8A8" },
                ]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#A8A8A8"
                onChangeText={setInputPass}
                value={inputPass}
                secureTextEntry={isPasswordHidden}
                onFocus={() => setIsFocusedPass(true)}
                onBlur={() => setIsFocusedPass(false)}
                selectionColor={isFocusedPass ? "#93540A" : "#A8A8A8"}
              ></TextInput>
              <TouchableOpacity
                onPress={() => setIsPasswordHidden(!isPasswordHidden)}
              >
                <MaterialCommunityIcons
                  name={isPasswordHidden ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#A8A8A8"
                  style={styles.hiddenIcon}
                />
              </TouchableOpacity>
            </View>

            {/* ----- Nút Đăng nhập ----- */}
            <GeneralButton
              onPress={handleLogin}
              text="Đăng nhập"
              style={styles.loginGeneralButton}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  layoutContainer: {
    flex: 1,
    flexDirection: "row", // Chia 2 cột chính
  },
  // ---- Cột Trái ----
  leftPane: {
    flex: 1, // Chiếm 50% chiều rộng
    backgroundColor: "#f0f0f0", // Màu nền tạm nếu ảnh lỗi
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  // ---- Cột Phải (ScrollView) ----
  rightScrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // ---- Nội dung bên trong ScrollView ----
  rightContentContainer: {
    flexGrow: 1, // Cho phép nội dung co giãn và scroll nếu cần
    justifyContent: "center", // Canh giữa form theo chiều dọc
    alignItems: "center", // Canh giữa form theo chiều ngang
    paddingHorizontal: width * 0.04, // Padding ngang cho nội dung
    paddingVertical: 30, // Padding dọc cho nội dung
  },
  // ---- Form ----
  formContainer: {
    width: "85%", // Chiều rộng của form bên trong cột phải
    maxWidth: 450, // Giới hạn chiều rộng tối đa
    alignItems: "center", // Canh giữa logo, các text title
    marginBottom: 70,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#93540A",
    marginBottom: 8,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 20,
    marginBottom: 35,
    textAlign: "center",
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    alignSelf: "flex-start", // Canh label sang trái
    marginLeft: "2%",
  },
  textInput: {
    fontSize: 20,
    height: height * 0.06,
    paddingLeft: 20,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: width * 0.02,
    backgroundColor: "#F9F9F9",
  },
  passwordInputContainer: {
    flexDirection: "row",
    height: height * 0.06,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: width * 0.02,
    backgroundColor: "#F9F9F9",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 20,
    fontSize: 20,
  },
  hiddenIcon: {
    paddingHorizontal: 20,
  },
  loginGeneralButton: {
    width: "100%",
    marginHorizontal: 0,
    marginTop: 30,
  },
});
