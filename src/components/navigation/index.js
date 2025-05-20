import { createStackNavigator } from "@react-navigation/stack";
import login from "../../screens/general/login/login";
import AppDrawer from "./appDrawer";
import OrderDetail from "../../screens/order/orderDetail";
import OrderSummary from "../../screens/order/orderSumary";
import PaymentSummaryScreen from "../../screens/order/paymentSummary";
import QrPaymentScreen from "../../screens/order/qrPayment";
import seatBookingDetail from "../../screens/seat-booking/seatBookingDetail";
import ProductDetail from "../../screens/menu/productDetail";
import SeatDetailScreen from "../../screens/seat-management/seatManagementDetail";
// import BottomTabNavigator from "./tabNavigator";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSummary"
        component={PaymentSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QrPayment"
        component={QrPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeatBookingDetail"
        component={seatBookingDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeatDetail"
        component={SeatDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MainApp" component={AppDrawer} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
