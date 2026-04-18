import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.wordmark}>SUPERCART</Text>
                        <Text style={styles.subtitle}>SMART SHOPPING</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.form}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        
                        <TextInput
                            style={styles.input}
                            placeholder="EMAIL ADDRESS"
                            placeholderTextColor="#404040"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="PASSWORD"
                            placeholderTextColor="#404040"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity 
                            style={styles.signInButton}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.signInButtonText}>SIGN IN</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.createButton}
                            onPress={handleCreateAccount}
                            disabled={loading}
                        >
                            <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.googleButton}
                            onPress={() => alert('Google Sign-In integration coming soon')}
                        >
                            <Image 
                                source={require('../assets/google_g_logo.png')} 
                                style={styles.googleIcon} 
                                resizeMode="contain"
                            />
                            <View style={styles.googleTextContainer}>
                                <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
                                <Text style={styles.comingSoonText}>(Coming Soon)</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flex: 0.35,
        minHeight: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordmark: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 42,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 10,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        fontWeight: '500',
        marginBottom: 24,
    },
    dividerLine: {
        width: 48,
        height: 1,
        backgroundColor: '#404040',
    },
    form: {
        width: '100%',
    },
    errorText: {
        color: '#ff453a',
        fontSize: 12,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    input: {
        height: 56,
        backgroundColor: '#171717',
        borderRadius: 12,
        paddingHorizontal: 18,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2 * 13,
        marginBottom: 12,
    },
    signInButton: {
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    signInButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    createButton: {
        height: 56,
        backgroundColor: '#171717',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#404040',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    googleButton: {
        height: 56,
        backgroundColor: '#171717',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#404040',
    },
    googleTextContainer: {
        alignItems: 'center',
    },
    googleButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 13,
    },
    comingSoonText: {
        color: '#a3a3a3',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 2,
    },
    googleIcon: {
        width: 18,
        height: 18,
        marginRight: 12,
    },
});
