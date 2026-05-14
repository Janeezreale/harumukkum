import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { colors } from "../constants/colors";
import { signOut as signOutApi } from "../api/auth";
import {
  acceptFriendRequest,
  getFriends,
  getReceivedFriendRequests,
  rejectFriendRequest,
  type FriendListItem,
  type FriendRequest,
} from "../api/friends";
import { useAuthStore } from "../store/authStore";

const DEFAULT_PROFILE = require("../../assets/images/profile.png");

type ProcessingAction = "accept" | "reject";

export default function MyPageScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingRequest, setProcessingRequest] = useState<{
    id: string;
    action: ProcessingAction;
  } | null>(null);

  const loadMyPage = useCallback(async (options?: { refreshing?: boolean }) => {
    try {
      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage("");

      const [requests, friendList] = await Promise.all([
        getReceivedFriendRequests(),
        getFriends(),
      ]);

      setFriendRequests(requests);
      setFriends(friendList);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "마이페이지 정보를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyPage();
    }, [loadMyPage]),
  );

  const handleRefresh = useCallback(() => {
    loadMyPage({ refreshing: true });
  }, [loadMyPage]);

  async function handleAcceptRequest(requestId: string) {
    if (processingRequest) return;

    try {
      setProcessingRequest({ id: requestId, action: "accept" });
      await acceptFriendRequest(requestId);
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
      const friendList = await getFriends();
      setFriends(friendList);
    } catch (error) {
      Alert.alert(
        "친구 요청 수락 실패",
        error instanceof Error
          ? error.message
          : "친구 요청을 수락하지 못했습니다.",
      );
    } finally {
      setProcessingRequest(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    if (processingRequest) return;

    try {
      setProcessingRequest({ id: requestId, action: "reject" });
      await rejectFriendRequest(requestId);
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
    } catch (error) {
      Alert.alert(
        "친구 요청 거절 실패",
        error instanceof Error
          ? error.message
          : "친구 요청을 거절하지 못했습니다.",
      );
    } finally {
      setProcessingRequest(null);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOutApi();
      clearAuth();
      router.replace("/auth/login");
    } catch (error) {
      Alert.alert(
        "로그아웃 실패",
        error instanceof Error ? error.message : "로그아웃하지 못했습니다.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  const profileSource = user?.profile_image_url
    ? { uri: user.profile_image_url }
    : DEFAULT_PROFILE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.iconButton}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.gray} />
          ) : (
            <Ionicons name="log-out-outline" size={22} color={colors.grayDark} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colors.negative}
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadMyPage()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.profileCard}>
            <Image source={profileSource} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.nickname} numberOfLines={1}>
                {user?.nickname ?? "사용자"}
              </Text>
              <Text style={styles.username} numberOfLines={1}>
                @{user?.username ?? "unknown"}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email ?? "이메일 정보 없음"}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>친구 추가 요청</Text>
            <Text style={styles.sectionCount}>{friendRequests.length}</Text>
          </View>

          {friendRequests.length > 0 ? (
            <View style={styles.listGroup}>
              {friendRequests.map((request) => {
                const isAccepting =
                  processingRequest?.id === request.id &&
                  processingRequest.action === "accept";
                const isRejecting =
                  processingRequest?.id === request.id &&
                  processingRequest.action === "reject";
                const isDisabled = Boolean(processingRequest);

                return (
                  <View key={request.id} style={styles.listItem}>
                    <Image
                      source={
                        request.requester.profile_image_url
                          ? { uri: request.requester.profile_image_url }
                          : DEFAULT_PROFILE
                      }
                      style={styles.avatar}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {request.requester.nickname}
                      </Text>
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        @{request.requester.username}
                      </Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(request.id)}
                        disabled={isDisabled}
                      >
                        {isAccepting ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={styles.acceptButtonText}>수락</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleRejectRequest(request.id)}
                        disabled={isDisabled}
                      >
                        {isRejecting ? (
                          <ActivityIndicator size="small" color={colors.gray} />
                        ) : (
                          <Text style={styles.rejectButtonText}>거절</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>받은 친구 요청이 없어요.</Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>친구 목록</Text>
            <Text style={styles.sectionCount}>{friends.length}</Text>
          </View>

          {friends.length > 0 ? (
            <View style={styles.listGroup}>
              {friends.map((item) => (
                <View key={item.friendship_id} style={styles.listItem}>
                  <Image
                    source={
                      item.friend.profile_image_url
                        ? { uri: item.friend.profile_image_url }
                        : DEFAULT_PROFILE
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.friend.nickname}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      @{item.friend.username}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>아직 등록된 친구가 없어요.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 18,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  errorText: {
    fontSize: 14,
    color: colors.grayDark,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayLight,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  nickname: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },
  username: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  email: {
    fontSize: 13,
    color: colors.gray,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },
  sectionCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.primaryBg,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  listGroup: {
    gap: 10,
  },
  listItem: {
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
  itemInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.gray,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 54,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: colors.grayLight,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  rejectButtonText: {
    color: colors.grayDark,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
  },
});
