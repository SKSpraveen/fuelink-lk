import API from '@/api/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatListScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userRes = await API.get('/auth/me');
        const currentUserId = userRes.data.user.id || userRes.data.user.userId || userRes.data.user._id;

        const msgRes = await API.get(`/chats/messages/${currentUserId}`);
        const allMessages = msgRes.data.data;

        // Group messages by conversation partner
        const chatMap = new Map();
        
        allMessages.forEach((msg: any) => {
          const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
          
          if (!chatMap.has(partnerId)) {
            chatMap.set(partnerId, msg);
          } else {
            const existing = chatMap.get(partnerId);
            if (new Date(msg.createdAt) > new Date(existing.createdAt)) {
              chatMap.set(partnerId, msg);
            }
          }
        });

        const recentChats = Array.from(chatMap.values()).map((msg: any) => ({
          partnerId: msg.senderId === currentUserId ? msg.receiverId : msg.senderId,
          lastMessage: msg.message,
          timestamp: msg.createdAt,
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setChats(recentChats);
      } catch (err) {
        console.error('Failed to load chats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#208AEF" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={item => item.partnerId}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [styles.chatCard, pressed && styles.chatCardPressed]}
                onPress={() => router.push(`/messages/${item.partnerId}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>Conversation</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
                </View>
                <Text style={styles.chevron}>➔</Text>
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>No active conversations</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  container: { flex: 1, paddingHorizontal: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 10, paddingBottom: 20 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  chatCardPressed: { backgroundColor: '#1F2937' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1A2640',
    borderWidth: 1, borderColor: '#208AEF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: { fontSize: 20 },
  chatInfo: { flex: 1 },
  chatName: { color: '#F9FAFB', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  lastMessage: { color: '#9CA3AF', fontSize: 14 },
  chevron: { color: '#4B5563', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
});
