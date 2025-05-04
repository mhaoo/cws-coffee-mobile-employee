import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from "./customDrawer"; // tuỳ chỉnh giao diện
import Menu from "../../screens/menu/menu";
import SeatBooking from "../../screens/seat-booking/seatBooking";
import Device from "../../screens/device/device";
import Order from "../../screens/order/order";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Menu"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "permanent", // luôn hiện
        drawerStyle: { width: 180 },
        sceneContainerStyle: { marginLeft: 180 },
      }}
    >
      <Drawer.Screen name="Menu" component={Menu} />
      <Drawer.Screen name="Đặt chỗ" component={SeatBooking} />
      <Drawer.Screen name="Thiết bị" component={Device} />
      <Drawer.Screen name="Đơn hàng" component={Order} />
    </Drawer.Navigator>
  );
}
