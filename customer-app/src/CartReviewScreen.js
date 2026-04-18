import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './CartContext';
import api from './api';

export default function CartReviewScreen() {
    const { session, cart, total, proceedToPayment, refreshCart, loading, goBackToShopping } = useCart();

    const updateQuantity = async (productId, currentQty, delta) => {
        const newQty = currentQty + delta;
        try {
            if (newQty <= 0) {
                await api.post('/cart/remove', {
                    sessionId: session.id,
                    productId: productId
                });
            } else {
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

    const itemCount = cart?.length || 0;

    const renderItem = ({ item, index }) => (
        <View>
            <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                </View>
                
                <View style={styles.quantityControl}>
                    <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.cart_item?.productId, item.cart_item?.quantity, -1)}
                    >
                        <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.qtyValue}>{item.cart_item?.quantity}</Text>
                    
                    <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.cart_item?.productId, item.cart_item?.quantity, 1)}
                    >
                        <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>₹{item.cart_item?.finalPriceSnapshot || item.price}</Text>
            </View>
            {index < cart.length - 1 && <View style={styles.itemDivider} />}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>CART REVIEW</Text>
                        <Text style={styles.subtitle}>{itemCount} ITEMS READY</Text>
                    </View>
                    {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
                </View>
            </View>

            <FlatList
                data={cart}
                renderItem={renderItem}
                keyExtractor={item => (item.productId || item.id).toString()}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={<View style={{ height: 200 }} />}
            />

            <View style={styles.footer}>
                <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.totalAmount}>₹{total}</Text>

                <TouchableOpacity
                    style={styles.payButton}
                    onPress={proceedToPayment}
                    disabled={cart.length === 0 || loading}
                >
                    <Text style={styles.payButtonText}>PROCEED TO PAYMENT →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueLink}
                    onPress={goBackToShopping}
                >
                    <Text style={styles.continueLinkText}>CONTINUE SHOPPING</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 52,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 52,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 10,
        fontWeight: '500',
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 24,
        backgroundColor: '#000000',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        marginLeft: 16,
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#262626',
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(23, 23, 23, 0.92)',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    totalLabel: {
        fontSize: 9,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: 0.3 * 9,
        fontWeight: '700',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.05 * 48,
        marginBottom: 20,
    },
    payButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    payButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 15,
    },
    continueLink: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    continueLinkText: {
        color: '#a3a3a3',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.2 * 12,
    },
});
