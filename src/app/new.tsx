import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

const ICONS = ['📝', '😊', '☔', '☕', '🌙', '🌿', '✨', '📚'];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewEntry() {
  const { addEntry } = useEntries();
  const [icon, setIcon] = useState(ICONS[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(todayString());
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await addEntry({ icon, title, body, date, imageUrl });
      router.replace({ pathname: '/[id]', params: { id: saved.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>キャンセル</Text>
        </Pressable>
        <Text style={styles.headerTitle}>新しい日記</Text>
        <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave || saving}>
          <Text style={[styles.save, (!canSave || saving) && styles.saveDisabled]}>
            保存
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>アイコン</Text>
          <View style={styles.iconRow}>
            {ICONS.map((item) => {
              const active = item === icon;
              return (
                <Pressable
                  key={item}
                  onPress={() => setIcon(item)}
                  style={[styles.iconChip, active && styles.iconChipActive]}
                >
                  <Text style={styles.iconText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>日付</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9A948C"
            value={date}
            onChangeText={setDate}
            inputMode="numeric"
          />

          <Text style={styles.label}>タイトル</Text>
          <TextInput
            style={styles.input}
            placeholder="今日のタイトル"
            placeholderTextColor="#9A948C"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          <Text style={styles.label}>本文</Text>
          <TextInput
            style={[styles.input, styles.bodyInput]}
            placeholder="今日の出来事や気持ち"
            placeholderTextColor="#9A948C"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>画像URL 任意</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor="#9A948C"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            inputMode="url"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {saving ? (
            <View style={styles.saving}>
              <ActivityIndicator color="#5C7D6B" />
              <Text style={styles.savingText}>保存しています</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '700',
  },
  cancel: {
    color: SUB,
    fontSize: 15,
  },
  save: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '700',
  },
  saveDisabled: {
    color: '#BDB3A6',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: SUB,
    fontSize: 13,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  iconChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  iconChipActive: {
    backgroundColor: '#E8F0EA',
    borderColor: ACCENT,
  },
  iconText: {
    fontSize: 22,
  },
  label: {
    color: SUB,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: INK,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bodyInput: {
    lineHeight: 24,
    minHeight: 180,
  },
  error: {
    color: '#B23B3B',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 16,
  },
  saving: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  savingText: {
    color: SUB,
    fontSize: 14,
  },
});
