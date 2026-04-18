import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCart } from './CartContext';

import PaymentScreen from './PaymentScreen';

export default function ProductScanScreen({ navigation }) {
    const [permission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const { addItem, cart, total, initiateCheckout, verifyCheckout, loading } = useCart();
    const [cameraActive, setCameraActive] = useState(true);

    // Payment UI State
    const [paymentVisible, setPaymentVisible] = useState(false);
    const [paymentOptions, setPaymentOptions] = useState(null);

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned || loading || paymentVisible) return;
        setScanned(true);

        // Add Item
        const success = await addItem(data);

        // Small delay before next scan
        setTimeout(() => setScanned(false), 1500);
    };

    const handlePayPress = async () => {
        const options = await initiateCheckout();
        if (options) {
            setPaymentOptions(options);
            setPaymentVisible(true);
            setCameraActive(false); // Pause Camera for performance
        }
    };

    const handlePaymentSuccess = async (data) => {
        setPaymentVisible(false);
        setCameraActive(true);
        await verifyCheckout(data);
    };

    const handlePaymentCancel = () => {
        setPaymentVisible(false);
        setCameraActive(true);
        alert('Payment Cancelled');
    };

    // Render Cart Item
    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.cart_item.priceSnapshot}</Text>
            </View>
            <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>x{item.cart_item.quantity}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Top Camera View */}
            <View style={styles.cameraContainer}>
                {cameraActive && (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
                    />
                )}
                <View style={styles.scanOverlay}>
                    <Text style={styles.scanText}>{scanned ? 'Processing...' : 'Scan Product Barcode'}</Text>
                </View>
            </View>

            {/* Cart List */}
            <View style={styles.cartContainer}>
                <Text style={styles.cartTitle}>Your Cart ({cart.length} items)</Text>
                <FlatList
                    data={cart}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>₹{total}</Text>
                    </View>
                    <TouchableOpacity style={styles.payBtn} onPress={handlePayPress} disabled={loading || cart.length === 0}>
                        <Text style={styles.payText}>{loading ? '...' : `Pay ₹${total}`}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Payment Modal */}
            <PaymentScreen
                visible={paymentVisible}
                paymentOptions={paymentOptions}
                onVerify={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    cameraContainer: { height: '35%', backgroundColor: '#000', overflow: 'hidden' },
    scanOverlay: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
    scanText: { color: '#fff', fontWeight: '600' },

    cartContainer: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: '#F3F4F6', paddingTop: 20 },
    cartTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, color: '#111827' },
    list: { paddingHorizontal: 20 },

    itemRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    itemPrice: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    qtyBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    qtyText: { fontWeight: 'bold', color: '#374151' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 12, color: '#6B7280' },
    totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    payBtn: { backgroundColor: '#10B981', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
    payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
