import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEntries } from '../store/entries';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatHeader(date: Date) {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: '--', weekday: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: WEEKDAYS[date.getDay()],
  };
}

export default function Index() {
  const { error, loading, refreshEntries, searchEntries } = useEntries();
  const [query, setQuery] = useState('');
  const today = useMemo(() => new Date(), []);
  const entries = searchEntries(query);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMonth}>{formatHeader(today)}</Text>
          <Text style={styles.headerTitle}>日記</Text>
        </View>
        <Pressable style={styles.headerButton} onPress={() => router.push('/new')}>
          <Text style={styles.headerButtonText}>＋</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="タイトルや本文を検索"
          placeholderTextColor="#9A948C"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#5C7D6B" />
          <Text style={styles.centerText}>日記を読み込んでいます</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>読み込みに失敗しました</Text>
              <Text style={styles.noticeText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={refreshEntries}>
                <Text style={styles.retryButtonText}>再読み込み</Text>
              </Pressable>
            </View>
          ) : null}

          {!error && entries.length === 0 ? (
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>
                {query ? '見つかりませんでした' : '最初の日記を書きましょう'}
              </Text>
              <Text style={styles.noticeText}>
                {query
                  ? '検索語を変えると、別の日記が見つかるかもしれません。'
                  : '右上の＋から、今日の出来事や気分を残せます。'}
              </Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {entries.map((entry) => {
              const { day, weekday } = formatDateLabel(entry.date);
              return (
                <Pressable
                  key={entry.id}
                  style={styles.entry}
                  onPress={() =>
                    router.push({ pathname: '/[id]', params: { id: entry.id } })
                  }
                >
                  <View style={styles.entryDateColumn}>
                    <Text style={styles.entryWeekday}>{weekday}</Text>
                    <Text style={styles.entryDay}>{day}</Text>
                  </View>
                  <View style={styles.entryBody}>
                    <View style={styles.entryTitleRow}>
                      <Text style={styles.entryIcon}>{entry.icon}</Text>
                      <Text style={styles.entryTitle} numberOfLines={1}>
                        {entry.title || '無題の日記'}
                      </Text>
                    </View>
                    <Text style={styles.entryExcerpt} numberOfLines={2}>
                      {entry.body}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const PAPER = '#F7F1E8';
const INK = '#272A2B';
const SUB = '#736E68';
const ACCENT = '#5C7D6B';
const CARD = '#FFFFFF';
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerMonth: {
    color: SUB,
    fontSize: 13,
  },
  headerTitle: {
    color: INK,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 2,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: INK,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    color: SUB,
    fontSize: 14,
    marginTop: 12,
  },
  notice: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
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
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT,
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  entry: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  entryDateColumn: {
    alignItems: 'center',
    paddingTop: 2,
    width: 44,
  },
  entryWeekday: {
    color: SUB,
    fontSize: 12,
  },
  entryDay: {
    color: INK,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  entryBody: {
    flex: 1,
  },
  entryTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  entryIcon: {
    fontSize: 18,
  },
  entryTitle: {
    color: INK,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  entryExcerpt: {
    color: SUB,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
});
