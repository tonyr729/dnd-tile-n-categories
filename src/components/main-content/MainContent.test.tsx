import { shallow } from 'enzyme';
import MainContent from './MainContent';
import mockCategoryData from '../../utils/mock/mockCategoryData.json';

const mockFunc = jest.fn();

it('renders without crashing', () => {
  shallow(
    <MainContent
      mainContentData={mockCategoryData}
      user={{ employee_id: 1, initial_login: false, email: 'test@test.com', role_id: 0 }}
      expanded
      saved
      handleRemoveCategory={mockFunc}
      handleRemoveSubCategory={mockFunc}
      handleSortList={mockFunc}
      saveDashboard={mockFunc}
    />,
  );
});
