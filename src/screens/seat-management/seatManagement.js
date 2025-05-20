import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Sample seat data (replace with API data)
const seats = Array.from({ length: 20 }).map((_, i) => ({
  id: `seat${i + 1}`,
  label: `B${i + 1}`,
  status: i % 3 === 0 ? "occupied" : "available",
  capacity: 4,
}));

const { width } = Dimensions.get("window");
const NUM_COL = 4;
const ITEM_SIZE = (width - 40) / NUM_COL; // adjust margins

export default function SeatsManagementScreen() {
  const navigation = useNavigation();

  const renderSeat = ({ item }) => {
    const bgColor = item.status === "available" ? "#E8F5E9" : "#FFEBEE";
    const borderColor = item.status === "available" ? "#66BB6A" : "#EF5350";
    return (
      <TouchableOpacity
        style={[styles.seatItem, { backgroundColor: bgColor, borderColor }]}
        onPress={() => navigation.navigate("SeatDetail", { seat: item })}
      >
        <Text style={styles.seatLabel}>{item.label}</Text>
        <Text style={styles.seatStatus}>{item.status}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý tiện ích (Chỗ ngồi)</Text>
      <FlatList
        data={seats}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COL}
        renderItem={renderSeat}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  grid: { justifyContent: "center" },
  seatItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  seatLabel: { fontSize: 16, fontWeight: "600" },
  seatStatus: { fontSize: 12, color: "#555", marginTop: 4 },
});
