import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function VerificationResult({ result, onNext, onMismatch }) {
    if (!result) return null;

    const isApproved = result.verified;

    // APPROVED UI
    if (isApproved) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                
                {/* Top 40% - Green */}
                <View style={[styles.topSection, { backgroundColor: '#16a34a' }]}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>✓</Text>
                    </View>
                    <Text style={styles.titleText}>APPROVED</Text>
                    <Text style={styles.subtitleText}>VERIFICATION SUCCESSFUL</Text>
                </View>

                {/* Bottom 60% - Dark */}
                <View style={styles.bottomSection}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionLabel}>CART SUMMARY</Text>
                        
                        <View style={styles.itemsList}>
                            {result.items?.map((item, idx) => (
                                <View key={idx} style={styles.itemRow}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.totalItemsRow}>
                            <Text style={styles.sectionLabel}>TOTAL ITEMS</Text>
                            <Text style={styles.totalItemsNumber}>{String(result.totalItems || 0).padStart(2, '0')}</Text>
                        </View>

                        <View style={styles.amountCard}>
                            <Text style={styles.sectionLabel}>VERIFICATION AMOUNT</Text>
                            <Text style={styles.amountText}>₹{(result.session?.totalAmount || result.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>TIME</Text>
                                <Text style={styles.infoValue}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                            </View>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>SESSION ID</Text>
                                <Text style={styles.infoValue}>#SCG-{String(result.session?.id || result.sessionId || '0000').padStart(4, '0')}</Text>
                            </View>
                        </View>

                        <View style={styles.customerCard}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarIcon}>👤</Text>
                            </View>
                            <View style={styles.customerDetails}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={styles.customerName}>Customer</Text>
                                    <Text style={{ fontSize: 10 }}>✅</Text>
                                </View>
                                <Text style={styles.customerStatus}>Verified Shopper</Text>
                            </View>
                        </View>
                    </ScrollView>

                    <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
                        <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.85}>
                            <Text style={styles.primaryButtonText}>[QR] NEXT SCAN</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </View>
        );
    }

    // DENIED UI
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Top 40% - Red */}
            <View style={[styles.topSection, { backgroundColor: '#991b1b', justifyContent: 'center' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#fecaca' }]}>
                    <View style={styles.slashLine} />
                </View>
                <Text style={[styles.titleText, { fontStyle: 'italic' }]}>DENIED</Text>
                
                <View style={styles.stopBadge}>
                    <Text style={styles.stopBadgeText}>STOP</Text>
                </View>
            </View>

            {/* Bottom 60% - Dark */}
            <View style={styles.bottomSection}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Text style={styles.deniedAlertText}>DO NOT ALLOW EXIT</Text>
                    <Text style={styles.deniedReasonText}>
                        A critical payment mismatch has been detected. The items in the physical cart do not correspond with the verified transaction digital receipt.
                        {'\n\n'}Reason: {result.reason || 'Unknown error'}
                    </Text>

                    <View style={styles.errorCard}>
                        <Text style={styles.infoLabel}>ERROR CODE</Text>
                        <Text style={styles.errorCodeValue}>ERR_PMT_094</Text>
                    </View>

                    <View style={styles.errorCard}>
                        <Text style={styles.infoLabel}>VARIANCE</Text>
                        <Text style={styles.varianceValue}>Review Cart Items</Text>
                    </View>

                    <View style={styles.flaggedHelpTextContainer}>
                        <Text style={styles.flaggedHelpText}>Flagged for manual review. Support has been notified.</Text>
                        <View style={styles.flexRowCenter}>
                            <Text style={styles.flaggedHelpText}>⏱ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                            <Text style={{ color: '#737373', marginHorizontal: 12 }}>•</Text>
                            <Text style={styles.flaggedHelpText}>📍 STORE EXIT</Text>
                        </View>
                    </View>
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
                    <View style={styles.actionButtonsCol}>
                        <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.85}>
                            <Text style={styles.primaryButtonText}>[QR] RESCAN CART</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.secondaryCardButton} onPress={onMismatch} activeOpacity={0.85}>
                            <Text style={styles.secondaryCardButtonText}>✕ CANCEL TRANSACTION</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    topSection: {
        height: '40%',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    iconText: {
        fontSize: 48,
        color: '#16a34a',
        fontWeight: '900',
        marginTop: 4,
    },
    slashLine: {
        width: 60,
        height: 6,
        backgroundColor: '#991b1b',
        transform: [{ rotate: '-45deg' }],
    },
    titleText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: -1,
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 3,
        fontWeight: '600',
    },
    stopBadge: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 8,
        marginTop: 8,
    },
    stopBadgeText: {
        color: '#991b1b',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 4,
    },
    bottomSection: {
        height: '60%',
        backgroundColor: '#131313',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#a3a3a3',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    itemsList: {
        marginBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemName: {
        color: '#e5e5e5',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        paddingRight: 16,
    },
    itemQuantity: {
        color: '#a3a3a3',
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#262626',
        marginVertical: 4,
        marginBottom: 20,
    },
    totalItemsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    totalItemsNumber: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '900',
    },
    amountCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    amountText: {
        color: '#ffffff',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginTop: -4,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    infoCol: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        borderRadius: 12,
        padding: 16,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#737373',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    infoValue: {
        color: '#e5e5e5',
        fontSize: 14,
        fontWeight: '600',
    },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#262626',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarIcon: {
        fontSize: 20,
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    customerStatus: {
        color: '#a3a3a3',
        fontSize: 11,
    },
    footerSafeArea: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#131313',
    },
    primaryButton: {
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    
    // Denied styles
    deniedAlertText: {
        color: '#f87171',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    deniedReasonText: {
        color: '#a3a3a3',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    errorCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    errorCodeValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
    },
    varianceValue: {
        color: '#f87171',
        fontSize: 16,
        fontWeight: '800',
    },
    actionButtonsCol: {
        gap: 12,
    },
    secondaryCardButton: {
        height: 56,
        backgroundColor: '#262626',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryCardButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    flaggedHelpTextContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    flaggedHelpText: {
        color: '#737373',
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 8,
    },
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
