import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';

export default function ShopDetailsScreen() {
    const { session, startShopping, resetSession } = useCart();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    if (!session) return null;

    const isActive = !!session;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.content}>
                <View style={styles.centerBlock}>
                    <Text style={styles.storeName}>
                        {session?.store?.name || 'YOUR STORE'}
                    </Text>
                    <Text style={styles.location}>
                        {(session?.store?.location || 'MAIN BRANCH').toUpperCase()}
                    </Text>
                    <View style={styles.pillBadge}>
                        <Animated.View style={[
                            styles.pillDot,
                            { backgroundColor: isActive ? '#30D158' : '#FF453A', opacity: pulseAnim }
                        ]} />
                        <Text style={styles.pillText}>{isActive ? 'SESSION ACTIVE' : 'SESSION INACTIVE'}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={startShopping}
                    >
                        <Text style={styles.startButtonText}>START SHOPPING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={resetSession}
                    >
                        <Text style={styles.cancelButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 48,
    },
    centerBlock: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storeName: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 48,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 12,
    },
    location: {
        fontSize: 11,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 11,
        fontWeight: '500',
        marginBottom: 24,
    },
    pillBadge: {
        backgroundColor: '#171717',
        borderWidth: 1,
        borderColor: '#404040',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    pillText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3 * 10,
    },
    actions: {
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    startButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: '#FF453A',
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 13,
    },
});
