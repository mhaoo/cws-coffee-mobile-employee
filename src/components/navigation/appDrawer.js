import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from "./customDrawer"; // tuỳ chỉnh giao diện
import Menu from "../../screens/menu/menu";
import SeatBooking from "../../screens/seat-booking/seatBooking";
import Device from "../../screens/device/device";
import Order from "../../screens/order/order";
import SeatsManagementScreen from "../../screens/seat-management/seatManagement";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Đơn hàng"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "permanent", // luôn hiện
        drawerStyle: { width: 180 },
        sceneContainerStyle: { marginLeft: 180 },
      }}
    >
      <Drawer.Screen name="Đơn hàng" component={Order} />
      <Drawer.Screen name="Menu" component={Menu} />
      <Drawer.Screen name="Đặt phòng" component={SeatBooking} />
      <Drawer.Screen name="Thiết bị" component={Device} />
      <Drawer.Screen name="Quản lý phòng" component={SeatsManagementScreen} />
    </Drawer.Navigator>
  );
}
