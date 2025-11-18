import { AuthState, Role } from '@/constants/authData';
import { loginApi, upgradeRoleApi } from '@/services/authApi';
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
    currentId: undefined,
  });

  // Load state login nếu user nhớ đăng nhập
  useEffect(() => {
    const loadAuthState = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedToken = await AsyncStorage.getItem('token');
      const savedRole = await AsyncStorage.getItem('role') as Role | null;
      const savedCurrentId = await AsyncStorage.getItem('currentId');

      if (savedEmail && savedToken) {
        setAuthState({
          isAuthenticated: true,
          userEmail: savedEmail,
          token: savedToken,
          currentId: savedCurrentId || undefined,
          role: savedRole || Role.CUSTOMER,
        });
      }
    };
    loadAuthState();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const res = await loginApi(email, password);

      if (!res.token) {
        Alert.alert('Đăng nhập thất bại', res.message ?? 'Tên đăng nhập hoặc mật khẩu không đúng');
        return;
      }

      const role: Role = res.user?.role || Role.CUSTOMER;

      setAuthState({
        isAuthenticated: true,
        userEmail: res.user.email,
        role,
        token: res.token,
        currentId: res.user.id
      });
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', res.user.email);
        await AsyncStorage.setItem('token', res.token);
        await AsyncStorage.setItem('role', role);
        await AsyncStorage.setItem('currentId', res.user.id);
      }

      router.replace('/(tabs)');

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    }
  };

  const upgradeRole = async (newRole: Role) => {
    if (!authState.userEmail) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    try {
      const response = await upgradeRoleApi(authState.userEmail, newRole);
      if (response.success) {
        setAuthState((prev) => ({
          ...prev,
          role: response.data.newRole,
        }));
        await AsyncStorage.setItem('role', response.data.newRole);
        Alert.alert('Thành công', 'Vai trò đã được nâng cấp');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Thất bại', response.message ?? 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    }
  };


  const logout = async () => {
    await AsyncStorage.multiRemove(['userEmail', 'token', 'role']);
    setAuthState({
      isAuthenticated: false,
      userEmail: undefined,
      role: undefined,
      token: undefined,
      currentId: undefined
    });
    router.replace('/auth/login');
  };

  return { authState, login, logout, upgradeRole };
};