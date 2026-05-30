import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useEntries } from '../store/entries';

const MOODS = ['☀️', '☁️', '🌧', '☕️', '🍜', '📚', '✨', '💭'];

export default function NewEntry() {
  const { addEntry } = useEntries();
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addEntry({ mood, title: title.trim(), body: body.trim() });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>キャンセル</Text>
        </Pressable>
        <Text style={styles.headerTitle}>新しい記録</Text>
        <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave}>
          <Text style={[styles.save, !canSave && styles.saveDisabled]}>
            保存
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>気分</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const active = m === mood;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMood(m)}
                  style={[styles.moodChip, active && styles.moodChipActive]}
                >
                  <Text style={styles.moodEmoji}>{m}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.titleInput}
            placeholder="タイトル"
            placeholderTextColor="#B5AC9F"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          <View style={styles.divider} />

          <TextInput
            style={styles.bodyInput}
            placeholder="今日のこと..."
            placeholderTextColor="#B5AC9F"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PAPER = '#FAF6EE';
const INK = '#2B2A28';
const SUB = '#8A8278';
const ACCENT = '#8B5E3C';
const BORDER = '#E8E0D2';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAPER,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
    letterSpacing: 2,
  },
  cancel: {
    fontSize: 15,
    color: SUB,
  },
  save: {
    fontSize: 15,
    color: ACCENT,
    fontWeight: '600',
  },
  saveDisabled: {
    color: '#C9C0B2',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    color: SUB,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  moodChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  moodChipActive: {
    borderColor: ACCENT,
    backgroundColor: '#FBEFE3',
  },
  moodEmoji: {
    fontSize: 22,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: INK,
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },
  bodyInput: {
    fontSize: 15,
    color: INK,
    lineHeight: 24,
    minHeight: 240,
    paddingTop: 10,
    paddingBottom: 10,
  },
});
