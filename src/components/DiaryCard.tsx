import { Text, View, StyleSheet, Pressable } from "react-native";
import { Diary } from "@/src/types/diary";
import Card from "./Card";
import MoodBadge from "./MoodBadge";
import { colors } from "@/src/constants/colors";

type Props = {
  diary: Diary;
  onPress?: () => void;
};

export default function DiaryCard({ diary, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.date}>{diary.date}</Text>
          <MoodBadge mood={diary.mood} />
        </View>

        <Text style={styles.title}>{diary.title}</Text>
        <Text numberOfLines={2} style={styles.content}>
          {diary.content}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    color: colors.gray500,
    fontSize: 13,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: "800",
  },
  content: {
    color: colors.gray700,
    lineHeight: 20,
  },
});
