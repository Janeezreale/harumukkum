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
  getSentFriendRequests,
  getTodayPokedFriendIds,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  searchUsers,
  sendFriendRequest,
  pokeFriend,
  type FriendListItem,
  type FriendRequest,
  type SentFriendRequest,
} from "../api/friends";

type SearchUser = {
  id: string;
  username: string;
  nickname: string;
  profile_image_url: string | null;
};

type UserStatus = "friend" | "sent" | "received" | "none";

export default function FriendManageScreen() {
  const router = useRouter();

  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pokedIds, setPokedIds] = useState<Set<string>>(new Set());

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const [friendsData, receivedData, sentData, pokedIds] = await Promise.all([
        getFriends(),
        getReceivedFriendRequests(),
        getSentFriendRequests(),
        getTodayPokedFriendIds(),
      ]);
      setFriends(friendsData);
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
      setPokedIds(new Set(pokedIds));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  function getUserStatus(userId: string): UserStatus {
    if (friends.some((f) => f.friend.id === userId)) return "friend";
    if (sentRequests.some((r) => r.receiver.id === userId)) return "sent";
    if (receivedRequests.some((r) => r.requester.id === userId)) return "received";
    return "none";
  }

  async function handleSearch() {
    const query = searchText.trim();
    if (!query) return;
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results as SearchUser[]);
      if (results.length === 0) {
        Alert.alert("검색 결과 없음", "해당 아이디의 사용자를 찾을 수 없어요.");
      }
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "검색에 실패했어요.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchTextChange(text: string) {
    setSearchText(text);
    if (!text.trim()) setSearchResults([]);
  }

  async function handleSendRequest(user: SearchUser) {
    setSendingIds((prev) => new Set(prev).add(user.id));
    try {
      await sendFriendRequest(user.id);
      // 실제 DB ID를 가져와서 취소 기능이 정상 동작하도록 함
      const updated = await getSentFriendRequests();
      setSentRequests(updated);
      Alert.alert("요청 완료", `${user.nickname ?? user.username}님에게 친구 요청을 보냈어요.`);
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "요청 전송에 실패했어요.");
    } finally {
      setSendingIds((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
    }
  }

  async function handleAccept(requestId: string) {
    try {
      await acceptFriendRequest(requestId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      loadData();
      Alert.alert("수락 완료", "친구가 되었어요!");
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "수락에 실패했어요.");
    }
  }

  async function handleReject(requestId: string) {
    try {
      await rejectFriendRequest(requestId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "거절에 실패했어요.");
    }
  }

  async function handleCancel(requestId: string) {
    try {
      await cancelFriendRequest(requestId);
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "취소에 실패했어요.");
    }
  }

  async function handlePoke(friendUserId: string) {
    try {
      await pokeFriend(friendUserId);
      setPokedIds((prev) => new Set(prev).add(friendUserId));
      Alert.alert("찌르기 완료!", "친구를 찔렀어요.");
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "찌르기에 실패했어요.");
    }
  }

  function renderSearchResultAction(user: SearchUser) {
    const status = getUserStatus(user.id);
    const isSending = sendingIds.has(user.id);

    if (status === "friend") {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>친구</Text>
        </View>
      );
    }

    if (status === "sent") {
      const sentReq = sentRequests.find((r) => r.receiver.id === user.id);
      return (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => sentReq && handleCancel(sentReq.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>요청 취소</Text>
        </TouchableOpacity>
      );
    }

    if (status === "received") {
      const req = receivedRequests.find((r) => r.requester.id === user.id);
      return (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => req && handleAccept(req.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={16} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => req && handleReject(req.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={colors.gray} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.addBtn, isSending && styles.addBtnDisabled]}
        onPress={() => handleSendRequest(user)}
        disabled={isSending}
        activeOpacity={0.7}
      >
        {isSending
          ? <ActivityIndicator size="small" color={colors.white} />
          : <Text style={styles.addBtnText}>친구 추가</Text>}
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>친구 관리</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구 관리</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* 검색 */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="아이디로 검색..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching
            ? <ActivityIndicator size="small" color={colors.primary} />
            : searchText.trim()
            ? (
              <TouchableOpacity onPress={handleSearch} hitSlop={8}>
                <Text style={styles.searchBtn}>검색</Text>
              </TouchableOpacity>
            ) : null}
        </View>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>검색 결과</Text>
            {searchResults.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <Image
                  source={{ uri: user.profile_image_url || "https://via.placeholder.com/100" }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.nickname ?? user.username}</Text>
                  <Text style={styles.userSub}>@{user.username}</Text>
                </View>
                {renderSearchResultAction(user)}
              </View>
            ))}
          </>
        )}

        {/* 받은 친구 요청 */}
        {receivedRequests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              받은 요청 <Text style={styles.sectionCount}>{receivedRequests.length}</Text>
            </Text>
            {receivedRequests.map((req) => (
              <View key={req.id} style={styles.userCard}>
                <Image
                  source={{ uri: req.requester.profile_image_url || "https://via.placeholder.com/100" }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{req.requester.nickname}</Text>
                  <Text style={styles.userSub}>@{req.requester.username}</Text>
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

        {/* 보낸 친구 요청 */}
        {sentRequests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              보낸 요청 <Text style={styles.sectionCount}>{sentRequests.length}</Text>
            </Text>
            {sentRequests.map((req) => (
              <View key={req.id} style={styles.userCard}>
                <Image
                  source={{ uri: req.receiver.profile_image_url || "https://via.placeholder.com/100" }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{req.receiver.nickname}</Text>
                  <Text style={styles.userSub}>@{req.receiver.username}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancel(req.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* 친구 목록 */}
        {friends.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              친구 <Text style={styles.sectionCount}>{friends.length}</Text>
            </Text>
            {friends.map((item) => {
              const isPoked = pokedIds.has(item.friend.id);
              return (
                <View key={item.friendship_id} style={styles.userCard}>
                  <Image
                    source={{ uri: item.friend.profile_image_url || "https://via.placeholder.com/100" }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.friend.nickname ?? "친구"}</Text>
                    <Text style={styles.userSub}>@{item.friend.username}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.pokeBtn, isPoked && styles.pokeBtnDone]}
                    onPress={() => handlePoke(item.friend.id)}
                    disabled={isPoked}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="hand-left" size={13} color={isPoked ? colors.gray : colors.white} />
                    <Text style={[styles.pokeBtnText, isPoked && styles.pokeBtnTextDone]}>
                      {isPoked ? "찌름!" : "찌르기"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        ) : (
          receivedRequests.length === 0 && sentRequests.length === 0 && searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color={colors.grayBorder} />
              <Text style={styles.emptyTitle}>아직 친구가 없어요</Text>
              <Text style={styles.emptySubtitle}>위 검색창에서 아이디로 친구를 추가해보세요.</Text>
            </View>
          )
        )}
      </ScrollView>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  // 검색
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
  searchInput: { flex: 1, fontSize: 14, color: colors.black, paddingVertical: 0 },
  searchBtn: { fontSize: 14, fontWeight: "700", color: colors.primary },

  // 섹션
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.black, marginTop: 4 },
  sectionCount: { color: colors.primary },

  // 유저 카드
  userCard: {
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.grayLight },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 14, fontWeight: "600", color: colors.black },
  userSub: { fontSize: 12, color: colors.gray },

  // 액션 버튼들
  requestActions: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  rejectBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.grayLight,
    justifyContent: "center", alignItems: "center",
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { fontSize: 13, fontWeight: "700", color: colors.white },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: colors.gray },
  statusBadge: {
    backgroundColor: colors.grayLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusBadgeText: { fontSize: 13, color: colors.gray, fontWeight: "600" },

  // 찌르기
  pokeBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
  },
  pokeBtnDone: { backgroundColor: colors.grayLight },
  pokeBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  pokeBtnTextDone: { color: colors.gray },

  // 빈 상태
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.black, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: colors.gray, textAlign: "center" },
});
