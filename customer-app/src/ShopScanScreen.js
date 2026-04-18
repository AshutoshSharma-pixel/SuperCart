import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCart } from './CartContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export default function ShopScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState(false);
    const [scanned, setScanned] = useState(false);
    const { initSession } = useCart();

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;

        let storeId = null;
        try {
            const json = JSON.parse(data);
            if (json && json.storeId) {
                storeId = parseInt(json.storeId);
            }
        } catch (e) {
            if (!isNaN(data)) {
                storeId = parseInt(data);
            }
        }

        if (!storeId || isNaN(storeId)) {
            if (!scanned) {
                setScanned(true);
                alert('Invalid QR Code. Please scan the Store QR.');
                setTimeout(() => setScanned(false), 2000);
            }
            return;
        }

        setScanned(true);
        const success = await initSession(storeId);
        if (success) {
            setCameraActive(false);
        } else {
            alert('Connection Failed. Please try again.');
            setScanned(false);
        }
    };

    const openCamera = async () => {
        if (!permission) return;
        if (!permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                alert('Camera permission is required');
                return;
            }
        }
        setScanned(false);
        setCameraActive(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut(auth)}>
                <Text style={styles.signOutText}>SIGN OUT</Text>
            </TouchableOpacity>
            <View style={styles.topSection}>
                <Text style={styles.brandTitle}>SUPERCART</Text>
                <Text style={styles.brandSubtitle}>
                    SCAN THE QR CODE AT THE STORE ENTRANCE TO BEGIN YOUR SHOPPING SESSION
                </Text>
            </View>

            <View style={styles.actionSection}>
                <TouchableOpacity style={styles.mainButton} onPress={openCamera}>
                    <Text style={styles.mainButtonText}>SCAN STORE QR</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>POINT CAMERA AT ENTRANCE QR</Text>
            </View>

            <Modal
                visible={cameraActive}
                animationType="slide"
                onRequestClose={() => setCameraActive(false)}
            >
                <SafeAreaView style={styles.cameraContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    />

                    <View style={styles.cameraOverlay}>
                        <Text style={styles.cameraText}>
                            {scanned ? 'CONNECTING...' : 'SCANNING STORE QR'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setCameraActive(false)}
                    >
                        <Text style={styles.closeButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    topSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    brandTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 36,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
        paddingHorizontal: 20,
    },
    actionSection: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        alignItems: 'center',
    },
    mainButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    mainButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    helperText: {
        fontSize: 10,
        color: '#404040',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        fontWeight: '500',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraOverlay: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: 'rgba(23, 23, 23, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#404040',
    },
    cameraText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.2 * 12,
        textTransform: 'uppercase',
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#171717',
        height: 56,
        paddingHorizontal: 32,
        borderRadius: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#404040',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.2 * 13,
        textTransform: 'uppercase',
    },
    signOutBtn: {
        position: 'absolute',
        top: 16,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    signOutText: {
        color: '#FF453A',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
