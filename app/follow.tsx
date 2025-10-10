import { FollowUser } from '@/constants/followData';
import { FollowType, useFollow } from '@/hooks/useFollow';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tách SearchBar thành component riêng và memo
const SearchBar = React.memo(({ 
  searchQuery, 
  onSearchChange 
}: { 
  searchQuery: string; 
  onSearchChange: (text: string) => void;
}) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery !== '' && (
        <TouchableOpacity onPress={() => onSearchChange('')}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
});

// Tách TabNavigation thành component riêng và memo
const TabNavigation = React.memo(({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: FollowType; 
  onTabChange: (tab: FollowType) => void;
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
        onPress={() => onTabChange('followers')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'followers' && styles.activeTabText,
          ]}
        >
          Người theo dõi
        </Text>
        {activeTab === 'followers' && (
          <View style={styles.tabIndicator} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'following' && styles.activeTab]}
        onPress={() => onTabChange('following')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'following' && styles.activeTabText,
          ]}
        >
          Đang theo dõi
        </Text>
        {activeTab === 'following' && (
          <View style={styles.tabIndicator} />
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function FollowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialTab = (params.type as FollowType) || 'followers';
  const userId = (params.userId as string) || '1';

  const [activeTab, setActiveTab] = useState<FollowType>(initialTab);

  const followersData = useFollow(userId, 'followers');
  const followingData = useFollow(userId, 'following');

  const currentData = activeTab === 'followers' ? followersData : followingData;

  const handleUserPress = useCallback((user: FollowUser) => {
    router.push({
      pathname: '/user',
      params: { id: user.id }
    });
  }, []);

  const handleFollowPress = useCallback((user: FollowUser) => {
    if (user.isFollowing) {
      Alert.alert(
        'Bỏ theo dõi',
        `Bạn có chắc muốn bỏ theo dõi ${user.name}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Bỏ theo dõi',
            style: 'destructive',
            onPress: () => currentData.handleUnfollow(user.id),
          },
        ]
      );
    } else {
      currentData.handleFollow(user.id);
    }
  }, [currentData]);

  const renderUserItem = useCallback(({ item }: { item: FollowUser }) => {
    const isLoading = currentData.actionLoading === item.id;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userUsername} numberOfLines={1}>
            {item.username}
          </Text>
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
          {item.mutualFollowers && item.mutualFollowers > 0 && (
            <Text style={styles.mutualText}>
              {item.mutualFollowers} người theo dõi chung
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.followButton,
              item.isFollowing && styles.followingButton,
            ]}
            onPress={() => handleFollowPress(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  item.isFollowing && styles.followingButtonText,
                ]}
              >
                {item.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [activeTab, currentData.actionLoading, handleUserPress, handleFollowPress]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === 'followers' ? 'people-outline' : 'person-add-outline'}
        size={64}
        color="#d1d5db"
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'followers'
          ? 'Chưa có người theo dõi'
          : 'Chưa theo dõi ai'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'followers'
          ? 'Khi có người theo dõi bạn, họ sẽ hiển thị ở đây'
          : 'Hãy bắt đầu theo dõi những người bạn quan tâm'}
      </Text>
    </View>
  ), [activeTab]);

  // Memoize header để tránh re-create
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.headerContainer}>
      <SearchBar 
        searchQuery={currentData.searchQuery}
        onSearchChange={currentData.handleSearch}
      />
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  ), [currentData.searchQuery, currentData.handleSearch, activeTab]);

  if (currentData.loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Follow</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Follow</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        data={currentData.users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          currentData.users.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={currentData.refreshing}
            onRefresh={currentData.onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  activeTab: {
    // Active state
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563eb',
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  mutualText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#fef2f2',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#f3f4f6',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  followingButtonText: {
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});