import { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import {
  getFriends,
  getReceivedFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
  pokeFriend,
  type FriendListItem,
  type FriendRequest,
} from "../api/friends";

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pokedIds, setPokedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getReceivedFriendRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  async function handleAccept(requestId: string) {
    try {
      await acceptFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      loadData(); // refresh friends list
      Alert.alert("수락 완료", "친구가 되었어요!");
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "수락에 실패했어요.");
    }
  }

  async function handleReject(requestId: string) {
    try {
      await rejectFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "거절에 실패했어요.");
    }
  }

  async function handlePoke(friendUserId: string) {
    try {
      await pokeFriend(friendUserId);
      setPokedIds((prev) => new Set(prev).add(friendUserId));
      Alert.alert("찌르기 완료!", "친구를 찔렀어요.");
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "찌르기에 실패했어요.");
    }
  }

  async function handleAddFriend() {
    const query = searchText.trim();
    if (!query) return;

    try {
      const users = await searchUsers(query);
      if (users.length === 0) {
        Alert.alert("검색 결과 없음", "해당 사용자를 찾을 수 없어요.");
        return;
      }
      await sendFriendRequest(users[0].id);
      Alert.alert("친구 요청 완료", `${users[0].nickname ?? query}에게 요청을 보냈어요.`);
      setSearchText("");
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "친구 추가에 실패했어요.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>우리들의 방</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Search / Add Friend */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="아이디로 친구 검색..."
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleAddFriend}
              returnKeyType="send"
              autoCapitalize="none"
            />
            {searchText.trim() ? (
              <TouchableOpacity onPress={handleAddFriend}>
                <Ionicons name="person-add" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Friend Requests */}
          {requests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                받은 친구 요청 ({requests.length})
              </Text>
              {requests.map((req) => (
                <View key={req.id} style={styles.friendCard}>
                  <Image
                    source={{
                      uri: req.requester.profile_image_url || "https://via.placeholder.com/100",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{req.requester.nickname}</Text>
                    <Text style={styles.friendSub}>@{req.requester.username}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(req.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(req.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={16} color={colors.gray} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Friends List */}
          {friends.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>친구 {friends.length}명</Text>
              {friends.map((item) => {
                const isPoked = pokedIds.has(item.friend.id);
                return (
                  <View key={item.friendship_id} style={styles.friendCard}>
                    <Image
                      source={{
                        uri: item.friend.profile_image_url || "https://via.placeholder.com/100",
                      }}
                      style={styles.avatar}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.friend.nickname ?? "친구"}</Text>
                      <Text style={styles.friendSub}>@{item.friend.username}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.pokeBtn, isPoked && styles.pokeBtnDisabled]}
                      onPress={() => handlePoke(item.friend.id)}
                      disabled={isPoked}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="hand-left"
                        size={14}
                        color={isPoked ? colors.gray : colors.white}
                      />
                      <Text style={[styles.pokeBtnText, isPoked && styles.pokeBtnTextDisabled]}>
                        {isPoked ? "찌름!" : "찌르기"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          ) : requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.grayBorder} />
              <Text style={styles.emptyTitle}>아직 친구가 없어요</Text>
              <Text style={styles.emptySubtitle}>
                위 검색창에서 아이디로 친구를 추가해보세요.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.black },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.grayBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    paddingVertical: 0,
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
    marginTop: 8,
  },

  // Friend card
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.grayLight,
  },
  friendInfo: { flex: 1, gap: 1 },
  friendName: { fontSize: 15, fontWeight: "600", color: colors.black },
  friendSub: { fontSize: 12, color: colors.gray },

  // Request actions
  requestActions: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },

  // Poke button
  pokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pokeBtnDisabled: { backgroundColor: colors.grayLight },
  pokeBtnText: { fontSize: 13, fontWeight: "600", color: colors.white },
  pokeBtnTextDisabled: { color: colors.gray },

  // Empty
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.black, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: colors.gray, textAlign: "center" },
});
