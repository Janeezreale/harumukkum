import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../constants/colors";
import { signOut as signOutApi, uploadProfileImage } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const DEFAULT_PROFILE = require("../../assets/images/profile.png");

export default function MyPageScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function handlePickProfileImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "사진을 변경하려면 앨범 접근 권한이 필요해요.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setIsUploadingPhoto(true);
    try {
      const newUrl = await uploadProfileImage(result.assets[0].uri);
      updateUser({ profile_image_url: newUrl });
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "사진 변경에 실패했어요.");
    } finally {
      setIsUploadingPhoto(false);
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
          {isSigningOut
            ? <ActivityIndicator size="small" color={colors.gray} />
            : <Ionicons name="log-out-outline" size={22} color={colors.grayDark} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickProfileImage}
            disabled={isUploadingPhoto}
            activeOpacity={0.8}
          >
            {isUploadingPhoto ? (
              <View style={[styles.profileImage, styles.uploadingOverlay]}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <Image source={profileSource} style={styles.profileImage} />
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>

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
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.black },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20 },
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
  avatarWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayLight,
  },
  uploadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: { flex: 1, gap: 3 },
  nickname: { fontSize: 18, fontWeight: "700", color: colors.black },
  username: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  email: { fontSize: 13, color: colors.gray },
});
