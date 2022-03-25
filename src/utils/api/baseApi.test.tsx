import axios from 'axios';
import { UserInfo } from 'react-adal';
import { fetchData, getData } from './baseApi';

jest.mock('axios');

describe('baseApi', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'mockData' });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('fetchData', () => {
    it('should call axios.get and return data', async () => {
      const result = await fetchData('/path/', { params: { param: 'value' } });

      expect(axios.get).toHaveBeenCalledWith('/path/', { params: { param: 'value' } });
      expect(result).toEqual('mockData');
    });
  });

  describe('getData', () => {
    it('should call fetchData for each endpoint and return data', async () => {
      const mockUser: UserInfo = {
        userName: 'test@test.com',
        profile: { jobTitle: 'Claims Processor' },
      };
      const result = await getData(mockUser);

      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        role: 'mockData',
        inventory: 'mockData',
        layoutData: 'mockData',
        userData: 'mockData',
      });
    });
  });

  describe('postLayout', () => {
    // cannot find a way to mock axios(config)
    // will have to add tests is v2
  });

  describe('patchLayout', () => {
    // cannot find a way to mock axios(config)
    // will have to add tests is v2
  });
});
