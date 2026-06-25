import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEntries } from '../store/entries';

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function EntryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, loading } = useEntries();
  const entry = id ? getEntry(id) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.linkText}>戻る</Text>
        </Pressable>
        {entry ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/edit/[id]', params: { id: entry.id } })
            }
            hitSlop={12}
          >
            <Text style={styles.linkText}>編集</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!entry ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              {loading ? '読み込んでいます' : '日記が見つかりません'}
            </Text>
            <Text style={styles.noticeText}>
              {loading
                ? 'Firestore から日記を取得しています。'
                : '一覧に戻って、もう一度選び直してください。'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.date}>{formatDate(entry.date)}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{entry.icon}</Text>
              <Text style={styles.title}>{entry.title}</Text>
            </View>
            <Text style={styles.body}>{entry.body}</Text>
            {entry.imageUrl ? (
              <Image source={{ uri: entry.imageUrl }} style={styles.image} />
            ) : null}
            <Text style={styles.meta}>更新: {new Date(entry.updatedAt).toLocaleString()}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PAPER = '#F7F1E8';
const INK = '#272A2B';
const SUB = '#736E68';
const ACCENT = '#5C7D6B';
const BORDER = '#E4D9CC';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAPER,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerSpacer: {
    width: 40,
  },
  linkText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  date: {
    color: SUB,
    fontSize: 14,
    marginBottom: 10,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    color: INK,
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  body: {
    color: INK,
    fontSize: 16,
    lineHeight: 27,
  },
  image: {
    aspectRatio: 4 / 3,
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
    width: '100%',
  },
  meta: {
    color: SUB,
    fontSize: 12,
    marginTop: 24,
  },
  notice: {
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  noticeTitle: {
    color: INK,
    fontSize: 17,
    fontWeight: '700',
  },
  noticeText: {
    color: SUB,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
