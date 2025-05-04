// src/screens/seat-booking/seatBooking.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import GeneralButton from "../../components/button/generalButton";
import useRoomsByBranch from "../../hooks/room/useRoomsByBranch";

const { width } = Dimensions.get("window"); // tablet ~ 800‑1000 px

export default function SeatBooking() {
  const { data: rooms, isLoading, error } = useRoomsByBranch();

  if (isLoading)
    return (
      <Centered>
        <ActivityIndicator size="large" color="#93540A" />
        <Text>Đang tải dữ liệu…</Text>
      </Centered>
    );

  if (error)
    return (
      <Centered>
        <Text style={{ color: "red" }}>Lỗi: {error.message}</Text>
      </Centered>
    );

  /* render 1 card phòng */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Ảnh */}
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPXYaZ0GB5tWk4VO93M7GK020GyEIK_oqkUQ&s",
        }}
        style={styles.img}
      />

      {/* Thông tin */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.dim}>Số lượng tối đa: {item.capacity}</Text>
        <Text style={styles.dim}>Giá: {item.price.toLocaleString()} VNĐ</Text>
      </View>

      {/* Nút đặt chỗ */}
      <GeneralButton text="Đặt chỗ" style={styles.btn} />
    </View>
  );

  return (
    <FlatList
      data={rooms}
      renderItem={renderItem}
      keyExtractor={(it) => it.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ---- helper ---- */
const Centered = ({ children }) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    {children}
  </View>
);

/* ---- styles cho tablet ---- */
const CARD_PADDING_H = 24;
const IMAGE_W = 220;
const IMAGE_H = 140;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: CARD_PADDING_H,
    paddingVertical: 24,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  img: {
    width: IMAGE_W,
    height: IMAGE_H,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    resizeMode: "cover",
  },

  info: {
    flex: 1,
    paddingHorizontal: 24,
  },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  dim: { fontSize: 16, color: "#666", marginBottom: 2 },

  btn: {
    width: 180,
    height: 52,
    marginRight: 24,
    alignSelf: "center",
  },
});
