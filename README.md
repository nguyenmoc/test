# Welcome to your Smoker app 👋
Smoker là một ứng dụng mạng xã hội kết hợp với hệ thống quản lý quán bar, cho phép người dùng tương tác, đặt bàn, đăng bài và quản lý các hoạt động trong quán.
Ứng dụng được phát triển bằng React Native + Expo, hỗ trợ cả Android và iOS.
## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. build app

step 1: rm -rf android ios
step 2: npx expo prebuild

build apk: 
cd android && ./gradlew assembleRelease

```bash
cd android
./gradlew assembleRelease
```


build ipa:
//cho máy ảo
npx expo run:ios --configuration Release 

//cho máy thật:
npx expo run:ios --configuration Release --device


Cấu trúc thư mục:

Smoker-App/
├── app/                  # Code chính (màn hình, router)
├── components/           # Các component tái sử dụng
├── assets/               # Hình ảnh, icon, splash
├── hooks/                # Custom hooks
├── utils/                # Hàm tiện ích
├── package.json
├── app.json              # Cấu hình Expo
└── README.md