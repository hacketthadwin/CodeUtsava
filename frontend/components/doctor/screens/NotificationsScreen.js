import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, Button, Divider, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import * as Notifications from 'expo-notifications';
import { notifications as initialNotifications } from '../data/sampleData';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from PHC Dashboard',
        data: { type: 'test' },
      },
      trigger: { seconds: 2 },
    });

    const newNotification = {
      id: Date.now(),
      type: 'alert',
      title: 'Test Notification Sent',
      message: 'A test notification will appear in 2 seconds',
      timestamp: new Date(),
      read: false,
      priority: 'medium'
    };

    setNotifications([newNotification, ...notifications]);
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'reminder':
        return 'bell-ring';
      case 'alert':
        return 'alert-circle';
      case 'update':
        return 'information';
      default:
        return 'bell';
    }
  };

  const getColorForPriority = (priority) => {
    switch(priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#6200ee';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return notifDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Title style={styles.headerTitle}>Notifications</Title>
          <Chip mode="flat" style={styles.countChip}>
            {unreadCount} unread
          </Chip>
        </View>
        {unreadCount > 0 && (
          <Button mode="text" onPress={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </View>

      <ScrollView>
        {notifications.map((notification) => (
          <TouchableOpacity 
            key={notification.id} 
            onPress={() => markAsRead(notification.id)}
          >
            <Card 
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
            >
              <Card.Content>
                <View style={styles.notificationHeader}>
                  <Avatar.Icon 
                    size={40} 
                    icon={getIconForType(notification.type)}
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: getColorForPriority(notification.priority) }
                    ]}
                  />
                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <Title style={styles.notificationTitle}>{notification.title}</Title>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Paragraph style={styles.notificationMessage}>
                      {notification.message}
                    </Paragraph>
                    <View style={styles.metaRow}>
                      <Chip 
                        mode="outlined" 
                        style={styles.typeChip}
                        textStyle={styles.chipText}
                      >
                        {notification.type}
                      </Chip>
                      <Paragraph style={styles.timestampText}>
                        {formatTimestamp(notification.timestamp)}
                      </Paragraph>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={64} icon="bell-outline" style={styles.emptyIcon} />
            <Paragraph style={styles.emptyText}>No notifications yet</Paragraph>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="bell-plus"
        label="Test Notification"
        style={styles.fab}
        onPress={sendTestNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    marginRight: 12,
  },
  countChip: {
    backgroundColor: '#6200ee',
  },
  notificationCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200ee',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    height: 28,
    backgroundColor: '#f0f0f0',
  },
  chipText: {
    fontSize: 11,
    color: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyIcon: {
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
