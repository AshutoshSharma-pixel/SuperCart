import React, { createContext, useState, useContext } from 'react';
import api, { startSession, addToCart, createOrder, verifyPayment, API_URL } from './api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [exitToken, setExitToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isShopping, setIsShopping] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isPaymentActive, setIsPaymentActive] = useState(false);

    // Helper: Timeout Wrapper (5s)
    const withTimeout = (promise, ms = 5000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timed out. Check network.'));
            }, ms);
            promise
                .then(value => {
                    clearTimeout(timer);
                    resolve(value);
                })
                .catch(reason => {
                    clearTimeout(timer);
                    reject(reason);
                });
        });
    };

    const refreshCart = async (sessionId) => {
        try {
            setLoading(true);
            const res = await withTimeout(api.get(`/cart/${sessionId}`));
            if (res.data) {
                setSession({ ...session, ...res.data });
                const rawItems = res.data.products || res.data.items || [];
                const normalizedItems = rawItems.map(item => ({
                    id: item.productId || item.id,
                    name: item.name,
                    price: item.originalPrice || item.price,
                    cart_item: {
                        quantity: item.quantity || item.cart_item?.quantity,
                        finalPriceSnapshot: item.finalPrice || item.cart_item?.finalPriceSnapshot,
                        priceSnapshot: item.originalPrice || item.cart_item?.priceSnapshot,
                        discountApplied: item.discountApplied || item.cart_item?.discountApplied || false,
                        savings: item.totalSavings || item.cart_item?.savings || 0,
                        productId: item.productId || item.id
                    }
                }));
                setCart(normalizedItems);
                setTotal(res.data.totalAmount);
            }
            return true;
        } catch (e) {
            console.log('Refresh Cart Error', e);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const initSession = async (storeId) => {
        try {
            setLoading(true);
            const res = await withTimeout(startSession(user?.uid, storeId));
            // Backend returns session object including products if resuming?
            // For MVP, simplistic handling:
            setSession(res.data);
            if (res.data.products) {
                setCart(res.data.products);
                setTotal(res.data.totalAmount);
            }
            return true;
        } catch (e) {
            console.log('Session Start Error', e);
            if (e.message && e.message.includes('Network Error')) {
                alert(`Network Error.\n\nCheck if phone is on same Wi-Fi as PC.\nURL: ${API_URL}`);
            } else {
                alert('Session Failed: ' + (e.message || JSON.stringify(e)));
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (barcode) => {
        try {
            setLoading(true);
            const res = await withTimeout(addToCart(session.id, barcode, 1));
            // API returns updated Session with products populated
            setSession(res.data);
            setCart(res.data.products || []);
            setTotal(res.data.totalAmount);
            return true;
        } catch (e) {
            console.log('Add Item Error', e);
            if (e.response?.status === 404) {
                alert(`Product not found!\nBarcode: ${barcode}\n\nThis product is not in the store database.`);
            } else {
                alert('Add Item Failed: ' + (e.message || 'Unknown'));
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const initiateCheckout = async () => {
        try {
            setLoading(true);
            const res = await withTimeout(createOrder(session.id));
            if (res.data.success) {
                return {
                    key: res.data.key,
                    amount: res.data.amount,
                    currency: res.data.currency,
                    name: 'SuperCart Store',
                    description: 'Checkout',
                    order_id: res.data.orderId,
                    prefill: {
                        contact: '9999999999',
                        email: 'user@supercart.com'
                    },
                    theme: { color: '#10B981' }
                };
            }
        } catch (e) {
            console.log('Checkout Init Error', e);
            alert('Checkout Init Failed: ' + (e.message || 'Unknown'));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const verifyCheckout = async (paymentData) => {
        try {
            setLoading(true);
            const data = {
                sessionId: session.id,
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature
            };

            const res = await withTimeout(verifyPayment(data));

            if (res.data.success) {
                setExitToken(res.data.exitToken);
                setSession({ ...session, status: 'PAID' });
                return true;
            }
        } catch (e) {
            console.log('Verification Error', e);
            alert('Payment Verification Failed!');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const startShopping = () => {
        setIsShopping(true);
    };

    const proceedToReview = () => {
        setIsReviewing(true);
    };

    const proceedToPayment = () => {
        setIsPaymentActive(true);
    };

    const resetSession = () => {
        setSession(null);
        setCart([]);
        setTotal(0);
        setExitToken(null);
        setIsShopping(false);
        setIsReviewing(false);
        setIsPaymentActive(false);
    };

    const goBackToShopping = () => {
        setIsReviewing(false);
        setIsShopping(true);
    };

    const downloadBill = async () => {
        if (!session) return;
        try {
            const url = `${API_URL}/bill/${session.id}`;
            
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                alert('Sharing is not available on this device');
                return;
            }

            alert('Downloading bill...');

            const cacheDir = FileSystem.cacheDirectory;
            const fileUri = cacheDir + `bill_${session.id}.pdf`;

            const downloadRes = await FileSystem.downloadAsync(url, fileUri);
            
            console.log('Download result:', JSON.stringify(downloadRes));

            if (downloadRes.status === 200) {
                await Sharing.shareAsync(downloadRes.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Your SuperCart Bill'
                });
            } else {
                alert('Failed to download bill. Status: ' + downloadRes.status);
            }
        } catch (error) {
            console.error('Download Bill Error:', error);
            alert('Error: ' + error.message);
        }
    };

    return (
        <CartContext.Provider value={{
            session, cart, total, exitToken, loading, isShopping, isReviewing, isPaymentActive,
            initSession, addItem, initiateCheckout, verifyCheckout, startShopping, proceedToReview, proceedToPayment, resetSession, downloadBill, refreshCart, goBackToShopping
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
