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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getFriends, searchUsers, sendFriendRequest, pokeFriend, type FriendListItem } from "../api/friends";

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pokedIds, setPokedIds] = useState<Set<string>>(new Set());

  const loadFriends = useCallback(async () => {
    try {
      const data = await getFriends();
      setFriends(data);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search / Add Friend */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="친구 검색 또는 추가..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleAddFriend}
            returnKeyType="send"
          />
          {searchText.trim() ? (
            <TouchableOpacity onPress={handleAddFriend}>
              <Ionicons name="person-add" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.grayBorder} />
            <Text style={styles.emptyTitle}>아직 친구가 없어요</Text>
            <Text style={styles.emptySubtitle}>위 검색창에서 친구를 추가해보세요.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>친구 {friends.length}명</Text>
            {friends.map((item) => {
              const isPoked = pokedIds.has(item.friend.id);
              return (
                <View key={item.friendship_id} style={styles.friendCard}>
                  <Image
                    source={{
                      uri: item.friend.profile_image_url ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>
                      {item.friend.nickname ?? "친구"}
                    </Text>
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
                    <Text
                      style={[
                        styles.pokeBtnText,
                        isPoked && styles.pokeBtnTextDisabled,
                      ]}
                    >
                      {isPoked ? "찌름!" : "찌르기"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.black,
  },

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
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
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
  pokeBtnDisabled: {
    backgroundColor: colors.grayLight,
  },
  pokeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  pokeBtnTextDisabled: {
    color: colors.gray,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.gray,
    textAlign: "center",
  },
});
