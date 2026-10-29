declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

let fbInitPromise: Promise<any> | null = null;

export const initFacebookSdk = (): Promise<any> => {
  if (fbInitPromise) {
    return fbInitPromise;
  }

  fbInitPromise = new Promise((resolve, reject) => {
    // If FB is already loaded and initialized
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '1088484439739502';

    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v20.0',
        });
        resolve(window.FB);
      } catch (err) {
        reject(err);
      }
    };

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    js.async = true;
    js.defer = true;
    js.onerror = () => {
      reject(new Error('Không thể tải Facebook SDK. Vui lòng kiểm tra kết nối mạng hoặc tiện ích chặn quảng cáo.'));
    };
    document.body.appendChild(js);
  });

  return fbInitPromise;
};

export const loginWithFacebookPopup = async (): Promise<string> => {
  const FB = await initFacebookSdk();
  if (!FB) {
    throw new Error('Facebook SDK chưa sẵn sàng');
  }

  return new Promise((resolve, reject) => {
    FB.login(
      (response: any) => {
        if (response.authResponse && response.authResponse.accessToken) {
          resolve(response.authResponse.accessToken);
        } else if (response.status === 'not_authorized') {
          reject(new Error('Ứng dụng chưa được cấp quyền đăng nhập qua Facebook'));
        } else {
          reject(new Error('Đăng nhập Facebook bị hủy hoặc không thành công'));
        }
      },
      { scope: 'public_profile' }
    );
  });
};
