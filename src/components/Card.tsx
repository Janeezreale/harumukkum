import { View, StyleSheet, ViewProps } from "react-native";
import { colors } from "@/src/constants/colors";

export default function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
  },
});
