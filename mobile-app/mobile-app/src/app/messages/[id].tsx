import API from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // This is the other user's ID
  const { userToken } = useAuth(); // Assume we just need auth context for api calls
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/chats/messages/${id}`);
      setMessages(response.data.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    try {
      // Fetch my ID via API to avoid React Native base64 parsing issues
      const userRes = await API.get('/auth/me');
      const myId = userRes.data.user.id || userRes.data.user.userId || userRes.data.user._id;

      await API.post('/chats/message', {
        senderId: myId,
        receiverId: id,
        message: inputText.trim(),
      });
      setInputText('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.receiverId === id; // If receiver is the other person, then I am sender.
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#208AEF" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            inverted={false}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage} disabled={sending || !inputText.trim()}>
            <Text style={styles.sendBtnText}>{sending ? '...' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937', backgroundColor: '#111827' },
  headerTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 32 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#208AEF', borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#1F2937', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15 },
  myMessageText: { color: '#FFFFFF' },
  theirMessageText: { color: '#D1D5DB' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1F2937' },
  input: { flex: 1, backgroundColor: '#1F2937', color: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12 },
  sendBtn: { backgroundColor: '#208AEF', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
