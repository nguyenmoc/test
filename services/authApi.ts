import { AUTH_CONSTANTS } from "@/constants/authData";

export const loginApi = async (email: string, password: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = AUTH_CONSTANTS.FAKE_USERS.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        const fakeResponse = {
          success: true,
          data: {
            token: 'fake-jwt-token-' + Math.random().toString(36).substr(2, 9),
            role: user.role,
          },
          message: 'Đăng nhập thành công',
        };
        resolve(fakeResponse);
      } else {
        resolve({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        });
      }
    }, 1000); // Simulate network delay
  });
};