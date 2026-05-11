import React, { useRef } from 'react';
import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  ViewStyle, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface PokeButtonProps {
  canPokeToday: boolean; // 오늘 찌르기가 가능한 상태인지
  isLoading?: boolean;   // 서버 통신 중 로딩 상태
  onPress: () => void;
  style?: ViewStyle;     // 외부 레이아웃 조절용
}

export const PokeButton = ({
  canPokeToday,
  isLoading = false,
  onPress,
  style,
}: PokeButtonProps) => {
  // 1. 애니메이션 설정을 위한 변수
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 클릭 시 작아졌다가 커지는 효과
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!canPokeToday || isLoading}
        activeOpacity={0.8}
        // 2. 접근성 설정
        accessibilityRole="button"
        accessibilityLabel={canPokeToday ? "친구 찌르기" : "오늘 이미 찔렀습니다"}
        style={[
          styles.button,
          canPokeToday ? styles.activeButton : styles.disabledButton
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons 
              name={canPokeToday ? "notifications" : "checkmark-circle"} 
              size={16} 
              color={canPokeToday ? colors.white : colors.gray} 
              style={styles.icon}
            />
            <Text style={[
              styles.text, 
              canPokeToday ? styles.activeText : styles.disabledText
            ]}>
              {canPokeToday ? "찌르기" : "완료"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // 레이아웃 및 크기
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  icon: {
    marginRight: 4,
  },

  // 활성화 상태 (찌르기 가능)
  activeButton: {
    backgroundColor: colors.primary,
    // 그림자 설정
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  activeText: {
    color: colors.white,
  },

  // 비활성화 상태 (이미 찔렀거나 오늘 불가)
  disabledButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  disabledText: {
    color: colors.gray,
  },

  // 공통 텍스트 스타일
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});