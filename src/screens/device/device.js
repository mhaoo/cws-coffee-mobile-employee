import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToday } from "../../hooks/utils/useTodayDate";
import useCategories from "../../hooks/category/useCategories";
import useProductGroupsByCategoryId from "../../hooks/product/useProductGroupsByCategoryId";
import useProductsByGroupId from "../../hooks/product/useProductsByGroupId";

const { width: WIN_W } = Dimensions.get("window");
const SIDEBAR_W = 160;
const SIDE_PAD = 32;
const GAP = 20;
const NUM_COL = 5;
const GRID_W = WIN_W - SIDEBAR_W;
const CARD_W = Math.floor((GRID_W - SIDE_PAD * 2 - GAP * (NUM_COL - 1)) / NUM_COL) - 10;
const CARD_H = CARD_W + 40;

export default function DeviceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking, updateBooking } = route.params ?? {};
  const today = useToday();

  // 1) Load categories and find 'THIẾT BỊ'
  const { data: categoriesList = [], isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const deviceCat = categoriesList.find((c) => c.name?.toUpperCase() === "THIẾT BỊ");
  const deviceCatId = deviceCat?.id;

  // 2) State for selected group
  const [selectedGroup, setSelectedGroup] = useState("all");

  // 3) Fetch groups under device category
  const { data: groups = [], isLoading: isGroupsLoading } = useProductGroupsByCategoryId(deviceCatId);

  // reset selection when category changes
  useEffect(() => {
    setSelectedGroup("all");
  }, [deviceCatId]);

  // 4) Fetch products for selected group
  const groupParam = selectedGroup === "all" ? null : selectedGroup;
  const { data: products = [], isLoading: isProductsLoading } = useProductsByGroupId(groupParam);

  // Prepare display groups and hooks unconditionally
  const displayGroups = [{ id: "all", name: "Tất cả" }, ...groups];
  const displayTitle = useMemo(() => {
    if (selectedGroup === "all") return "Tất cả";
    const grp = groups.find((g) => g.id === selectedGroup);
    return grp?.name || "Tất cả";
  }, [selectedGroup, groups]);
  const renderGroupTab = useCallback(
    ({ item }) => {
      const active = item.id === selectedGroup;
      return (
        <TouchableOpacity
          style={[styles.categoryItem, active && styles.categoryItemActive]}
          onPress={() => setSelectedGroup(item.id)}
        >
          <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
            {item.name}
          </Text>
          {active && <View style={styles.categoryUnderline} />}
        </TouchableOpacity>
      );
    },
    [selectedGroup]
  );

  if (isCategoriesLoading || isGroupsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }
  if (categoriesError) {
    return (
      <View style={styles.loading}>
        <Text>Lỗi: {categoriesError.message}</Text>
      </View>
    );
  }

  const renderGroupCard = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { marginRight: (index + 1) % NUM_COL === 0 ? 0 : GAP }]}
      onPress={() => setSelectedGroup(item.id)}
    >
      <Image source={{ uri: item.images?.[0] }} style={styles.cardImg} />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProd = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { marginRight: (index + 1) % NUM_COL === 0 ? 0 : GAP }]}
      onPress={() => navigation.navigate("DeviceDetail", { device: item, booking, updateBooking })}
    >
      <Image source={{ uri: item.images?.[0] }} style={styles.cardImg} />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.title}>Thiết bị</Text>
      </View>

      {/* SECTION TITLE */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{displayTitle}</Text>
      </View>

      {/* GROUP TABS */}
      <FlatList
        data={displayGroups}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.categoryList}
        renderItem={renderGroupTab}
      />

      {/* GRID: groups or products */}
      {selectedGroup === "all" ? (
        <FlatList
          data={groups}
          numColumns={NUM_COL}
          columnWrapperStyle={{ justifyContent: "flex-start" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroupCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          getItemLayout={(_, i) => ({ length: CARD_H + GAP, offset: (CARD_H + GAP) * i, index: i })}
        />
      ) : isProductsLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#93540A" />
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={NUM_COL}
          columnWrapperStyle={{ justifyContent: "flex-start" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProd}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          getItemLayout={(_, i) => ({ length: CARD_H + GAP, offset: (CARD_H + GAP) * i, index: i })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14,
  },
  date: { fontSize: 16, color: "#A8A8A8" },
  title: { fontSize: 20, fontWeight: "700", marginLeft: 20 },
  sectionHeader: {
    paddingHorizontal: SIDE_PAD,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  categoryList: {
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 8,
  },
  categoryItem: {
    marginRight: 48,
    alignItems: "center",
  },
  categoryItemActive: {},
  categoryText: {
    fontSize: 18,
    color: "#A8A8A8",
  },
  categoryTextActive: {
    color: "#93540A",
    fontWeight: "600",
  },
  categoryUnderline: {
    width: "100%",
    height: 2,
    backgroundColor: "#93540A",
    marginTop: 4,
    borderRadius: 1,
  },
  grid: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD,
    paddingTop: 6,
    paddingBottom: 40,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    marginBottom: GAP,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImg: {
    width: CARD_W * 0.8,
    height: CARD_W * 0.8,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardName: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 4,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
