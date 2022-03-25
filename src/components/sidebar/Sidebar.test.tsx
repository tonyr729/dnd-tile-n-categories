import { shallow } from 'enzyme';
import Sidebar from './Sidebar';
import mockCategoryData from '../../utils/mock/mockCategoryData.json';

const mockFunc = jest.fn();

it('renders without crashing', () => {
  shallow(
    <Sidebar
      sidebarData={mockCategoryData}
      toggleExpanded={mockFunc}
      expanded
      handleAddCategory={mockFunc}
      handleAddSubCategory={mockFunc}
    />,
  );
});
