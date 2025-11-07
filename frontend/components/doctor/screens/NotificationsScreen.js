import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import * as Notifications from 'expo-notifications';
import { notifications as initialNotifications } from '../data/sampleData';

const COLORS = {
  primary: '#311B92',
  secondary: '#880E4F',
  tertiary: '#1B5E20',
  danger: '#B71C1C',
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
  darkyellow: '#b88600',
};

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
      priority: 'medium',
    };
    setNotifications([newNotification, ...notifications]);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'reminder': return 'bell-ring';
      case 'alert': return 'alert-circle';
      case 'update': return 'information';
      default: return 'bell';
    }
  };

  const getColorForPriority = (priority) => {
    switch (priority) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.darkyellow;
      case 'low': return COLORS.tertiary;
      default: return COLORS.primary;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background || COLORS.lightGray, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { backgroundColor: theme.card || COLORS.white }]}>
        <Title style={[styles.headerTitle, { color: theme.text }]}>Notifications</Title>
        <Chip
          mode="flat"
          style={[styles.countChip, { backgroundColor: COLORS.primary }]}
          textStyle={{ color: COLORS.white }}
        >
          {unreadCount} unread
        </Chip>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((n) => (
          <TouchableOpacity key={n.id} onPress={() => markAsRead(n.id)}>
            <Card
              style={[
                styles.notificationCard,
                { backgroundColor: theme.card || COLORS.white },
              ]}
              elevation={2}
            >
              <Card.Content>
                <View style={styles.notificationHeader}>
                  <Avatar.Icon
                    size={42}
                    icon={getIconForType(n.type)}
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: getColorForPriority(n.priority) },
                    ]}
                  />
                  <View style={styles.notificationContent}>
                    <Title style={[styles.notificationTitle, { color: theme.text }]}>
                      {n.title}
                    </Title>
                    <Paragraph
                      style={[styles.notificationMessage, { color: theme.textSecondary }]}
                    >
                      {n.message}
                    </Paragraph>
                    <View style={styles.metaRow}>
                      <Chip
                        mode="outlined"
                        style={styles.typeChip}
                        textStyle={styles.chipText}
                      >
                        {n.type}
                      </Chip>
                      <Paragraph style={styles.timestampText}>
                        {formatTimestamp(n.timestamp)}
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
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={sendTestNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },

  headerTitle: { fontSize: 24, fontWeight: '700' },
  countChip: { borderRadius: 8 },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  notificationCard: {
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  notificationIcon: { marginRight: 12 },
  notificationContent: { flex: 1 },

  notificationTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  notificationMessage: { fontSize: 14, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  typeChip: {
    backgroundColor: COLORS.lightGray,
    height: 28,
    borderRadius: 8,
  },
  chipText: { fontSize: 11 },
  timestampText: { fontSize: 12, color: '#777' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { backgroundColor: COLORS.gray, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#777' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 16,
    elevation: 5,
  },
});
