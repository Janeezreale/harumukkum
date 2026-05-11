import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  View,
  Dimensions,
} from "react-native";
import { colors } from "../constants/colors";

// 화면 너비를 7로 나누어 한 칸의 크기를 결정합니다.
const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 40) / 7; // 좌우 여백을 제외한 7등분

interface CalendarDayProps {
  date: number; // 날짜 (1, 2, 3...)
  isCurrentMonth: boolean; // 이번 달인지 여부 (아니면 흐리게 표시)
  imageUrl?: string; // 일기 썸네일 이미지 주소
  emotion?: string; // 감정 아이콘 (선택 사항)
  isToday?: boolean; // 오늘 날짜 여부
  onPress: () => void; // 클릭 시 실행할 함수
}

export const CalendarDay = ({
  date,
  isCurrentMonth,
  imageUrl,
  emotion,
  isToday,
  onPress,
}: CalendarDayProps) => {
  // 일기가 있는 경우 (이미지가 있는 경우)
  if (imageUrl) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 8 }} // 이미지 모서리 곡선
        >
          {/* 이미지 위에 글씨가 잘 보이도록 어두운 덮개(Overlay) 추가 */}
          <View style={styles.overlay}>
            <Text style={styles.dateTextInImage}>{date}</Text>
            {emotion && <Text style={styles.emotionIcon}>{emotion}</Text>}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  // 일기가 없는 일반 날짜
  return (
    <TouchableOpacity
      style={[styles.container, isToday && styles.todayContainer]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.dateText,
          !isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText,
        ]}
      >
        {date}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: DAY_SIZE,
    height: DAY_SIZE + 10, // 약간 세로로 긴 형태
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  todayContainer: {
    // 오늘 날짜에 강조를 주고 싶을 때 사용
  },
  imageBackground: {
    width: DAY_SIZE - 4, // 간격을 위해 약간 작게
    height: DAY_SIZE - 4,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)", // 사진 위 검은색 반투명 필터
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: colors.black || "#2D2D2D",
    fontWeight: "500",
  },
  dateTextInImage: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  otherMonthText: {
    color: colors.gray || "#D1D1D6", // 지난달/다음달 날짜는 흐리게
  },
  todayText: {
    color: colors.primary || "#FF6B9D", // 오늘 날짜는 포인트 컬러로
    fontWeight: "bold",
  },
  emotionIcon: {
    fontSize: 12,
    marginTop: 2,
  },
});
