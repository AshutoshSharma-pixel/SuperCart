import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!phone || !password) {
            setError('Please enter both phone number and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const success = await login(phone, password);
            if (!success) {
                setError('Invalid credentials');
            }
        } catch (e) {
            setError(e.response?.data?.error || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* SC Monogram */}
                    <View style={styles.monogram}>
                        <Text style={styles.monogramIcon}>🛡</Text>
                    </View>

                    {/* Brand Title */}
                    <Text style={styles.brandTitle}>SUPERCART{'\n'}GUARD</Text>
                    <Text style={styles.brandSubtitle}>SECURE AUTHENTICATION SYSTEM</Text>

                    {/* Form */}
                    <View style={styles.form}>
                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}

                        {/* Phone */}
                        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="+91XXXXXXXXXX"
                                placeholderTextColor="#404040"
                                value={phone}
                                onChangeText={setPhone}
                                autoCapitalize="none"
                                keyboardType="phone-pad"
                            />
                            <Text style={styles.inputIcon}>📞</Text>
                        </View>

                        {/* Password */}
                        <Text style={styles.inputLabel}>SECURITY KEY</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#404040"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <Text style={styles.inputIcon}>🔐</Text>
                        </View>

                        {/* Request Credentials Link */}
                        <TouchableOpacity style={styles.requestLink}>
                            <Text style={styles.requestLinkText}>REQUEST CREDENTIALS</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#0a0a0a" />
                            ) : (
                                <Text style={styles.loginButtonText}>LOGIN  →</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Dots */}
                    <View style={styles.dotsRow}>
                        <View style={[styles.dot, styles.dotActive]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 40,
        justifyContent: 'center',
    },

    // ── Monogram ──
    monogram: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    monogramIcon: {
        fontSize: 22,
    },

    // ── Brand ──
    brandTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        lineHeight: 38,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    brandSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#737373',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 48,
    },

    // ── Form ──
    form: {
        width: '100%',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 16,
        lineHeight: 18,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#a3a3a3',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    inputWrapper: {
        position: 'relative',
        marginBottom: 24,
    },
    input: {
        height: 56,
        backgroundColor: '#141414',
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingRight: 48,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '400',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
        fontSize: 18,
        opacity: 0.4,
    },

    // ── Request Credentials ──
    requestLink: {
        alignItems: 'flex-end',
        marginBottom: 32,
        marginTop: -8,
    },
    requestLinkText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#737373',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // ── Login Button ──
    loginButton: {
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#0a0a0a',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },

    // ── Dots ──
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2a2a2a',
    },
    dotActive: {
        backgroundColor: '#737373',
    },
});
