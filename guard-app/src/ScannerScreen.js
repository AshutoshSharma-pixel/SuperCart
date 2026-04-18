import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from './AuthContext';
import { verifyExit } from './api';
import VerificationResult from './VerificationResult';

export default function ScannerScreen() {
    const { guard, logout } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState(null); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!permission?.granted) requestPermission();
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);

        try {
            const res = await verifyExit(data);
            setResult(res);
        } catch (error) {
            setResult({ verified: false, reason: 'Network or configuration error' });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setResult(null);
        setScanned(false);
    };

    if (result) {
        return <VerificationResult result={result} onNext={handleNext} onMismatch={handleNext} />;
    }

    if (!permission || !permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Camera Permission Required</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Camera */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            {/* Top Bar */}
            <SafeAreaView style={styles.topBarContainer} edges={['top']}>
                <View style={styles.topBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.shieldIcon}>🛡</Text>
                        <Text style={styles.headerText}>SUPERCART GUARD</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.systemStatusText}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>

                {/* Prompt Text */}
                <View style={styles.promptContainer}>
                    <Text style={styles.systemOnlineBadge}>SYSTEM ONLINE</Text>
                    <Text style={styles.promptHeadline}>READY TO SCAN CUSTOMER{'\n'}PASS</Text>
                </View>
            </SafeAreaView>

            {/* Viewfinder Overlays */}
            <View style={styles.viewfinderContainer} pointerEvents="none">
                <View style={styles.viewfinderBox}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                
                <View style={styles.tapToScanBadge}>
                    <Text style={styles.tapToScanText}>ALIGN QR INSIDE FRAME</Text>
                </View>
            </View>

            {/* Bottom Stats & Nav */}
            <SafeAreaView style={styles.bottomBarContainer} edges={['bottom']}>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>SHIFT SCANS</Text>
                        <Text style={styles.statValue}>{guard?.shiftScans || 0}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>ALERTS</Text>
                        <Text style={styles.statValue}>0</Text>
                    </View>
                </View>

                <View style={styles.navRow}>
                    <View style={styles.navItem}>
                        <Text style={[styles.navIcon, { color: '#ffffff' }]}>⧈</Text>
                        <Text style={[styles.navText, { color: '#ffffff' }]}>SCANNER</Text>
                    </View>
                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>📜</Text>
                        <Text style={styles.navText}>HISTORY</Text>
                    </View>
                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>👤</Text>
                        <Text style={styles.navText}>ACCOUNT</Text>
                    </View>
                </View>
            </SafeAreaView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>VERIFYING...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
    text: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

    topBarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(10,10,10,0.85)',
    },
    shieldIcon: {
        fontSize: 16,
        color: '#ffffff',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.5,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    systemStatusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 1.5,
    },

    promptContainer: {
        alignItems: 'center',
        paddingTop: 32,
        paddingHorizontal: 24,
    },
    systemOnlineBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: '#22c55e',
        letterSpacing: 2,
        marginBottom: 8,
    },
    promptHeadline: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.5,
        textAlign: 'center',
        lineHeight: 28,
        textTransform: 'uppercase',
    },

    viewfinderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    viewfinderBox: {
        width: 280,
        height: 280,
        backgroundColor: 'rgba(255,255,255,0.05)',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#ffffff',
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },

    tapToScanBadge: {
        backgroundColor: '#1c1c1c',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 40,
    },
    tapToScanText: {
        color: '#a3a3a3',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10,10,10,0.95)',
        zIndex: 10,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        borderRadius: 12,
        padding: 16,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#a3a3a3',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffffff',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#262626',
    },
    navItem: {
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 20,
        color: '#a3a3a3',
        marginBottom: 4,
    },
    navText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#a3a3a3',
        letterSpacing: 1,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 2,
    }
});
