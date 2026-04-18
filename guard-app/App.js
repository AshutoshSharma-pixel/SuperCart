import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/AuthContext';
import LoginScreen from './src/LoginScreen';
import ScannerScreen from './src/ScannerScreen';

const Main = () => {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      {user ? <ScannerScreen /> : <LoginScreen />}
      <StatusBar style="light" />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
