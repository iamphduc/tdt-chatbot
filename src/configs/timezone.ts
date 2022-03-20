import timezone from "moment-timezone";

const today = timezone().tz("Asia/Ho_Chi_Minh");

export default {
  TODAY: today.format("DD/MM"),
  TOMORROW: today.add(1, "day").format("DD/MM"),
};
