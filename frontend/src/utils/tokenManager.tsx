// ..utils/tokenManager.ts

const TOKEN_KEY_PREFIX = 'cognito_token_';
const USER_INFO_KEY = 'cognito_user_info';

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  username: string;
  email: string;
}

export const storeTokens = (username: string, tokens: CognitoTokens): void => {
  clearAllTokens();   
  localStorage.setItem(`${TOKEN_KEY_PREFIX}${username}`, JSON.stringify(tokens));
};

export const getTokens = (username: string): CognitoTokens | null => {``
  const tokensString = localStorage.getItem(`${TOKEN_KEY_PREFIX}${username}`);
  return tokensString ? JSON.parse(tokensString) : null;
};

export const storeUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const getUserInfo = (): UserInfo | null => {
  const userInfoString = localStorage.getItem(USER_INFO_KEY);
  return userInfoString ? JSON.parse(userInfoString) : null;
};

export const clearAllTokens = (): void => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(TOKEN_KEY_PREFIX) || key === USER_INFO_KEY)
    .forEach(key => localStorage.removeItem(key));
};