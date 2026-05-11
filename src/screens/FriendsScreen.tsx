import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { FriendCard } from "../components/FriendCard";
import { colors } from "../constants/colors";

type Friend = {
  id: string;
  name: string;
  profileImage?: string;
  lastDiarySnippet?: string;
  emotion?: string;
  hasWrittenToday: boolean;
  canPoke: boolean;
};

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "지민",
    profileImage: "https://via.placeholder.com/150",
    lastDiarySnippet: "오늘은 친구들과 프로젝트 회의를 하면서 앱 구조를 정리했다.",
    emotion: "😊",
    hasWrittenToday: true,
    canPoke: false,
  },
  {
    id: "2",
    name: "서연",
    profileImage: "https://via.placeholder.com/150",
    hasWrittenToday: false,
    canPoke: true,
  },
  {
    id: "3",
    name: "민수",
    profileImage: "https://via.placeholder.com/150",
    lastDiarySnippet: "개발을 오래 해서 조금 지쳤지만, 기능이 보여서 뿌듯했다.",
    emotion: "😴",
    hasWrittenToday: true,
    canPoke: false,
  },
  {
    id: "4",
    name: "하은",
    profileImage: "https://via.placeholder.com/150",
    hasWrittenToday: false,
    canPoke: true,
  },
];

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);

  const notWrittenFriends = friends.filter(
    (friend) => !friend.hasWrittenToday
  );

  const writtenFriends = friends.filter(
    (friend) => friend.hasWrittenToday
  );

  const handlePoke = (friendId: string) => {
    setFriends((prevFriends) =>
      prevFriends.map((friend) =>
        friend.id === friendId
          ? {
              ...friend,
              canPoke: false,
            }
          : friend
      )
    );
  };

  const handlePressFriend = (friend: Friend) => {
    if (friend.hasWrittenToday) {
      Alert.alert(
        `${friend.name}님의 일기`,
        friend.lastDiarySnippet || "오늘 작성한 일기가 있어요."
      );
      return;
    }

    Alert.alert(
      `${friend.name}님`,
      "아직 오늘의 일기를 작성하지 않았어요."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>친구</Text>
          <Text style={styles.subtitle}>
            친구들의 오늘 일기를 확인하고, 아직 안 쓴 친구를 찔러보세요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>아직 일기를 안 쓴 친구</Text>

          {notWrittenFriends.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                모든 친구가 오늘 일기를 작성했어요.
              </Text>
            </View>
          ) : (
            notWrittenFriends.map((friend) => (
              <View key={friend.id} style={styles.cardGap}>
                <FriendCard
                  name={friend.name}
                  profileImage={friend.profileImage}
                  lastDiarySnippet={friend.lastDiarySnippet}
                  emotion={friend.emotion}
                  hasWrittenToday={friend.hasWrittenToday}
                  canPoke={friend.canPoke}
                  onPoke={() => handlePoke(friend.id)}
                  onPress={() => handlePressFriend(friend)}//m
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>친구 일기</Text>

          {writtenFriends.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                아직 볼 수 있는 친구 일기가 없어요.
              </Text>
            </View>
          ) : (
            writtenFriends.map((friend) => (
              <View key={friend.id} style={styles.cardGap}>
                <FriendCard
                  name={friend.name}
                  profileImage={friend.profileImage}
                  lastDiarySnippet={friend.lastDiarySnippet}
                  emotion={friend.emotion}
                  hasWrittenToday={friend.hasWrittenToday}
                  canPoke={friend.canPoke}
                  onPoke={() => {}}
                  onPress={() => handlePressFriend(friend)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || "#FAF7F2",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FAF7F2",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.black || "#2D2D2D",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray || "#8E8E93",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black || "#2D2D2D",
    marginBottom: 14,
  },
  cardGap: {
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: colors.white || "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray || "#8E8E93",
  },
});