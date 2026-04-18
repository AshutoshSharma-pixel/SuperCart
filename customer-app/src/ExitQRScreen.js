import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';

const { width } = Dimensions.get('window');

export default function ExitQRScreen({ token }) {
    const { downloadBill, cart, total } = useCart();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>THANKS FOR{'\n'}SHOPPING</Text>
                <Text style={styles.subtitle}>SHOW THIS PASS TO EXIT THE STORE</Text>
            </View>

            <View style={styles.passCard}>
                <View style={styles.passHeader}>
                    <View>
                        <Text style={styles.passHeaderLabel}>EXIT PASS</Text>
                        <Text style={styles.passHeaderValue}>SUPERCART</Text>
                    </View>
                    <View style={styles.passHeaderRight}>
                        <Text style={styles.passHeaderLabel}>ITEMS</Text>
                        <Text style={styles.passHeaderValue}>{cart?.length || 0}</Text>
                    </View>
                </View>

                <View style={styles.passBody}>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={token}
                            size={width * 0.45}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                        />
                    </View>
                    <Text style={styles.transactionId}>
                        {token ? token.substring(0, 24).toUpperCase() : '—'}
                    </Text>
                    <View style={styles.passDivider} />
                    <View style={styles.passFooterRow}>
                        <View>
                            <Text style={styles.passFooterLabel}>DATE</Text>
                            <Text style={styles.passFooterValue}>
                                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.passFooterRight}>
                            <Text style={styles.passFooterLabel}>TOTAL</Text>
                            <Text style={styles.passFooterValue}>₹{total}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={downloadBill}
                >
                    <Text style={styles.downloadButtonText}>DOWNLOAD INVOICE</Text>
                </TouchableOpacity>

                <Text style={styles.warningText}>VALID FOR SINGLE USE ONLY</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
        paddingBottom: 32,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        fontSize: 44,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 44,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 10,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    passCard: {
        marginHorizontal: 24,
        backgroundColor: '#171717',
        borderRadius: 32,
        overflow: 'hidden',
    },
    passHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    passHeaderLabel: {
        fontSize: 9,
        color: '#a3a3a3',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3 * 9,
        marginBottom: 2,
    },
    passHeaderValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000000',
        textTransform: 'uppercase',
    },
    passHeaderRight: {
        alignItems: 'flex-end',
    },
    passBody: {
        padding: 24,
        alignItems: 'center',
    },
    qrWrapper: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    transactionId: {
        fontSize: 11,
        color: '#FFFFFF',
        fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 16,
    },
    passDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#262626',
        marginBottom: 16,
    },
    passFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    passFooterLabel: {
        fontSize: 9,
        color: '#a3a3a3',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3 * 9,
        marginBottom: 2,
    },
    passFooterValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    passFooterRight: {
        alignItems: 'flex-end',
    },
    actions: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    downloadButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    downloadButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    warningText: {
        color: '#404040',
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
    },
});
