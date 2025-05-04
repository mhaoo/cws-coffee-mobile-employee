import { createStackNavigator } from "@react-navigation/stack";
import login from "../../screens/general/login/login";
import AppDrawer from "./appDrawer";
import OrderDetail from "../../screens/order/orderDetail";
import OrderSummary from "../../screens/order/orderSumary";
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
        name="OrderDetail"
        component={OrderDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MainApp" component={AppDrawer} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
