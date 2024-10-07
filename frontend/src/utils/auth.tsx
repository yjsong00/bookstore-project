
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import { storeTokens, storeUserInfo, clearAllTokens, CognitoTokens, UserInfo } from './tokenManager';


const COGNITO_CONFIG_KEY = 'cognitoConfig';

interface CognitoConfig {
  UserPoolId: string;
  ClientId: string;
}


const UserPoolId = "ap-northeast-2_MOp2LBaMU";
const ClientId = "4hhqgfj55n7spi2rmm4svb7d3n";
const awsRegion = "ap-northeast-2";

export const initializeCognitoConfig = (): void => {
  const cognitoConfig: CognitoConfig = {
    // UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    // ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    UserPoolId: 'ap-northeast-2_MOp2LBaMU',
    ClientId: "4hhqgfj55n7spi2rmm4svb7d3n"!,
  };
  localStorage.setItem(COGNITO_CONFIG_KEY, JSON.stringify(cognitoConfig));
};

export const getCognitoConfig = (): CognitoConfig | null => {
  const config = localStorage.getItem(COGNITO_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};



export const loginUser = (username: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const config = getCognitoConfig();
    if (!config) {
      reject(new Error("Missing Cognito configuration"));
      return;
    }

    const userPool = new CognitoUserPool(config);

    const authenticationData = {
      Username: username,
      Password: password,
    };
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const tokens: CognitoTokens = {
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };
        storeTokens(username, tokens);

        // Get user attributes (including email)
        cognitoUser.getUserAttributes((err, result) => {
          if (err) {
            console.error('Error getting user attributes:', err);
            reject(err);
            return;
          }
          const email = result?.find(attr => attr.getName() === 'email')?.getValue() || '';
          const userInfo: UserInfo = { username, email };
          storeUserInfo(userInfo);
          resolve();
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const logoutUser = (): void => {
  clearAllTokens();
  // Clear any other user-related data
  localStorage.removeItem('awsConfig');
  // Do not remove Cognito configuration
};
