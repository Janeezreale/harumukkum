import React, { ReactNode } from 'react';
// 1. StyleProp을 추가로 가져와야 배열 스타일 에러가 사라집니다.
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from "../constants/colors";

interface CardProps {
  children?: ReactNode;
  // 2. 타입을 ViewStyle에서 StyleProp<ViewStyle>로 변경했습니다. 
  // 그래야 [styles.card, style] 처럼 배열로 묶는 게 허용됩니다.
  style?: StyleProp<ViewStyle>; 
  padding?: number;
}

export const Card = ({ children, style, padding = 20 }: CardProps) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'visible', 
    marginVertical: 10,
  },
});