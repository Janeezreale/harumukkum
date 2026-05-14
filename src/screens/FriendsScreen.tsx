import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { emotions } from "../constants/emotions";
import {
  getFriends,
  getFriendDiaries,
  getTodayPokedFriendIds,
  pokeFriend,
  type FriendListItem,
  type FriendDiaryItem,
} from "../api/friends";
import { formatDiaryDateShort } from "../utils/date";

function getEmoji(emotionId: string | null): string {
  if (!emotionId) return "";
  return emotions.find((e) => e.id === emotionId)?.emoji ?? "";
}

function FriendChip({
  item,
  isPoked,
  onPoke,
}: {
  item: FriendListItem;
  isPoked: boolean;
  onPoke: () => void;
}) {
  return (
    <View style={styles.friendChip}>
      <Image
        source={{ uri: item.friend.profile_image_url || "https://via.placeholder.com/100" }}
        style={styles.chipAvatar}
      />
      <Text style={styles.chipName} numberOfLines={1}>
        {item.friend.nickname ?? item.friend.username}
      </Text>
      <TouchableOpacity
        style={[styles.pokeBtn, isPoked && styles.pokeBtnDone]}
        onPress={onPoke}
        disabled={isPoked}
        activeOpacity={0.7}
      >
        <Text style={[styles.pokeBtnText, isPoked && styles.pokeBtnTextDone]}>
          {isPoked ? "찌름!" : "찌르기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DiaryCard({ item }: { item: FriendDiaryItem }) {
  const emoji = getEmoji(item.emotion);

  return (
    <View style={styles.card}>
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.cardThumbnail} />
      ) : null}
      <View style={styles.cardBody}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: item.author?.profile_image_url || "https://via.placeholder.com/100" }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>{item.author?.nickname ?? "친구"}</Text>
          <Text style={styles.cardDate}>{formatDiaryDateShort(item.diary_date)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {emoji ? `${emoji} ` : ""}{item.title ?? "오늘의 일기"}
        </Text>
        {item.content ? (
          <Text style={styles.cardContent} numberOfLines={3}>
            {item.content}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [diaries, setDiaries] = useState<FriendDiaryItem[]>([]);
  const [pokedIds, setPokedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [friendsData, diariesData, pokedIds] = await Promise.all([
        getFriends(),
        getFriendDiaries(),
        getTodayPokedFriendIds(),
      ]);
      setFriends(friendsData);
      setDiaries(diariesData);
      setPokedIds(new Set(pokedIds));
    } catch {
      setError("데이터를 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 22 }} />
          <Text style={styles.headerTitle}>친구들의 하루</Text>
          <TouchableOpacity hitSlop={8} onPress={() => router.push("/friends/manage" as any)}>
            <Ionicons name="person-add-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 22 }} />
          <Text style={styles.headerTitle}>친구들의 하루</Text>
          <TouchableOpacity hitSlop={8} onPress={() => router.push("/friends/manage" as any)}>
            <Ionicons name="person-add-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasFriends = friends.length > 0;
  const hasDiaries = diaries.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>친구들의 하루</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push("/friends/manage" as any)}>
          <Ionicons name="people-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, !hasDiaries && styles.scrollContentEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* 친구 프로필 스트립 */}
        {hasFriends && (
          <View style={styles.friendsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsScroll}
            >
              {friends.map((item) => (
                <FriendChip
                  key={item.friendship_id}
                  item={item}
                  isPoked={pokedIds.has(item.friend.id)}
                  onPoke={() => handlePoke(item.friend.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 일기 피드 */}
        {hasDiaries ? (
          <>
            <Text style={styles.feedLabel}>최근 일기</Text>
            {diaries.map((item) => (
              <DiaryCard key={item.id} item={item} />
            ))}
          </>
        ) : (
          <View style={[styles.emptyState, hasFriends && styles.emptyStateFeed]}>
            <Ionicons name="book-outline" size={56} color={colors.grayBorder} />
            <Text style={styles.emptyTitle}>
              {hasFriends ? "친구들의 일기가 없어요" : "아직 친구가 없어요"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {hasFriends
                ? "친구가 일기를 올리면 여기에 나타나요."
                : "친구를 추가하면 일기를 볼 수 있어요."}
            </Text>
            {!hasFriends && (
              <TouchableOpacity
                style={styles.addFriendBtn}
                onPress={() => router.push("/friends/manage" as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={16} color={colors.white} />
                <Text style={styles.addFriendBtnText}>친구 추가하기</Text>
              </TouchableOpacity>
            )}
          </View>
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { fontSize: 14, color: colors.gray },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 20 },
  retryText: { fontSize: 14, color: colors.white, fontWeight: "600" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, gap: 16 },
  scrollContentEmpty: { flex: 1 },

  // 친구 스트립
  friendsSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  friendsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  friendChip: {
    alignItems: "center",
    gap: 6,
    width: 72,
  },
  chipAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.grayLight,
    borderWidth: 2,
    borderColor: colors.primaryPale,
  },
  chipName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.black,
    textAlign: "center",
  },
  pokeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pokeBtnDone: { backgroundColor: colors.grayLight },
  pokeBtnText: { fontSize: 11, fontWeight: "700", color: colors.white },
  pokeBtnTextDone: { color: colors.gray },

  feedLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
    paddingHorizontal: 20,
  },

  // 일기 카드
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardThumbnail: { width: "100%", height: 160, backgroundColor: colors.grayLight },
  cardBody: { padding: 16, gap: 8 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  authorAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.grayLight },
  authorName: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.black },
  cardDate: { fontSize: 12, color: colors.gray },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.black },
  cardContent: { fontSize: 13, lineHeight: 20, color: colors.gray },

  // 빈 상태
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyStateFeed: {
    flex: 0,
    paddingVertical: 48,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.black, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: colors.gray, textAlign: "center", lineHeight: 20 },
  addFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  addFriendBtnText: { fontSize: 14, fontWeight: "600", color: colors.white },
});
