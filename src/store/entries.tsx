import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createDiaryEntry,
  fetchDiaryEntries,
  updateDiaryEntry,
  type DiaryEntryPayload,
} from '../services/firebase';

export type Entry = {
  id: string;
  icon: string;
  title: string;
  body: string;
  date: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type EntryInput = {
  icon: string;
  title: string;
  body: string;
  date: string;
  imageUrl?: string;
};

type EntriesContextValue = {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  addEntry: (input: EntryInput) => Promise<Entry>;
  updateEntry: (id: string, input: EntryInput) => Promise<Entry>;
  getEntry: (id: string) => Entry | undefined;
  searchEntries: (query: string) => Entry[];
  refreshEntries: () => Promise<void>;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

function sortEntries(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function normalize(input: EntryInput): DiaryEntryPayload {
  return {
    icon: input.icon.trim() || '📝',
    title: input.title.trim(),
    body: input.body.trim(),
    date: input.date,
    imageUrl: input.imageUrl?.trim() || undefined,
  };
}

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchDiaryEntries();
      setEntries(sortEntries(fetched));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '日記の読み込みに失敗しました。',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshEntries();
  }, [refreshEntries]);

  const addEntry = useCallback(async (input: EntryInput) => {
    const saved = await createDiaryEntry(normalize(input));
    setEntries((prev) => sortEntries([saved, ...prev]));
    return saved;
  }, []);

  const updateEntry = useCallback(async (id: string, input: EntryInput) => {
    const saved = await updateDiaryEntry(id, normalize(input));
    setEntries((prev) =>
      sortEntries(prev.map((entry) => (entry.id === id ? saved : entry))),
    );
    return saved;
  }, []);

  const getEntry = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries],
  );

  const searchEntries = useCallback(
    (query: string) => {
      const keyword = query.trim().toLowerCase();
      if (!keyword) return entries;
      return entries.filter((entry) =>
        [entry.title, entry.body, entry.date, entry.icon]
          .join(' ')
          .toLowerCase()
          .includes(keyword),
      );
    },
    [entries],
  );

  const value = useMemo<EntriesContextValue>(
    () => ({
      entries,
      loading,
      error,
      addEntry,
      updateEntry,
      getEntry,
      searchEntries,
      refreshEntries,
    }),
    [
      addEntry,
      entries,
      error,
      getEntry,
      loading,
      refreshEntries,
      searchEntries,
      updateEntry,
    ],
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
