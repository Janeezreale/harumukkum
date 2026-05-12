import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Card } from "./Card";
import { colors } from "../constants/colors"; // 1. 상수 활용

interface DiaryCardProps {
  userName?: string;
  profileImage?: string;
  date: string;
  emotion: string;
  content: string;
  thumbnail?: string;
  tags?: string[];
  onPress: () => void;
}

// 기본 이미지 설정 (이미지 로딩 실패 시 사용)
const DEFAULT_PROFILE = require("../../assets/images/profile.png");
const DEFAULT_THUMBNAIL = require("../../assets/images/thumbnail.png");

export const DiaryCard = ({
  userName,
  profileImage,
  date,
  emotion,
  content,
  thumbnail,
  tags,
  onPress,
}: DiaryCardProps) => {
  // 3. 이미지 에러 상태 관리
  const [profileError, setProfileError] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  // 프로필 이미지 소스 결정 로직
  const profileSource =
    profileError || !profileImage ? DEFAULT_PROFILE : { uri: profileImage };

  // 썸네일 이미지 소스 결정 로직
  const thumbSource =
    thumbError || !thumbnail ? DEFAULT_THUMBNAIL : { uri: thumbnail };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      // 4. 접근성 추가
      accessibilityRole="button"
      accessibilityLabel={`${userName || "사용자"}의 일기 상세 보기`}
    >
      <Card padding={16}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {profileImage && (
              <Image
                source={profileSource}
                style={styles.profilePic}
                onError={() => setProfileError(true)} // 에러 처리
                accessibilityLabel="프로필 사진"
              />
            )}
            <View>
              {userName && <Text style={styles.userName}>{userName}</Text>}
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
          <Text style={styles.emotionBadge}>{emotion}</Text>
        </View>

        <Text style={styles.content} numberOfLines={3}>
          {content}
        </Text>

        {thumbnail && (
          <Image
            source={thumbSource}
            style={styles.thumbnail}
            onError={() => setThumbError(true)} // 에러 처리
            accessibilityLabel="일기 첨부 사진"
          />
        )}

        {tags && tags.length > 0 && (
          <View style={styles.tagContainer}>
            {tags.map((tag) => (
              // 2. index 대신 tag 문자열을 key로 사용
              <Text key={tag} style={styles.tagText}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: colors.background || "#F0F0F0", // 1. 상수 적용
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.black || "#2D2D2D", // 1. 상수 적용
  },
  dateText: {
    fontSize: 12,
    color: colors.gray || "#8E8E93", // 1. 상수 적용
  },
  emotionBadge: {
    fontSize: 20,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.black || "#444444", // 1. 상수 적용
    marginBottom: 12,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary, // 1. 상수 적용
    backgroundColor: colors.background, // 1. 상수 적용
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "500",
  },
});
