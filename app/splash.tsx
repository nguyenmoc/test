import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { authState } = useAuth(); // Sử dụng hook useAuth để lấy trạng thái đăng nhập

  useEffect(() => {
    const timer = setTimeout(() => {
      // Kiểm tra trạng thái đăng nhập từ authState
      if (authState.isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [authState.isAuthenticated]); // Thêm authState.isAuthenticated vào dependency array

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.jpeg')}
          style={styles.reactLogo}
          contentFit="contain"
        />
        <Text style={styles.brandText}>SMOKER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#111827',
    textTransform: 'uppercase',
    marginTop: 20,
  },
  reactLogo: {
    width: 180,
    height: 180,
  },
});