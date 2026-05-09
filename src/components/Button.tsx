import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/src/constants/colors";

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function Button({ title, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
