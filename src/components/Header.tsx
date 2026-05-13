import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
}: HeaderProps) => {
  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* 1. Left Section: 뒤로가기 버튼 */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              onPress={onBack} 
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="이전 화면으로 돌아가기"
            >
              <Ionicons name="chevron-back" size={24} color={colors.black} />
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Center Section: 타이틀 및 서브타이틀 */}
        <View style={styles.centerSection}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* 3. Right Section: 추가 액션 요소 */}
        <View style={styles.rightSection}>
          {rightElement ? (
            rightElement
          ) : (
            // 레이아웃 균형을 위한 투명 Placeholder
            <View style={styles.iconButton} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 레이아웃 스타일
  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  // 요소 크기 스타일
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 텍스트 및 디자인 스타일
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.black,
  },
  subtitleText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    color: colors.gray,
  },
});