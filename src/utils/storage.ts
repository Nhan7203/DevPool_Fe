/**
 * Utility functions để quản lý token và user data
 * Hỗ trợ cả localStorage (remember me) và sessionStorage (không remember)
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'devpool_user',
  REMEMBER_ME: 'remember_me',
} as const;

/**
 * Lấy token từ storage (kiểm tra cả localStorage và sessionStorage)
 */
export const getAccessToken = (): string | null => {
  // Ưu tiên localStorage trước
  const localToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  if (localToken) return localToken;
  
  // Nếu không có trong localStorage, thử sessionStorage
  const sessionToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  return sessionToken;
};

/**
 * Lấy refresh token từ storage
 */
export const getRefreshToken = (): string | null => {
  const localToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  if (localToken) return localToken;
  
  const sessionToken = sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  return sessionToken;
};

/**
 * Lưu token vào storage dựa trên rememberMe
 */
export const setTokens = (accessToken: string, refreshToken: string, rememberMe: boolean): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Lưu tokens
  storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  
  // Lưu remember me setting vào localStorage để biết dùng storage nào
  localStorage.setItem(TOKEN_KEYS.REMEMBER_ME, String(rememberMe));
  
  // Nếu không remember, xóa tokens khỏi localStorage (nếu có)
  if (!rememberMe) {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  } else {
    // Nếu remember, xóa tokens khỏi sessionStorage (nếu có)
    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }
};

/**
 * Lưu user data vào storage
 */
export const setUser = (userData: any, rememberMe: boolean): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEYS.USER, JSON.stringify(userData));
  
  // Xóa user data khỏi storage còn lại
  if (rememberMe) {
    sessionStorage.removeItem(TOKEN_KEYS.USER);
  } else {
    localStorage.removeItem(TOKEN_KEYS.USER);
  }
};

/**
 * Lấy user data từ storage (kiểm tra cả 2)
 */
export const getUser = (): any | null => {
  const localUser = localStorage.getItem(TOKEN_KEYS.USER);
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch {
      return null;
    }
  }
  
  const sessionUser = sessionStorage.getItem(TOKEN_KEYS.USER);
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch {
      return null;
    }
  }
  
  return null;
};

/**
 * Xóa tất cả tokens và user data
 */
export const clearAuthData = (): void => {
  // Xóa từ cả 2 storage để đảm bảo
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER);
  localStorage.removeItem(TOKEN_KEYS.REMEMBER_ME);
  
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.USER);
};

/**
 * Kiểm tra xem có đang dùng remember me không
 */
export const isRememberMe = (): boolean => {
  return localStorage.getItem(TOKEN_KEYS.REMEMBER_ME) === 'true';
};

