import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentScreen from './PaymentScreen';
import { useCart } from './CartContext';

export default function PaymentFlowScreen() {
    const { session, initiateCheckout, verifyCheckout } = useCart();
    const [paymentOptions, setPaymentOptions] = useState(null);
    const [paymentVisible, setPaymentVisible] = useState(false);

    React.useEffect(() => {
        // Auto-initiate checkout when this screen loads
        handleInitiate();
    }, []);

    const handleInitiate = async () => {
        const options = await initiateCheckout();
        if (options) {
            setPaymentOptions(options);
            setPaymentVisible(true);
        }
    };

    const handlePaymentSuccess = async (data) => {
        setPaymentVisible(false);
        await verifyCheckout(data);
    };

    const handlePaymentCancel = () => {
        setPaymentVisible(false);
        alert('Payment Cancelled');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.text}>Initializing Payment...</Text>
            </View>

            <PaymentScreen
                visible={paymentVisible}
                paymentOptions={paymentOptions}
                onVerify={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: '#6B7280',
    },
});
