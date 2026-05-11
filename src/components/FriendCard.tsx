import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Card } from "./Card";
import { PokeButton } from "./PokeButton";
import { colors } from "../constants/colors";

interface FriendCardProps {
  name: string;
  profileImage?: string;
  lastDiarySnippet?: string;
  emotion?: string;
  hasWrittenToday: boolean;
  canPoke: boolean;
  onPoke: () => void;
  onPress: () => void;
}

export const FriendCard = ({
  name,
  profileImage,
  lastDiarySnippet,
  emotion,
  hasWrittenToday,
  canPoke,
  onPoke,
  onPress,
}: FriendCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
      // 2. 접근성 속성 추가
      accessibilityRole="button"
      accessibilityLabel={`${name}님의 프로필 보기. ${hasWrittenToday ? "오늘 일기를 작성했습니다." : "오늘 아직 일기를 쓰지 않았습니다."}`}
    >
      <Card padding={16}>
        <View style={styles.flexRow}>
          {/* 1. 왼쪽: 프로필 영역 */}
          <View style={styles.profileWrapper}>
            <Image
              source={{
                uri: profileImage || "https://via.placeholder.com/150",
              }}
              style={styles.profilePic}
              accessibilityLabel={`${name}님의 프로필 사진`} // 2. 이미지 접근성
            />
            <View style={styles.statusBadge}>
              <Text style={styles.statusEmoji}>
                {hasWrittenToday ? emotion : "❓"}
              </Text>
            </View>
          </View>

          {/* 2. 중앙: 정보 영역 */}
          <View style={styles.infoArea}>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.snippetText} numberOfLines={1}>
              {hasWrittenToday
                ? lastDiarySnippet
                : "아직 오늘의 조각을 기록하지 않았어요."}
            </Text>
          </View>

          {/* 3. 오른쪽: 찌르기 버튼 */}
          {!hasWrittenToday && (
            <View style={styles.actionArea}>
              <PokeButton
                canPokeToday={canPoke}
                onPress={onPoke}
                isLoading={false} // 필요 시 로딩 상태 연결
                style={styles.pokeButton}
              />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 3. 스타일 정의 순서 최적화 (레이아웃 -> 크기 -> 색상/텍스트 순)
  container: {
    marginHorizontal: 4,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileWrapper: {
    position: "relative",
    marginRight: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray || "#F0F0F0",
  },
  statusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    // 1. COLORS 상수 활용
    backgroundColor: colors.white || "#FFFFFF",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusEmoji: {
    fontSize: 12,
    // 1. COLORS 상수 활용 (텍스트 색상)
    color: colors.black || "#2D2D2D",
  },
  infoArea: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    marginBottom: 2,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black || "#2D2D2D",
  },
  snippetText: {
    fontSize: 13,
    color: colors.gray || "#8E8E93",
  },
  actionArea: {
    marginLeft: 8,
  },
  pokeButton: {
    height: 36,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
});
