import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

// Theme Settings Component
const Themes = () => {
    const insets = useSafeAreaInsets();
    const { isDarkMode, theme, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Theme Settings</Text>
            
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.settingRow}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: theme.primary }}
                        thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                    />
                </View>
                
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                    Toggle between light and dark theme for better viewing experience.
                </Text>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    previewCard: {
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    colorSwatch: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    swatchText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Themes;
