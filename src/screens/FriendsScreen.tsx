import { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

type Friend = {
  id: string;
  name: string;
  profileImage: string;
  hasWrittenToday: boolean;
  canPoke: boolean;
  lastSnippet?: string;
};

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "지은",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    hasWrittenToday: true,
    canPoke: false,
    lastSnippet: "오늘의 나를 표현하는 단어들: 설렘, 도전, 고마움",
  },
  {
    id: "2",
    name: "민수",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    hasWrittenToday: false,
    canPoke: true,
  },
  {
    id: "3",
    name: "서연",
    profileImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    hasWrittenToday: true,
    canPoke: false,
    lastSnippet: "카페에서 조용히 하루를 마무리한 날",
  },
  {
    id: "4",
    name: "하은",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    hasWrittenToday: false,
    canPoke: true,
  },
];

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [searchText, setSearchText] = useState("");

  const notWritten = friends.filter((f) => !f.hasWrittenToday);
  const written = friends.filter((f) => f.hasWrittenToday);

  function handlePoke(friendId: string) {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, canPoke: false } : f
      )
    );
    const friend = friends.find((f) => f.id === friendId);
    Alert.alert("찌르기 완료", `${friend?.name}님을 찔렀어요!`);
  }

  function handleAddFriend() {
    if (!searchText.trim()) return;
    Alert.alert("친구 추가", `"${searchText.trim()}" 에게 친구 요청을 보냈어요.`);
    setSearchText("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>우리들의 방</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Friend Search / Add */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="친구 검색 또는 추가..."
            placeholderTextColor={colors.gray}
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

        {/* Not Written - Poke Section */}
        {notWritten.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>아직 일기를 안 쓴 친구</Text>
            {notWritten.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <Image
                  source={{ uri: friend.profileImage }}
                  style={styles.avatar}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendSub}>
                    아직 오늘의 조각을 기록하지 않았어요.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.pokeBtn,
                    !friend.canPoke && styles.pokeBtnDisabled,
                  ]}
                  onPress={() => handlePoke(friend.id)}
                  disabled={!friend.canPoke}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="hand-left"
                    size={14}
                    color={friend.canPoke ? colors.white : colors.gray}
                  />
                  <Text
                    style={[
                      styles.pokeBtnText,
                      !friend.canPoke && styles.pokeBtnTextDisabled,
                    ]}
                  >
                    {friend.canPoke ? "찌르기" : "찌름!"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Written - Diary Feed */}
        {written.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>친구들의 일기</Text>
            {written.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <Image
                  source={{ uri: friend.profileImage }}
                  style={styles.avatar}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendSnippet} numberOfLines={1}>
                    {friend.lastSnippet}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.gray}
                />
              </View>
            ))}
          </>
        )}

        {friends.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={colors.grayBorder}
            />
            <Text style={styles.emptyTitle}>아직 친구가 없어요</Text>
            <Text style={styles.emptySubtitle}>
              위 검색창에서 친구를 추가해보세요.
            </Text>
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
  friendSub: {
    fontSize: 12,
    color: colors.gray,
  },
  friendSnippet: {
    fontSize: 13,
    color: colors.gray,
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
