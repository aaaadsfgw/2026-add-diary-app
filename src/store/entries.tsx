import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Entry = {
  id: string;
  date: Date;
  mood: string;
  title: string;
  body: string;
};

const INITIAL_ENTRIES: Entry[] = [
  {
    id: 'seed-1',
    date: new Date(2026, 4, 29),
    mood: '☀️',
    title: '鴨川沿いを散歩した',
    body: '夕方から鴨川沿いを歩いた。風がぬるくて、もう初夏という感じ。等間隔カップルも健在で、見ているだけで少し笑ってしまった。',
  },
  {
    id: 'seed-2',
    date: new Date(2026, 4, 27),
    mood: '☕️',
    title: '新しい喫茶店',
    body: '河原町二条の小さな喫茶店に入った。深煎りの豆と、店主の選曲がとても良かった。次は本を持って行きたい。',
  },
  {
    id: 'seed-3',
    date: new Date(2026, 4, 24),
    mood: '🌧',
    title: '雨の日の作業',
    body: '一日中雨。家でコードを書いて過ごす。集中はできたけれど、夜になって少しだけ気分が落ちた。明日は外に出よう。',
  },
  {
    id: 'seed-4',
    date: new Date(2026, 4, 21),
    mood: '🍜',
    title: '友人と夕食',
    body: '久しぶりに学生時代の友人とラーメン。お互い違う方向に進んだけれど、話しているとあの頃の距離感に戻る。',
  },
  {
    id: 'seed-5',
    date: new Date(2026, 4, 18),
    mood: '📚',
    title: '読了',
    body: '積んでいた本をやっと読み終えた。後半の展開がとても良くて、読後しばらく動けなかった。',
  },
];

type EntryInput = {
  mood: string;
  title: string;
  body: string;
};

type EntriesContextValue = {
  entries: Entry[];
  addEntry: (input: EntryInput) => void;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(INITIAL_ENTRIES);

  const value = useMemo<EntriesContextValue>(
    () => ({
      entries,
      addEntry: ({ mood, title, body }) => {
        setEntries((prev) => [
          {
            id: `entry-${Date.now()}`,
            date: new Date(),
            mood,
            title,
            body,
          },
          ...prev,
        ]);
      },
    }),
    [entries],
  );

  return (
    <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
  );
}

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) {
    throw new Error('useEntries must be used inside <EntriesProvider>');
  }
  return ctx;
}
