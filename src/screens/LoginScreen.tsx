// import { View, Text } from "react-native";

// export default function LoginScreen() {
//   return (
//     <View>
//       <Text>Login</Text>
//     </View>
//   );
// }
import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <Text style={styles.subtitle}>하루묶음을 시작해보세요.</Text>

      <Link href="/(tabs)" style={styles.link}>
        로그인하고 메인으로 가기
      </Link>

      <Link href="/" style={styles.backLink}>
        시작 화면으로 돌아가기
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  link: {
    fontSize: 18,
    color: "#7C121C",
    fontWeight: "600",
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: "#666666",
  },
});