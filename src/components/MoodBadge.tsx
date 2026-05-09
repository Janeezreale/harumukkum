import { Text, View, StyleSheet } from "react-native";
import { MoodType } from "@/src/types/diary";
import { colors } from "@/src/constants/colors";

const moodLabel: Record<MoodType, string> = {
  happy: "기쁨",
  sad: "슬픔",
  calm: "평온",
  angry: "화남",
  tired: "피곤",
  neutral: "보통",
};

export default function MoodBadge({ mood }: { mood: MoodType }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{moodLabel[mood]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: "700",
  },
});
