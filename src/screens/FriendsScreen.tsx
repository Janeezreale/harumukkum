import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

type FriendProfile = {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
};

type DiaryPost = {
  id: string;
  author: FriendProfile;
  timeAgo: string;
  title: string;
  tags: string[];
  images: string[];
  likes: number;
  comments: number;
  content?: string;
};

const FRIEND_PROFILES: FriendProfile[] = [
  { id: '1', name: '지은', profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isOnline: true },
  { id: '2', name: '민수', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', isOnline: false },
  { id: '3', name: '서연', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', isOnline: false },
  { id: '4', name: '하은', profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', isOnline: false },
];

const MOCK_POSTS: DiaryPost[] = [
  {
    id: '1',
    author: FRIEND_PROFILES[0],
    timeAgo: '1시간 전',
    title: '오늘의 나를 표현하는 단어들',
    tags: ['#설렘', '#도전', '#고마움'],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    ],
    likes: 3,
    comments: 2,
  },
  {
    id: '2',
    author: { id: '5', name: '민주', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', isOnline: false },
    timeAgo: '3시간 전',
    title: '',
    tags: [],
    images: [],
    likes: 0,
    comments: 0,
    content: '오늘은 정말 벅찼던 하루였어. 오랜만에 만난 친구와 보낸 시간이 너무 소중했고...',
  },
];

export default function FriendsScreen() {
  const [commentText, setCommentText] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="menu" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>우리들의 방</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="person-outline" size={20} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="notifications-outline" size={20} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="settings-outline" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Friend Avatars */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarRow}
        >
          {/* Add friend button */}
          <View style={styles.avatarWrapper}>
            <View style={styles.addAvatarCircle}>
              <Ionicons name="add" size={20} color={colors.gray} />
            </View>
          </View>
          {FRIEND_PROFILES.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.avatarWrapper}>
              <View style={[styles.avatarBorder, friend.isOnline && styles.avatarBorderActive]}>
                <Image source={{ uri: friend.profileImage }} style={styles.avatarImage} />
              </View>
              {friend.isOnline && <View style={styles.onlineDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}># 오늘의 일기</Text>
          <View style={styles.dateSubRow}>
            <Text style={styles.dateSubtext}>2024.05.26 일요일</Text>
            <TouchableOpacity style={styles.writeBtn}>
              <Ionicons name="pencil" size={14} color={colors.white} />
              <Text style={styles.writeBtnText}>일기 쓰기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Diary Posts */}
        {MOCK_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: post.author.profileImage }} style={styles.postAvatar} />
              <View style={styles.postAuthorInfo}>
                <Text style={styles.postAuthorName}>{post.author.name}</Text>
                <Text style={styles.postTime}>{post.timeAgo}</Text>
              </View>
              <TouchableOpacity hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Title and tags */}
            {post.title ? (
              <Text style={styles.postTitle}>{post.title}</Text>
            ) : null}

            {post.tags.length > 0 && (
              <View style={styles.tagRow}>
                {post.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Images */}
            {post.images.length > 0 && (
              <View style={styles.imageRow}>
                {post.images.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.postImage} />
                ))}
              </View>
            )}

            {/* Content */}
            {post.content ? (
              <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
            ) : null}

            {/* Engagement */}
            {(post.likes > 0 || post.comments > 0) && (
              <View style={styles.engagementRow}>
                <View style={styles.engagementItem}>
                  <Ionicons name="heart" size={16} color={colors.negative} />
                  <Text style={styles.engagementText}>{post.likes}</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Ionicons name="chatbubble-outline" size={15} color={colors.gray} />
                  <Text style={styles.engagementText}>댓글 {post.comments}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={18} color={colors.gray} />
                </TouchableOpacity>
              </View>
            )}

            {/* Comment input */}
            {post.content && (
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="메시지 보내기..."
                  placeholderTextColor={colors.gray}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity style={styles.commentSendBtn}>
                  <Ionicons name="add-circle" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.black },
  headerRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, gap: 16 },

  // Avatars
  avatarRow: { paddingHorizontal: 20, gap: 14, paddingVertical: 4 },
  avatarWrapper: { alignItems: 'center', position: 'relative' },
  addAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.grayBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: colors.grayBorder,
    padding: 2,
  },
  avatarBorderActive: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.positive,
    borderWidth: 2,
    borderColor: colors.white,
  },

  // Date header
  dateHeader: {
    paddingHorizontal: 20,
    gap: 4,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
  },
  dateSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSubtext: {
    fontSize: 13,
    color: colors.gray,
  },
  writeBtn: {
    backgroundColor: colors.black,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  writeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },

  // Post card
  postCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grayLight,
  },
  postAuthorInfo: { flex: 1, gap: 1 },
  postAuthorName: { fontSize: 15, fontWeight: '600', color: colors.black },
  postTime: { fontSize: 12, color: colors.gray },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 22,
  },
  tagRow: { flexDirection: 'row', gap: 6 },
  tagChip: {
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 13, color: colors.black },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  postImage: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.grayLight,
  },
  postContent: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 24,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: { fontSize: 13, color: colors.gray },

  // Comment input
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    paddingVertical: 4,
  },
  commentSendBtn: {},
});
