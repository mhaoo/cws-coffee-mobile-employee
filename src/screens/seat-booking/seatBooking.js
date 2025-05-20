// src/screens/seat-booking/seatBooking.js
import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import GeneralButton from "../../components/button/generalButton";
import useRoomsByBranch from "../../hooks/room/useRoomsByBranch";
import useBranchDetailById from "../../hooks/branch/useBranchesDetailById";
import { useToday } from "../../hooks/utils/useTodayDate";
import DropDownPicker from "react-native-dropdown-picker";
import useRoomTypes from "../../hooks/room/useRoomTypes";
import useRoomsByBranchIdAndRoomTypeId from "../../hooks/room/useRoomsByBranchIdAndRoomTypeId";

const { width } = Dimensions.get("window"); // tablet ~ 800‑1000 px
/* ────────────── CONSTANTS ────────────── */
const { width: WIN_W } = Dimensions.get("window");
const SIDEBAR_W = 160;
const SIDE_PAD = 32;
const GAP = 20;
const NUM_COL = 5;
const GRID_W = WIN_W - SIDEBAR_W;

export default function SeatBooking() {
  const navigation = useNavigation();
  const today = useToday();
  const {
    data: roomsAll,
    isLoading: roomsAllLoading,
    error: roomsAllError,
  } = useRoomsByBranch();
  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranchDetailById();
  const {
    data: roomTypes,
    isLoading: roomTypesLoading,
    error: roomTypesError,
  } = useRoomTypes();
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [openType, setOpenType] = useState(false);
  const {
    data: roomsByType,
    isLoading: roomsByTypeLoading,
    error: roomsByTypeError,
  } = useRoomsByBranchIdAndRoomTypeId(selectedRoomType);

  // Determine which rooms to display
  const roomsToShow = selectedRoomType ? roomsByType : roomsAll;

  // Combined loading and error states
  const isLoading =
    branchesLoading ||
    roomTypesLoading ||
    (selectedRoomType ? roomsByTypeLoading : roomsAllLoading);
  const error =
    branchesError ||
    roomTypesError ||
    (selectedRoomType ? roomsByTypeError : roomsAllError);

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

  /* render 1 card phòng */
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
        <Text style={styles.dim}>Giá: {item.price} VNĐ</Text>
      </View>

      {/* Nút đặt chỗ */}
      <GeneralButton
        text="Đặt chỗ"
        style={styles.btn}
        onPress={() =>
          navigation.navigate("SeatBookingDetail", { roomId: item.id })
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.branchText}>{branches.name}</Text>

        {/* Dropdown chọn loại phòng */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Chọn loại phòng:</Text>
          <DropDownPicker
            open={openType}
            value={selectedRoomType}
            items={roomTypes?.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
            setOpen={setOpenType}
            setValue={setSelectedRoomType}
            placeholder="Chọn loại phòng"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownListContainer}
          />
        </View>
      </View>

      <FlatList
        data={roomsToShow}
        renderItem={renderItem}
        keyExtractor={(it) => it.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* HEADER */
  header: {
    flexDirection: "column",
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14,
  },
  date: {
    fontSize: 16,
    color: "#A8A8A8",
  },
  branchText: {
    fontSize: 20,
    color: "#000",
    marginVertical: 10,
  },
  dropdownContainer: {
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  dropDownListContainer: {
    borderColor: "#93540A",
    borderWidth: 2,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  dropdown: {
    borderColor: "#93540A",
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 50,
    paddingHorizontal: 10,
  },

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
