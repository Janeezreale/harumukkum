import { Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/src/constants/colors";

type Props = {
  label: string;
  onPress?: () => void;
};

export default function KeywordChip({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.text}>#{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  text: {
    color: colors.gray700,
    fontWeight: "600",
  },
});
