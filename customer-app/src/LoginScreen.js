import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '444825466346-n62vranj2hefecrn8qgoni3kri1v5nmv.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            const googleCredential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, googleCredential);
        } catch (error) {
            setError('Google Sign-In failed. Please try again.');
            console.error('Google Sign-In error:', error);
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
                    {/* Top Brand */}
                    <Text style={styles.brandMark}>SUPERCART</Text>

                    {/* Hero Headline */}
                    <View style={styles.heroSection}>
                        <Text style={styles.headline}>WELCOME{'\n'}BACK</Text>
                        <Text style={styles.subheadline}>
                            Enter your credentials to access your{'\n'}SuperCart account.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Email Field */}
                        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            placeholderTextColor="#474747"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        {/* Password Field */}
                        <View style={styles.labelRow}>
                            <Text style={styles.inputLabel}>PASSWORD</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#474747"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {/* Sign In Button */}
                        <TouchableOpacity 
                            style={styles.signInButton}
                            onPress={handleSignIn}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#1a1c1c" />
                            ) : (
                                <Text style={styles.signInButtonText}>SIGN IN</Text>
                            )}
                        </TouchableOpacity>

                        {/* OR Divider */}
                        <View style={styles.orContainer}>
                            <Text style={styles.orText}>OR</Text>
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity 
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            activeOpacity={0.85}
                        >
                            <Image 
                                source={require('../assets/google_g_logo.png')} 
                                style={styles.googleIcon} 
                                resizeMode="contain"
                            />
                            <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
                        </TouchableOpacity>

                        {/* Create Account Link */}
                        <TouchableOpacity 
                            style={styles.createAccountRow}
                            onPress={handleCreateAccount}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.createAccountPrefix}>New to SuperCart?  </Text>
                            <Text style={styles.createAccountLink}>Create an Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerCopyright}>© 2025 SUPERCART</Text>
                        <View style={styles.footerLinks}>
                            <Text style={styles.footerLink}>PRIVACY</Text>
                            <Text style={styles.footerLinkSpacer}>    </Text>
                            <Text style={styles.footerLink}>TERMS</Text>
                            <Text style={styles.footerLinkSpacer}>    </Text>
                            <Text style={styles.footerLink}>SUPPORT</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 32,
    },

    // ── Brand ──
    brandMark: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 3,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },

    // ── Hero ──
    heroSection: {
        marginTop: 32,
        marginBottom: 40,
    },
    headline: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.02 * 48,
        lineHeight: 52,
        marginBottom: 16,
    },
    subheadline: {
        fontSize: 16,
        fontWeight: '400',
        color: '#c6c6c6',
        lineHeight: 24,
    },

    // ── Form ──
    form: {
        width: '100%',
    },
    errorText: {
        color: '#FF453A',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 16,
        lineHeight: 18,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#c6c6c6',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    forgotText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    input: {
        height: 58,
        backgroundColor: '#0e0e0e',
        borderRadius: 12,
        paddingHorizontal: 20,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(71, 71, 71, 0.15)',
    },

    // ── Sign In ──
    signInButton: {
        height: 58,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    signInButtonText: {
        color: '#1a1c1c',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },

    // ── OR Divider ──
    orContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    orText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#474747',
        letterSpacing: 2,
    },

    // ── Google ──
    googleButton: {
        height: 58,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIcon: {
        width: 18,
        height: 18,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // ── Create Account ──
    createAccountRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    createAccountPrefix: {
        fontSize: 15,
        fontWeight: '400',
        color: '#c6c6c6',
    },
    createAccountLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // ── Footer ──
    footer: {
        alignItems: 'center',
        marginTop: 48,
        paddingBottom: 8,
    },
    footerCopyright: {
        fontSize: 11,
        fontWeight: '400',
        color: '#474747',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        fontSize: 11,
        fontWeight: '500',
        color: '#474747',
        letterSpacing: 1.5,
    },
    footerLinkSpacer: {
        width: 16,
    },
});
