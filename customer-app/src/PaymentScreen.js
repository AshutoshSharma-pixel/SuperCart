import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const getRazorpayHtml = (options) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>body{background-color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}</style>
</head>
<body>
    <h3 style="font-family:sans-serif;color:#333;">Initializing Payment...</h3>
    <script>
        try {
            var options = ${JSON.stringify(options)};
            options.handler = function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', data: response }));
            };
            options.modal = {
                ondismiss: function(){
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CANCEL' }));
                }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILED', data: response.error }));
            });
            rzp1.open();
        } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.message }));
        }
    </script>
</body>
</html>
`;

export default function PaymentScreen({ visible, paymentOptions, onVerify, onCancel }) {
    if (!visible || !paymentOptions) return null;

    const handleMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'SUCCESS') {
                onVerify(message.data);
            } else if (message.type === 'CANCEL') {
                onCancel();
            } else if (message.type === 'FAILED') {
                console.log('Payment Failed', message.data);
                alert('Payment Failed: ' + (message.data.description || 'Unknown'));
                onCancel();
            }
        } catch (e) {
            console.error('WebView Message Error', e);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Secure Payment</Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: getRazorpayHtml(paymentOptions) }}
                    onMessage={handleMessage}
                    javaScriptEnabled={true}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold' },
    cancel: { color: 'red', fontSize: 16 }
});
