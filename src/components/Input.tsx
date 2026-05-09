import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors } from "@/src/constants/colors";

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.gray500}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.black,
  },
});
