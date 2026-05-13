import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

// Mock Data for demonstration
const mockUser = {
  id: "user123",
  email: "user@example.com",
};

const mockFriendRequests = [
  {
    id: "req1",
    senderName: "김철수",
  },
  {
    id: "req2",
    senderName: "이영희",
  },
];

const mockFriends = [
  {
    id: "friend1",
    name: "박지민",
  },
  {
    id: "friend2",
    name: "최현우",
  },
  {
    id: "friend3",
    name: "정수정",
  },
];

export default function MyPageScreen() {
  const router = useRouter();

  const handleAcceptRequest = (requestId: string) => {
    console.log(`친구 요청 수락: ${requestId}`);
    // 실제 API 연동 로직 추가 예정
  };

  const handleRejectRequest = (requestId: string) => {
    console.log(`친구 요청 거절: ${requestId}`);
    // 실제 API 연동 로직 추가 예정
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사용자 정보</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>유저 아이디: {mockUser.id}</Text>
          <Text style={styles.infoText}>유저 이메일: {mockUser.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>친구 추가 요청</Text>
        {mockFriendRequests.length > 0 ? (
          <FlatList
            data={mockFriendRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <Text style={styles.requestName}>{item.senderName}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(item.id)}
                  >
                    <Text style={styles.buttonText}>수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectRequest(item.id)}
                  >
                    <Text style={styles.buttonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>받은 친구 요청이 없습니다.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>유저 친구 목록</Text>
        {mockFriends.length > 0 ? (
          <FlatList
            data={mockFriends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <Text style={styles.friendName}>{item.name}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>등록된 친구가 없습니다.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginRight: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 5,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  requestName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.black,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: colors.grayLight,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.black,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    paddingVertical: 20,
  },
});
