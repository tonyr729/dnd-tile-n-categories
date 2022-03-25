import axios, { AxiosError } from 'axios';
import { UserInfo } from 'react-adal';
import { IGroupedData, ILayout, IRole, ITileValues, IUser } from '../../common/types';

type ServerError = { errorMessage: string };

/**
 * @description Agnostic base fetch wrapper around Axios
 * @param path Should be relative path "api/v1/path"
 * @param params Optional params to be passed to the server
 * @returns Returns a resolved promise with the data from the server
 */
export const fetchData = async (path: string, params: object = {}) => {
  try {
    const response = await axios.get(path, params);

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const serverError = err as AxiosError<ServerError>;
      if (serverError && serverError.response) {
        return serverError.response.data;
      }

      return serverError;
    }
    return err;
  }
};

/**
 * @description Gets all resource data from the server
 * @returns Returns grouped data from all resource endpoints
 */
export const getData = async (user: UserInfo) => {
  const userData: IUser = await fetchData('/api/v1/user/', {
    params: { user: JSON.stringify(user) },
  });
  const role: IRole = await fetchData('/api/v1/role/', {
    params: { jobTitle: user.profile.jobtitle },
  });
  const inventory: ITileValues[] = await fetchData('/api/v1/inventory/', {
    params: { roleId: role.id },
  });
  const layoutData: ILayout = await fetchData('/api/v1/layout/', {
    params: { employee: userData },
  });
  const result: IGroupedData = { userData, role, inventory, layoutData };

  return result;
};

/**
 * @description Function to post layout data to the server
 * @param layout New layout data from the user to be saved to the database
 * @returns response from the server
 */
export const postLayout = async (layout: ILayout, employeeID: number) => {
  try {
    const response = await axios({
      method: 'post',
      url: '/api/v1/layout/',
      params: { layout: JSON.stringify(layout), employeeID },
    });

    return response;
  } catch (err) {
    const errors = err as Error | AxiosError;

    if (!axios.isAxiosError(errors)) {
      // eslint-disable-next-line no-console
      console.error({ native: errors });
      return { native: errors };
    }
    // eslint-disable-next-line no-console
    console.error({ axios: errors.response });
    return { axios: errors.response };
  }
};
