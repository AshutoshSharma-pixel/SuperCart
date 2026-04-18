import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider, useCart } from './src/CartContext';
import { API_URL } from './src/api';
import ShopScanScreen from './src/ShopScanScreen';
import ShopDetailsScreen from './src/ShopDetailsScreen';
import ScanningScreen from './src/ScanningScreen';
import CartReviewScreen from './src/CartReviewScreen';
import PaymentFlowScreen from './src/PaymentFlowScreen';
import ExitQRScreen from './src/ExitQRScreen';
import LoginScreen from './src/LoginScreen';
import { AuthProvider, useAuth } from './src/AuthContext';

const Main = () => {
  const { user, loading } = useAuth();
  const { session, exitToken, isShopping, isReviewing, isPaymentActive } = useCart();

  if (loading) return null;

  if (!user) {
    return <LoginScreen />;
  }

  // ROUTING LOGIC
  // 1. If Exit Token exists → Show Exit QR
  // 2. If Payment Active → Show Payment Screen
  // 3. If Reviewing → Show Cart Review
  // 4. If Shopping → Show Scanning Screen
  // 5. If Session Active → Show Shop Details
  // 6. Else → Show Shop Scanner

  if (exitToken) {
    return <ExitQRScreen token={exitToken} />;
  }

  if (session && session.status === 'ACTIVE') {
    if (isPaymentActive) {
      return <PaymentFlowScreen />;
    }
    if (isReviewing) {
      return <CartReviewScreen />;
    }
    if (isShopping) {
      return <ScanningScreen />;
    }
    return <ShopDetailsScreen />;
  }

  return <ShopScanScreen />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <View style={styles.container}>
            <Main />
            <StatusBar style="light" />
          </View>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
