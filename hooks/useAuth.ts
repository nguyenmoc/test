import { AuthState, Role } from '@/constants/authData';
import { loginApi } from '@/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: undefined,
    role: undefined,
    token: undefined,
  });

  useEffect(() => {
    const loadAuthState = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedToken = await AsyncStorage.getItem('token');
      if (savedEmail && savedToken) {
        setAuthState({
          isAuthenticated: true,
          userEmail: savedEmail,
          token: savedToken,
          role: Role.USER, // Default to user role
        });
      }
    };
    loadAuthState();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await loginApi(email, password);
      if (response.success) {
        const { token, role } = response.data;
        setAuthState({
          isAuthenticated: true,
          userEmail: email,
          role,
          token,
        });
        if (rememberMe) {
          await AsyncStorage.setItem('userEmail', email);
          await AsyncStorage.setItem('token', token);
        }
        router.replace('/(tabs)');
      } else {
        Alert.alert('Đăng nhập thất bại', response.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập');
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userEmail', 'token']);
    setAuthState({ isAuthenticated: false, userEmail: undefined, role: undefined, token: undefined });
    router.replace('/auth/login');
  };

  return { authState, login, logout };
};