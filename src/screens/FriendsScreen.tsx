import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../constants/colors';

// TODO: replace with api/friends.getFriendList()
const mockFriends = [
  { id: 'f1', nickname: '지윤', profile_image_url: 'https://i.pravatar.cc/150?img=1' },
  { id: 'f2', nickname: '민주', profile_image_url: 'https://i.pravatar.cc/150?img=2' },
  { id: 'f3', nickname: '서연', profile_image_url: 'https://i.pravatar.cc/150?img=3' },
  { id: 'f4', nickname: '하윤', profile_image_url: 'https://i.pravatar.cc/150?img=4' },
];

// TODO: replace with api/friends.getFriendDiaries()
const mockFriendDiaries = [
  {
    diary: {
      id: 'd1',
      body: '오늘의 나를 표현하는 단어들',
      photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
      extra_photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
      tags: ['#설렘', '#5점', '#2자유'],
      likes: 1,
      comments: 2,
      created_at: '2026-05-26T09:21:00Z',
    },
    author: {
      id: 'f1',
      nickname: '지윤',
      profile_image_url: 'https://i.pravatar.cc/150?img=1',
    },
  },
  {
    diary: {
      id: 'd2',
      body: '오늘은 정말 바쁜 하루였던 하루였어, 오랜만에 만난 친구와 보낸 시간이 너무 소중했고...',
      photo_url: null,
      extra_photo_url: null,
      tags: [],
      likes: 0,
      comments: 0,
      created_at: '2026-05-26T09:08:00Z',
    },
    author: {
      id: 'f2',
      nickname: '민주',
      profile_image_url: 'https://i.pravatar.cc/150?img=2',
    },
  },
];

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  return `${Math.floor(diff / 60)}시간 전`;
}

function formatSectionDate(): string {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${days[d.getDay()]}요일`;
}

type DiaryEntry = (typeof mockFriendDiaries)[number];

function DiaryCard({ item }: { item: DiaryEntry }) {
  const { diary, author } = item;
  return (
    <View style={styles.card}>
      {/* 카드 헤더 */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: author.profile_image_url ?? undefined }} style={styles.avatar} />
        <View style={styles.cardHeaderText}>
          <Text style={styles.authorName}>{author.nickname}</Text>
          <Text style={styles.cardTime}>{timeAgo(diary.created_at)}</Text>
        </View>
        {/* TODO: show more options menu */}
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.moreIcon}>···</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <Text style={styles.cardBody} numberOfLines={3}>
        {diary.body}
      </Text>

      {/* 태그 */}
      {diary.tags.length > 0 && (
        <View style={styles.tagRow}>
          {diary.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 사진 */}
      {diary.photo_url && (
        <View style={styles.photoRow}>
          {/* TODO: navigate to photo detail */}
          <TouchableOpacity style={styles.photoWrapper} activeOpacity={0.9}>
            <Image source={{ uri: diary.photo_url }} style={styles.photo} />
          </TouchableOpacity>
          {diary.extra_photo_url && (
            <TouchableOpacity style={styles.photoWrapper} activeOpacity={0.9}>
              <Image source={{ uri: diary.extra_photo_url }} style={styles.photo} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 좋아요/댓글 */}
      <View style={styles.actionRow}>
        {/* TODO: toggle like */}
        <TouchableOpacity style={styles.actionItem} hitSlop={8}>
          <Text style={styles.actionIcon}>♡</Text>
          <Text style={styles.actionCount}>{diary.likes}</Text>
        </TouchableOpacity>
        {/* TODO: open comments */}
        <TouchableOpacity style={styles.actionItem} hitSlop={8}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{diary.comments > 0 ? `글${diary.comments}` : '0'}</Text>
        </TouchableOpacity>
        {/* TODO: bookmark */}
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.actionIcon}>□</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [comment, setComment] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.headerMenu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>우리들의 방</Text>
          <View style={styles.headerIcons}>
            {/* TODO: navigate to notifications */}
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.headerIcon}>🔔</Text>
            </TouchableOpacity>
            {/* TODO: navigate to search */}
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.headerIcon}>🔍</Text>
            </TouchableOpacity>
            {/* TODO: navigate to settings */}
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 친구 아바타 가로 스크롤 */}
        <FlatList
          horizontal
          data={mockFriends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.avatarRow}
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={
            // TODO: navigate to add friend
            <TouchableOpacity style={styles.addFriendBtn}>
              <Text style={styles.addFriendIcon}>+</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            // TODO: navigate to friend profile
            <TouchableOpacity style={styles.avatarItem} activeOpacity={0.8}>
              <Image
                source={{ uri: item.profile_image_url }}
                style={styles.friendAvatar}
              />
            </TouchableOpacity>
          )}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 섹션 헤더 */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionHashTitle}># 오늘의 일기</Text>
              <Text style={styles.sectionDate}>{formatSectionDate()}</Text>
            </View>
            <TouchableOpacity
              style={styles.writeDiaryBtn}
              onPress={() => router.push('/create')}
              activeOpacity={0.85}
            >
              <Text style={styles.writeDiaryText}>일기 쓰기 ✏️</Text>
            </TouchableOpacity>
          </View>

          {/* 친구 일기 카드 목록 */}
          {mockFriendDiaries.map((item) => (
            <DiaryCard key={item.diary.id} item={item} />
          ))}
        </ScrollView>

        {/* 댓글 입력창 */}
        <View style={styles.commentBar}>
          <TextInput
            style={styles.commentInput}
            placeholder="답하기..."
            placeholderTextColor={colors.gray}
            value={comment}
            onChangeText={setComment}
          />
          {/* TODO: submit comment */}
          <TouchableOpacity style={styles.commentSend} onPress={() => setComment('')}>
            <Text style={styles.commentSendIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerMenu: {
    fontSize: 20,
    color: colors.black,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    fontSize: 18,
  },
  // Avatar row
  avatarRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    alignItems: 'center',
  },
  addFriendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginRight: 4,
  },
  addFriendIcon: {
    fontSize: 22,
    color: colors.gray,
    lineHeight: 26,
  },
  avatarItem: {
    marginRight: 4,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  sectionHashTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  sectionDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  writeDiaryBtn: {
    backgroundColor: colors.black,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  writeDiaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  // Diary card
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  cardTime: {
    fontSize: 12,
    color: colors.gray,
  },
  moreIcon: {
    fontSize: 18,
    color: colors.gray,
    letterSpacing: 2,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.black,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 110,
    backgroundColor: '#E5E7EB',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 16,
    color: colors.gray,
  },
  actionCount: {
    fontSize: 13,
    color: colors.gray,
  },
  // Comment bar
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: colors.white,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
  },
  commentSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendIcon: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
  },
});
