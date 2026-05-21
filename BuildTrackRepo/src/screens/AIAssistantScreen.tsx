/**
 * AI construction assistant powered by OpenAI
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components';
import { askAI } from '../services/openaiService';
import { isOpenAIConfigured } from '../config/env';
import { Colors, Typography, spacing } from '../theme';
import type { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  'How much cement is left?',
  'Which tasks are delayed?',
  'Show project progress summary.',
  'Predict material shortages.',
  'Suggest workflow improvements.',
];

export function AIAssistantScreen() {
  const { projects, materials, tasks } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**BuildTrack AI** ready.\n\nAsk me about materials, tasks, project progress, or workflow optimization.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAI(userText, { projects, materials, tasks });
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {!isUser && (
          <Ionicons
            name="sparkles"
            size={16}
            color={Colors.burntOrange}
            style={styles.aiIcon}
          />
        )}
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.content.replace(/\*\*/g, '')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="AI Assistant"
        subtitle={
          isOpenAIConfigured()
            ? 'Powered by OpenAI'
            : 'Demo mode — connect API key for full AI'
        }
      />

      {/* Suggested prompts */}
      <FlatList
        horizontal
        data={SUGGESTED_PROMPTS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.prompts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.promptChip}
            onPress={() => sendMessage(item)}
          >
            <Text style={styles.promptText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={renderMessage}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
      />

      {loading && (
        <View style={styles.typing}>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.burntOrange} />
          <Text style={styles.typingText}>AI is thinking...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask BuildTrack AI..."
            placeholderTextColor={Colors.lightGrey}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={22} color={Colors.softWhite} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  prompts: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  promptChip: {
    backgroundColor: Colors.steelGrey,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  promptText: {
    color: Colors.burntOrange,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  messages: { padding: spacing.md, paddingBottom: spacing.sm, flexGrow: 1 },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.burntOrange,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.steelGrey,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
    borderBottomLeftRadius: 4,
  },
  aiIcon: { marginBottom: spacing.xs },
  messageText: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
  },
  userText: { color: Colors.softWhite },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  typingText: { color: Colors.lightGrey, fontSize: Typography.sizes.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.graphiteBorder,
    backgroundColor: Colors.charcoalBlack,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.steelGrey,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: Colors.softWhite,
    maxHeight: 100,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.md,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.burntOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
