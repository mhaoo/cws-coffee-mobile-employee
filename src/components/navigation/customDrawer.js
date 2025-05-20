import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

const logoImage = require("../../images/logo-no-background.png");

const items = [
  {
    name: "Đơn hàng",
    iconLib: Ionicons,
    iconName: "receipt-outline",
    badge: 2,
  },
  { name: "Menu", iconLib: Ionicons, iconName: "cafe-outline" },
  {
    name: "Đặt phòng",
    iconLib: MaterialCommunityIcons,
    iconName: "seat-outline",
  },
  { name: "Thiết bị", iconLib: Ionicons, iconName: "print-outline" },
  { name: "Quản lý phòng", iconLib: Ionicons, iconName: "leaf-outline" },
];

export default function CustomDrawer(props) {
  const { navigation, state } = props;
  const current = state.routeNames[state.index];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logoImg} resizeMode="contain" />
      </View>

      {/* Scrollable menu area */}
      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {items.map(({ name, iconLib: IconLib, iconName, badge }) => {
          const active = current === name;
          return (
            <TouchableOpacity
              key={name}
              style={[styles.btn, active && styles.btnActive]}
              onPress={() => navigation.navigate(name)}
            >
              <IconLib
                name={iconName}
                size={26}
                color={active ? "#fff" : "#000000"}
              />
              <Text style={[styles.txt, active && styles.txtActive]}>
                {name}
              </Text>
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => navigation.getParent()?.navigate("Login")}
      >
        <MaterialCommunityIcons name="logout" size={28} color="#555" />
        <Text style={styles.txt}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },

  // Logo
  logoContainer: {
    width: "90%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImg: {
    width: "150%",
    height: "150%",
  },

  // Scroll area cho menu items
  scrollArea: {
    alignItems: "center",
    paddingBottom: 16,
  },

  // Ô vuông chung cho menu + placeholder
  btn: {
    width: "90%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnActive: {
    backgroundColor: "#93540A",
  },
  txt: {
    marginTop: 6,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  txtActive: {
    color: "#fff",
  },
  badge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  badgeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  // Logout
  logoutBtn: {
    width: "90%",
    aspectRatio: 1.5,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
