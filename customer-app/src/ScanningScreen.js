import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCart } from './CartContext';
import api from './api';

export default function ScanningScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState(false);
    const [scanned, setScanned] = useState(false);

    const { addItem, cart, proceedToReview, resetSession, refreshCart, session } = useCart();

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);

        const success = await addItem(data);

        // Close camera and reset after 1 second
        setTimeout(() => {
            setCameraActive(false);
            setScanned(false);
        }, 1000);
    };

    const updateQuantity = async (productId, currentQty, delta) => {
        const newQty = currentQty + delta;
        try {
            if (newQty <= 0) {
                await api.post('/cart/remove', {
                    sessionId: session.id,
                    productId: productId
                });
            } else {
                console.log('PUT payload:', JSON.stringify({ sessionId: session.id, productId, quantity: newQty, currentQty, delta }));
                await api.put('/cart/quantity', {
                    sessionId: session.id,
                    productId: productId,
                    quantity: newQty
                });
            }
            await refreshCart(session.id);
        } catch (error) {
            console.error('Update Quantity Error:', error);
            alert('Failed to update quantity');
        }
    };

    const openCamera = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                alert('Camera permission is required to scan barcodes');
                return;
            }
        }
        setScanned(false);
        setCameraActive(true);
    };

    const itemCount = cart?.length || 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>SHOPPING AT</Text>
                    <Text style={styles.headerTitle}>
                        {(session?.store?.name || 'Store').toUpperCase()}
                    </Text>
                </View>
                <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{itemCount} ITEMS</Text>
                </View>
            </View>

            <View style={styles.listContainer}>
                {cart.length > 0 ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {cart.slice(-3).reverse().map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>₹{item.cart_item.finalPriceSnapshot || item.price}</Text>
                                </View>
                                
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity 
                                        style={styles.qtyBtn}
                                        onPress={() => updateQuantity(item.cart_item.productId, item.cart_item.quantity, -1)}
                                    >
                                        <Text style={styles.qtyBtnText}>-</Text>
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.qtyValue}>{item.cart_item.quantity}</Text>
                                    
                                    <TouchableOpacity 
                                        style={styles.qtyBtn}
                                        onPress={() => updateQuantity(item.cart_item.productId, item.cart_item.quantity, 1)}
                                    >
                                        <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>NO ITEMS YET</Text>
                        <Text style={styles.emptySubtitle}>TAP BELOW TO SCAN YOUR FIRST PRODUCT</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={openCamera}
                >
                    <Text style={styles.scanButtonText}>SCAN ITEM</Text>
                </TouchableOpacity>

                {cart.length > 0 && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={proceedToReview}
                    >
                        <Text style={styles.reviewButtonText}>REVIEW & PAY</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetSession}
                >
                    <Text style={styles.cancelButtonText}>Cancel Session</Text>
                </TouchableOpacity>
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
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8"] }}
                    />

                    <View style={styles.cameraOverlay}>
                        <Text style={styles.cameraText}>
                            {scanned ? 'SCANNED!' : 'SCANNING BARCODE'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setCameraActive(false)}
                    >
                        <Text style={styles.closeButtonText}>CLOSE</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
    },
    headerSubtitle: {
        fontSize: 9,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.3 * 9,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    itemBadge: {
        backgroundColor: '#171717',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#404040',
    },
    itemBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.2 * 10,
        textTransform: 'uppercase',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        padding: 24,
    },
    itemCard: {
        backgroundColor: '#171717',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#262626',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 13,
        color: '#a3a3a3',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#262626',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '900',
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        marginHorizontal: 14,
        minWidth: 24,
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    emptySubtitle: {
        fontSize: 10,
        color: '#a3a3a3',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        lineHeight: 18,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        backgroundColor: '#000000',
        borderTopWidth: 1,
        borderTopColor: '#262626',
    },
    scanButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    scanButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    reviewButton: {
        backgroundColor: '#171717',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#404040',
    },
    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    cancelButton: {
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#ff453a',
        fontSize: 12,
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
});
