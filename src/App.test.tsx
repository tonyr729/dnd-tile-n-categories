import { shallow } from 'enzyme';
import App from './App';
import MainContent from './components/main-content/MainContent';
import Sidebar from './components/sidebar/Sidebar';
import mockCategoryData from './utils/mock/mockCategoryData.json';

describe('App', () => {
  const mockFunc = jest.fn();
  it('renders without crashing', () => {
    shallow(<App />);
  });

  it('it renders child components', () => {
    const wrapper = shallow(<App />);
    expect(
      wrapper.containsAllMatchingElements([
        <Sidebar
          sidebarData={mockCategoryData}
          toggleExpanded={mockFunc}
          expanded
          handleAddCategory={mockFunc}
          handleAddSubCategory={mockFunc}
        />,
        <MainContent
          user={{ employee_id: 1, initial_login: false, email: 'test@test.com', role_id: 0 }}
          mainContentData={mockCategoryData}
          saved
          expanded
          handleRemoveCategory={mockFunc}
          handleRemoveSubCategory={mockFunc}
          handleSortList={mockFunc}
          saveDashboard={mockFunc}
        />,
      ]),
    );
  });
});
