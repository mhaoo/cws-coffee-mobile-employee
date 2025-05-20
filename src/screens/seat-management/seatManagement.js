import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/authContext";
import useRoomsWithStatus from "../../hooks/room/useRoomsWithStatus";
import { toCurrency } from "../../utils/currency";

export default function SeatsManagementScreen() {
  const navigation = useNavigation();
  const { branchId } = useAuth();
  const { data: rooms = [], isLoading, error } = useRoomsWithStatus(branchId);

  const renderRoom = ({ item }) => {
    const bgColor = item.status === "EMPTY" ? "#E8F5E9" : "#FFEBEE";
    const borderColor = item.status === "EMPTY" ? "#66BB6A" : "#EF5350";
    return (
      <TouchableOpacity
        style={[styles.roomItem, { backgroundColor: bgColor, borderColor }]}
        onPress={() => navigation.navigate("SeatDetail", { room: item })}
      >
        <Image source={{ uri: item.images?.[0] }} style={styles.roomImg} />
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomDesc}>{item.description}</Text>
        <Text>Loại: {item.roomType}</Text>
        <Text>Sức chứa: {item.capacity}</Text>
        <Text>Vị trí: {item.location}</Text>
        <Text>Hoạt động: {item.active ? "Có" : "Không"}</Text>
        <Text style={[styles.roomStatus, { color: borderColor }]}>
          Trạng thái: {item.status}
        </Text>
        <Text>Giá: {toCurrency(item.price)} VNĐ/giờ</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.loading}>
        <Text>Lỗi: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phòng</Text>
      <FlatList
        key={2}
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  listContainer: { paddingBottom: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  roomItem: {
    flexBasis: "49%",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  roomImg: { width: "100%", height: 150, borderRadius: 6, marginBottom: 8 },
  roomName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  roomDesc: { fontSize: 14, color: "#555", marginBottom: 4 },
  roomStatus: { fontSize: 14, fontWeight: "600", marginVertical: 4 },
  row: { justifyContent: "space-between" },
});
