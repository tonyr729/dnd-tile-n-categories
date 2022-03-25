import { AdalConfig, AuthenticationContext } from 'react-adal';
// Endpoint URL
export const endpoint = '';
// App Registration ID
const appId = '0';
export const adalConfig: AdalConfig = {
  cacheLocation: 'localStorage',
  clientId: appId,
  endpoints: {
    api: endpoint,
  },
  postLogoutRedirectUri: window.location.origin,
  tenant: '',
};

export const authContext = new AuthenticationContext(adalConfig);
