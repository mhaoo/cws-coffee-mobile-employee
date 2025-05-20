import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { toCurrency } from "../../utils/currency";

const badgeColor = {
  PENDING: "#f0ad4e",
  PAID: "#5cb85c",
  DOING: "#0275d8",
  DONE: "#999",
};

export default function BookingCard({
  order,
  onPress,
  extraActions = [], // [{ title, onPress }]
}) {
  const imgs = [
    order.room,
    ...(order.products || []),
    ...(order.devices || []),
  ];
  const total =
    order.room.price +
    (order.products || []).reduce((s, p) => s + p.price * p.qty, 0) +
    (order.devices || []).reduce((s, d) => s + d.price * d.qty, 0);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[styles.badge, { backgroundColor: badgeColor[order.status] }]}
      />

      <View style={styles.cardHeader}>
        <Text style={styles.title}>{order.room.name}</Text>
        <Text style={styles.date}>{order.date}</Text>
      </View>
      <Text style={styles.code}>{order.code}</Text>
      <Text style={styles.small}>
        Email: {order.account?.email || order.customerEmail || "-"}
      </Text>
      <Text style={styles.small}>
        Người đặt chỗ: {order.account?.lastName} {order.account?.firstName}
      </Text>
      <Text style={styles.small}>Ngày đặt chỗ: {order.bookingDate || "-"}</Text>
      <Text style={styles.small}>
        Thời gian:{" "}
        {order.startTime && order.endTime
          ? `${order.startTime} - ${order.endTime}`
          : order.room?.time || ""}
      </Text>
      <Text style={styles.small}>Tên phòng: {order.room?.name || "-"}</Text>
      <Text style={styles.small}>Vị trí: {order.room?.location || "-"}</Text>

      <FlatList
        horizontal
        data={imgs}
        keyExtractor={(it, i) => it.id ?? `img${i}`}
        renderItem={({ item }) => (
          <View style={styles.thumbWrap}>
            <Image source={{ uri: item.img }} style={styles.thumb} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 8 }}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>{toCurrency(total)} VNĐ</Text>
        {order.status !== "DONE" && <Text style={styles.arrow}>›</Text>}
      </View>

      {extraActions.length > 0 && (
        <View style={styles.actions}>
          {extraActions.map((act) => (
            <TouchableOpacity
              key={act.title}
              style={[styles.actionBtn, act.style]}
              onPress={act.onPress}
            >
              <Text style={[styles.actionTxt, act.textStyle]}>
                {act.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 22,
    padding: 14,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 6,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  date: { fontSize: 16, color: "#666" },
  code: { fontSize: 16, color: "#999", marginTop: 2 },
  small: { fontSize: 16, color: "#666", marginTop: 2 },
  thumbWrap: { marginRight: 8 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  total: { fontSize: 15, fontWeight: "700", color: "#333" },
  arrow: { fontSize: 26, lineHeight: 26, color: "#ccc" },
  actions: { flexDirection: "row", marginTop: 8, flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: "#93540A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 4,
  },
  actionTxt: { color: "#fff", fontSize: 13 },
});
