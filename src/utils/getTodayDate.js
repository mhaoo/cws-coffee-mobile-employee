export const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

//TODO Trả về chuỗi "Thứ X, ngày D tháng M năm YYYY" của ngày truyền vào (mặc định là hôm nay)
export function formatFullDate(date = new Date()) {
  // Compute Vietnam date based on UTC+7 regardless of device timezone
  const epoch = date.getTime();
  const vnEpoch = epoch + 7 * 60 * 60 * 1000; // add 7 hours
  const vnDate = new Date(vnEpoch);
  const wd = WEEKDAYS[vnDate.getUTCDay()];
  const day = vnDate.getUTCDate();
  const month = vnDate.getUTCMonth() + 1;
  const year = vnDate.getUTCFullYear();
  return `${wd}, ngày ${day} tháng ${month} năm ${year}`;
}
