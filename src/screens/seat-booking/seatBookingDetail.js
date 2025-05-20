import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Calendar as BigCalendar } from "react-native-big-calendar";
import GeneralButton from "../../components/button/generalButton";
import useAvailableSlots from "../../hooks/booking/useAvailableSlots";
import useBookSeat from "../../hooks/booking/useBookSeat";
import useRoomDetailById from "../../hooks/room/useRoomDetailById";
// import useBranchStore from "../../../store/branchStore";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

const MIN_DURATION = 30; // Đặt tối thiểu 30 phút
const OPENING_HOUR = 6;
const CLOSING_HOUR = 22;

export default SeatBookingDetail = function ({ route, navigation }) {
  const { roomId } = route.params;
  // Load room details for capacity and price
  const { data: roomDetail } = useRoomDetailById(roomId);
  // const { branchId } = useBranchStore();

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  const formattedDate = currentDate.toLocaleDateString("en-CA"); //TODO Chuyển đổi ngày thành format "YYYY-MM-DD"

  //* Gọi API lấy danh sách slot trống
  const { data: availableSlots } = useAvailableSlots({
    roomId: Number(roomId), // Đảm bảo roomId là số nguyên
    date: formattedDate,
  });
  console.log("📅 Date sent to API:", formattedDate, "roomId:", roomId);

  const bookSeatMutation = useBookSeat();

  const events = (availableSlots?.availableSlots || []).map((slot) => {
    const start = new Date(`${formattedDate}T${slot.startTime}`);
    const end = new Date(`${formattedDate}T${slot.endTime}`);
    return {
      id: slot.id ?? Math.random().toString(),
      title: slot.status === "Valid" ? "Khả dụng" : "Đã đặt",
      start,
      end,
    };
  });

  //* Làm tròn thời gian về bội số 30 phút
  const adjustToNearest30Minutes = (time, roundUp = false) => {
    const newTime = new Date(time);
    const minutes = newTime.getMinutes();
    const adjustedMinutes = roundUp
      ? Math.ceil(minutes / MIN_DURATION) * MIN_DURATION
      : minutes;
    newTime.setMinutes(adjustedMinutes);
    newTime.setSeconds(0);
    return newTime;
  };

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const handleDateSelect = (day) => {
    // Cập nhật ngày người dùng chọn từ lịch
    setCurrentDate(new Date(day.dateString));
  };

  const adjustToNearestInterval = (time, interval) => {
    const newTime = new Date(time);
    const minutes = newTime.getMinutes();
    const adjustedMinutes = Math.floor(minutes / interval) * interval;
    newTime.setMinutes(adjustedMinutes);
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    return newTime;
  };

  //* Xử lý chọn giờ
  const handleConfirmTime = (time) => {
    // Lấy ngày người dùng chọn từ lịch, không phải ngày hiện tại
    const selectedDate = currentDate; // Đây là ngày người dùng chọn từ lịch

    // Kiểm tra nếu thời gian bắt đầu không nằm trong khoảng 6:00 AM và 10:00 PM
    if (time.getHours() < OPENING_HOUR || time.getHours() >= CLOSING_HOUR) {
      setPickerVisible(false);
      Alert.alert(
        "Lỗi",
        "Giờ bắt đầu phải nằm trong khung từ 06:00 đến 22:00."
      );
      return;
    }

    // Kết hợp ngày người dùng chọn với giờ đã chọn
    const adjustedStartTime = new Date(selectedDate);
    adjustedStartTime.setHours(time.getHours()); // Set giờ người dùng chọn
    adjustedStartTime.setMinutes(time.getMinutes()); // Set phút người dùng chọn
    adjustedStartTime.setSeconds(0); // Làm tròn giây về 0
    adjustedStartTime.setMilliseconds(0); // Làm tròn nano giây về 0

    if (isSelectingStart) {
      setStartTime(adjustedStartTime);
      setEndTime(null); // Reset endTime
    } else {
      if (!startTime) {
        setPickerVisible(false);
        Alert.alert("Lỗi", "Vui lòng chọn giờ bắt đầu trước.");
        return;
      }

      // Kiểm tra thời gian kết thúc không được nhỏ hơn thời gian bắt đầu và phải là bội số 30 phút
      const minEndTime = new Date(startTime);
      minEndTime.setMinutes(minEndTime.getMinutes() + MIN_DURATION); // Phải cách startTime ít nhất 30 phút

      if (adjustedStartTime < minEndTime) {
        setPickerVisible(false);
        Alert.alert(
          "Lỗi",
          `Thời gian kết thúc phải cách thời gian bắt đầu ít nhất ${MIN_DURATION} phút.`
        );
        return;
      }

      // Làm tròn thời gian kết thúc theo bội số 30 phút
      const adjustedEndTime = adjustToNext30Minutes(adjustedStartTime);
      setEndTime(adjustedEndTime);
    }

    setPickerVisible(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  // const confirmBooking = () => {
  //   if (!startTime || !endTime) {
  //     Alert.alert(
  //       "Lỗi",
  //       "Vui lòng chọn đầy đủ ngày, giờ bắt đầu và giờ kết thúc."
  //     );
  //     return;
  //   }

  //   const newEvent = {
  //     id: eventList.length + 1,
  //     description: "Lịch của bạn",
  //     startDate: startTime,
  //     endDate: endTime,
  //     color: "#4CAF50",
  //     userId: currentUserId,
  //   };

  //   Alert.alert(
  //     "Xác nhận đặt chỗ",
  //     `Bạn có muốn đặt chỗ từ ${startTime.toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: false,
  //     })} đến ${endTime.toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: false,
  //     })} vào ngày ${currentDate.toDateString()} không?`,
  //     [
  //       {
  //         text: "Hủy",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Đồng ý",
  //         onPress: () => {
  //           setEventList((prevEvents) => [...prevEvents, newEvent]);
  //           setStartTime(null);
  //           setEndTime(null);
  //           Alert.alert("Đặt chỗ thành công!");
  //         },
  //       },
  //     ]
  //   );
  // };

  const formatTimeToHHMMSS = (date) => {
    return date.toTimeString().split(" ")[0]; // Lấy "HH:mm:ss"
  };

  const adjustToNext30Minutes = (time) => {
    const newTime = new Date(time);
    const minutes = newTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / MIN_DURATION) * MIN_DURATION; // Làm tròn lên theo bội số 30 phút
    newTime.setMinutes(roundedMinutes);
    newTime.setSeconds(0); // Làm tròn giây về 0
    newTime.setMilliseconds(0); // Làm tròn nano về 0
    return newTime;
  };

  //* Kiểm tra slot trống trước khi đặt
  const checkAvailability = () => {
    if (!startTime || !endTime) {
      Alert.alert("Lỗi", "Vui lòng chọn thời gian.");
      return;
    }

    // Chuyển startTime và endTime của người dùng thành timestamp (mili giây)
    const selectedStart = startTime.getTime(); // timestamp của startTime người dùng chọn
    const selectedEnd = endTime.getTime(); // timestamp của endTime người dùng chọn

    console.log("🔍 Kiểm tra slot với:", { selectedStart, selectedEnd });

    const bookingDate = availableSlots?.bookingDate;

    const isSlotAvailable = availableSlots?.availableSlots?.some((slot) => {
      // Tách giờ, phút, giây từ chuỗi startTime và endTime
      const [startHour, startMinute, startSecond] = slot.startTime.split(":");
      const [endHour, endMinute, endSecond] = slot.endTime.split(":");

      // Kết hợp ngày từ bookingDate và giờ từ startTime, endTime để tạo chuỗi ngày giờ đầy đủ cho slotStart và slotEnd
      const slotStartStr = `${bookingDate}T${String(startHour).padStart(
        2,
        "0"
      )}:${String(startMinute).padStart(2, "0")}:${String(startSecond).padStart(
        2,
        "0"
      )}`;
      const slotEndStr = `${bookingDate}T${String(endHour).padStart(
        2,
        "0"
      )}:${String(endMinute).padStart(2, "0")}:${String(endSecond).padStart(
        2,
        "0"
      )}`;

      // Tạo Date object từ chuỗi slotStartStr và slotEndStr để chuyển thành timestamp (mili giây)
      const slotStart = new Date(slotStartStr).getTime();
      const slotEnd = new Date(slotEndStr).getTime();

      console.log("startTime:", slot.startTime, "endTime:", slot.endTime);
      console.log(
        "Start Hour:",
        startHour,
        "Start Minute:",
        startMinute,
        "Start Second:",
        startSecond
      );

      console.log(
        "Slot Start String:",
        slotStartStr,
        "Slot End String:",
        slotEndStr
      );
      console.log("Slot Start:", slotStart, "Slot End:", slotEnd);

      console.log(
        "Slot Start String:",
        slotStartStr,
        "Slot End String:",
        slotEndStr
      );
      console.log("Slot Start:", slotStart, "Slot End:", slotEnd);

      // Kiểm tra nếu thời gian đã chọn nằm trong khoảng thời gian có sẵn
      return (
        slot.status === "Valid" &&
        selectedStart >= slotStart &&
        selectedEnd <= slotEnd
      );
    });

    console.log("🎯 Available Slots:", availableSlots);

    if (!isSlotAvailable) {
      Alert.alert(
        "Lỗi",
        "Thời gian này đã có người đặt hoặc không hợp lệ. Vui lòng chọn thời gian khác."
      );
      return;
    }

    confirmBooking(); // Nếu có slot hợp lệ, thực hiện đặt chỗ
  };

  //* Xác nhận đặt chỗ
  const confirmBooking = async () => {
    const accessToken = await SecureStore.getItemAsync("accessToken");

    if (!accessToken) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert("Lỗi", "Vui lòng chọn thời gian.");
      return;
    }

    // Chuyển startTime thành chuỗi "HH:mm"
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const startTimeFormatted = `${String(startHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}`;

    // Duration calculation: Convert milliseconds to minutes
    const durationInMinutes =
      (endTime.getTime() - startTime.getTime()) / 1000 / 60;

    const bookingData = {
      bookingDate: formattedDate, // YYYY-MM-DD
      startTime: startTimeFormatted, // Gửi startTime dưới dạng "HH:mm"
      duration: durationInMinutes,
      email: customerEmail || null,
    };

    console.log("Gửi yêu cầu đặt chỗ với:", bookingData, accessToken);

    bookSeatMutation.mutate(
      { roomId, bookingData },
      {
        onSuccess: (response) => {
          console.log("API Response booking id:", response.data.id);
          // Hiện alert và sau khi đóng sẽ reset lựa chọn
          Alert.alert(
            "Đặt chỗ thành công!",
            undefined,
            [
              {
                text: "OK",
                onPress: () => {
                  // Reset state về ban đầu
                  setStartTime(null);
                  setEndTime(null);
                  setShowCalendar(false);
                  setIsSelectingStart(true);
                  setPickerVisible(false);
                  // Reset date về hôm nay
                  setCurrentDate(new Date());
                },
              },
            ],
            { cancelable: false }
          );
        },
        onError: (error) => {
          if (error.response?.data?.message) {
            Alert.alert("Thông báo", error.response.data.message);
          } else {
            Alert.alert(
              "Lỗi",
              "Không thể thực hiện yêu cầu. Vui lòng thử lại."
            );
          }
        },
      }
    );
  };

  // const coloredEvents = eventList.map((event) => ({
  //   ...event,
  //   color: event.userId === currentUserId ? "#4CAF50" : "#D3D3D3",
  // }));

  const handleConfirmPress = () => {
    navigation.navigate("Xác nhận đặt chỗ");
  };

  const parseTime = (date, time) => {
    if (!date || !time) return null;
    const parsedDate = new Date(`${date}T${time}`);
    return isNaN(parsedDate) ? null : parsedDate;
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ Quay lại</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Toggle Lịch */}
        <TouchableOpacity style={styles.selectBox} onPress={toggleCalendar}>
          <Text style={styles.selectText}>
            {showCalendar ? "Ẩn lịch" : "Chọn ngày và giờ"}
          </Text>
          <Text style={styles.detailsText}>
            {`Ngày: ${currentDate.toDateString()}`}
          </Text>
          <Text style={styles.detailsText}>
            {`Giờ bắt đầu: ${
              startTime
                ? startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Chưa chọn"
            }`}
          </Text>
          <Text style={styles.detailsText}>
            {`Giờ kết thúc: ${
              endTime
                ? endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Chưa chọn"
            }`}
          </Text>
        </TouchableOpacity>

        {/* Hiển thị Lịch khi bật */}
        {showCalendar && (
          <>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [currentDate.toISOString().split("T")[0]]: {
                  selected: true,
                  marked: true,
                  selectedColor: "blue",
                },
              }}
              minDate={todayString}
            />
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => {
                  setIsSelectingStart(true);
                  setPickerVisible(true);
                }}
              >
                <Text style={styles.timePickerText}>Chọn giờ bắt đầu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => {
                  setIsSelectingStart(false);
                  setPickerVisible(true);
                }}
                disabled={!startTime}
              >
                <Text style={styles.timePickerText}>Chọn giờ kết thúc</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.emailInput}
              placeholder="Nhập email khách hàng (tùy chọn)"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <GeneralButton
              text="Kiểm tra & Đặt chỗ"
              onPress={checkAvailability}
            />
          </>
        )}

        {/* Hiển thị lịch các slot đã đặt trước */}
        <View style={styles.weekViewContainer}>
          <Text style={styles.subHeader}>Lịch đặt chỗ</Text>
          {/* <WeekView
            events={
              availableSlots?.availableSlots
                ?.map((slot) => {
                  const startDate = new Date(
                    `${formattedDate}T${slot.startTime}`
                  );
                  const endDate = new Date(`${formattedDate}T${slot.endTime}`);

                  return {
                    id: slot.id || Math.random().toString(),
                    description: slot.status === "Valid" ? "Khả dụng" : "Đã đặt",
                    startDate,
                    endDate,
                    color: slot.status === "Valid" ? "#4CAF50" : "#D32F2F", // Xanh lá cây nếu còn trống, đỏ nếu đã đặt
                  };
                })
                .filter(Boolean) || []
            }
            selectedDate={currentDate}
            numberOfDays={4}
            hoursInDisplay={14}
            timeStep={30}
            formatDateHeader="ddd"
            startHour={8}
            endHour={22}
            onEventPress={(event) =>
              Alert.alert(
                "Thông báo",
                event.description === "Khả dụng"
                  ? "Khung giờ này còn trống."
                  : "Khung giờ này đã được đặt."
              )
            }
          /> */}

          <BigCalendar
            events={events}
            height={400}
            date={currentDate}
            mode="week"
            swipeEnabled={false}
            onPressEvent={(event) =>
              Alert.alert(
                "Thông báo",
                event.title === "Khả dụng"
                  ? "Khung giờ này còn trống."
                  : "Khung giờ này đã được đặt."
              )
            }
          />
        </View>

        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="time"
          minuteInterval={15}
          onConfirm={handleConfirmTime}
          onCancel={() => setPickerVisible(false)}
        />
      </ScrollView>
      {/* Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.footerContent}>
          <View style={styles.footerInfo}>
            <Text style={styles.capacityText}>Số lượng tối đa:</Text>
            <Text style={styles.capacityText}>{roomDetail?.capacity}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.priceText}>Giá:</Text>
            <Text style={styles.priceText}>{roomDetail?.price} đ/giờ</Text>
          </View>
        </View>
        <GeneralButton
          text="Kiểm tra thông tin và xác nhận"
          style={styles.footerButton}
          onPress={handleConfirmPress}
        />
        <Text style={styles.noteText}>
          Phí đặt chỗ ngồi sẽ được hoàn trả 100% nếu hủy đặt chỗ trước 24 giờ.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 180,
  },
  selectBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  selectText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsText: {
    fontSize: 16,
    marginTop: 8,
    color: "#333333",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  timePickerButton: {
    backgroundColor: "#93540A",
    padding: 12,
    borderRadius: 8,
  },
  timePickerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  weekViewContainer: {
    height: 400,
    marginTop: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: "#93540A",
    fontSize: 18,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerContent: {
    flexDirection: "row",
  },
  footerInfo: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  footerButton: {
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#A8A8A8",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emailInput: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
});
