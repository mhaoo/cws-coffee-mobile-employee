import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import useProductById from "../../hooks/product/useProductById";
import useAddItemToOrder from "../../hooks/order/useAddItemToOrder";
import { useQueryClient } from "@tanstack/react-query";
import GeneralButton from "../../components/button/generalButton";

export default function DeviceDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { device } = route.params;
  const { booking, updateBooking } = route.params;
  const { data: prod, isLoading, error } = useProductById(device.id);
  const { mutate: addItemToOrder } = useAddItemToOrder();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(30);

  if (isLoading || !prod) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Lỗi: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {prod.images?.[0] && (
        <Image source={{ uri: prod.images[0] }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{prod.name}</Text>
        {prod.description && (
          <Text style={styles.description}>{prod.description}</Text>
        )}
        <Text style={styles.price}>Giá: {prod.price} VNĐ</Text>
        {prod.rental && (
          <>
            <Text style={styles.sectionTitle}>Thời gian thuê</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity
                style={styles.durationBtn}
                onPress={() => setDuration((prev) => Math.max(30, prev - 30))}
              >
                <Text style={styles.durationBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.durationText}>{duration} phút</Text>
              <TouchableOpacity
                style={styles.durationBtn}
                onPress={() => setDuration((prev) => prev + 30)}
              >
                <Text style={styles.durationBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={styles.footer}>
          <GeneralButton
            text="Thêm vào giỏ"
            style={styles.addButton}
            onPress={() => {
              const payload = {
                productId: device.id,
                quantity: 1,
                duration: prod.rental ? duration : 1,
                options: [],
                note: "",
              };
              addItemToOrder(
                { bookingId: booking.id, item: payload },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries(["orders", booking.id]);
                    const rootNav =
                      navigation.getParent()?.getParent() ?? navigation;
                    rootNav.navigate("OrderDetail", { booking, updateBooking });
                  },
                  onError: (err) => {
                    Alert.alert("Lỗi", err.message);
                  },
                }
              );
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#f00" },
  image: { width: "100%", height: 250, borderRadius: 8, marginBottom: 16 },
  info: { paddingHorizontal: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  durationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  durationBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#93540A", borderRadius: 6 },
  durationBtnText: { fontSize: 18, color: "#93540A", fontWeight: "600" },
  durationText: { fontSize: 16, marginHorizontal: 12, color: "#333" },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#222" },
  description: { fontSize: 16, color: "#555", marginBottom: 12 },
  price: { fontSize: 18, fontWeight: "600", color: "#000" },
  footer: { marginTop: 24, alignItems: "center" },
  addButton: { width: "100%", marginHorizontal: 0 },
});
