// src/screens/menu/ProductDetail.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import GeneralButton from "../../components/button/generalButton";
import { toCurrency } from "../../utils/currency";
import useProductById from "../../hooks/product/useProductById";
import useAddItemToOrder from "../../hooks/order/useAddItemToOrder";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const route = useRoute();
  const { product, booking, updateBooking } = route.params;
  const navigation = useNavigation();
  const { mutate: addItemToOrder } = useAddItemToOrder();
  const queryClient = useQueryClient();
  // Size options and selection state (always declared)
  const sizes = [
    { id: "small", label: "S", priceDiff: 0 },
    { id: "medium", label: "M", priceDiff: 5000 },
    { id: "large", label: "L", priceDiff: 10000 },
  ];
  const [selectedSize, setSelectedSize] = useState(sizes[0].id);
  // Single option selection state
  const [selectedOption, setSelectedOption] = useState(null);
  // Fetch up-to-date product detail
  const { data: prod, isLoading } = useProductById(product.id);
  if (isLoading || !prod) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }

  // Compute total
  const base = prod.price;
  const diff = sizes.find((s) => s.id === selectedSize)?.priceDiff || 0;
  const optionsSum = selectedOption
    ? prod.options.find(
        (o) => (typeof o === "string" ? o : o.id) === selectedOption
      )?.price || 0
    : 0;
  const totalPrice = base + diff + optionsSum;

  const toggleOption = (id) => {
    setSelectedOption((prev) => (prev === id ? null : id));
  };

  // Trong chỗ onPress nút "Thêm vào giỏ":
  const handleAddToCart = () => {
    const payloadItem = {
      productId: product.id,
      quantity: 1,
      duration: 1,
      options: selectedOption ? [selectedOption] : [],
      note: "",
    };
    addItemToOrder(
      { bookingId: booking.id, item: payloadItem },
      {
        onSuccess: (response) => {
          // 1) Refresh lại danh sách orders
          queryClient.invalidateQueries(["orders", booking.id]);

          // 2) Nhảy thẳng về OrderDetail trên stack gốc
          //    Nếu bạn nằm trong nested navigator (Menu → ProductDetail),
          //    hãy gọi lên parent hai cấp để đến screen gốc:
          const rootNav = navigation.getParent()?.getParent() ?? navigation;
          rootNav.navigate("OrderDetail", {
            booking,
            updateBooking,
          });

          // Hoặc nếu đơn giản không nested quá sâu:
          // navigation.navigate("OrderDetail", { booking, updateBooking });
        },
        onError: (error) => {
          Alert.alert("Lỗi", error.message);
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: prod.images[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{prod.name}</Text>
        <Text style={styles.description}>{prod.description}</Text>
        <Text style={styles.price}>Giá cơ bản: {toCurrency(base)} VNĐ</Text>

        {prod.customizable && (
          <>
            <Text style={styles.sectionTitle}>Kích thước</Text>
            <Text style={styles.sectionSubtitle}>Chọn 1 loại size</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((s) => {
                const active = selectedSize === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                    onPress={() => setSelectedSize(s.id)}
                  >
                    <Text
                      style={[
                        styles.sizeBtnText,
                        active && styles.sizeBtnTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {prod.options && prod.options.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Tùy chọn</Text>
                {prod.options.map((opt) => {
                  const id = typeof opt === "string" ? opt : opt.id;
                  const label = typeof opt === "string" ? opt : opt.name;
                  const active = selectedOption === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={styles.optionRow}
                      onPress={() => toggleOption(id)}
                    >
                      <MaterialCommunityIcons
                        name={
                          active ? "checkbox-marked" : "checkbox-blank-outline"
                        }
                        size={24}
                        color="#93540A"
                      />
                      <Text
                        style={[
                          styles.optionLabel,
                          active && { fontWeight: "600" },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </>
        )}

        <View style={styles.footer}>
          <GeneralButton
            text="Thêm vào giỏ"
            style={styles.addButton}
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 300, resizeMode: "cover" },
  info: { padding: 16 },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 14, color: "#555", marginBottom: 12 },
  price: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  sizeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CCC",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  sizeBtnActive: {
    borderColor: "#93540A",
  },
  sizeBtnText: {
    fontSize: 16,
    color: "#888",
  },
  sizeBtnTextActive: {
    color: "#93540A",
    fontWeight: "600",
  },
  optionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  optionLabel: { marginLeft: 8, fontSize: 16, color: "#333" },
  footer: { marginTop: 24, alignItems: "center" },
  addButton: { width: "100%", marginHorizontal: 0 },
});
