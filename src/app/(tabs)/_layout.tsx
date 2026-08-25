import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.ink,
                tabBarInactiveTintColor: colors.inkFaint,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: Platform.OS === 'ios' ? 80 : 64,
                        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                        paddingTop: 8,
                    }
                ],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarHideOnKeyboard: true,
                tabBarItemStyle: styles.tabBarItem,
            }}
        >
            {/* B1 — Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
                        </View>
                    ),
                }}
            />
            {/* I1 — Trips */}
            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={20} color={color} />
                        </View>
                    ),
                }}
            />
            {/* B3 — Explore */}
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={20} color={color} />
                        </View>
                    ),
                }}
            />
            {/* J1 — Help */}
            <Tabs.Screen
                name="help"
                options={{
                    title: 'Help',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={focused ? 'headset' : 'headset-outline'} size={20} color={color} />
                        </View>
                    ),
                }}
            />
            {/* K1 — Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Hidden routes — not part of bottom nav */}
            <Tabs.Screen name="activity" options={{ href: null }} />
            <Tabs.Screen name="account" options={{ href: null }} />
            <Tabs.Screen name="services" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    tabBarItem: {
        paddingHorizontal: 4,
    },
    iconWrap: {
        width: 36,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapActive: {
        backgroundColor: colors.surface,
    },
});
