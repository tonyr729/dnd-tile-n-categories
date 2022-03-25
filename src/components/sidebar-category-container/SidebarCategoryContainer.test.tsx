import { shallow } from 'enzyme';
import SidebarCategoryContainer from './SidebarCategoryContainer';
import mockData from '../../utils/mock/mockTileData.json';
import { ICategoryDnDLayout } from '../../common/types';

describe('SidebarCategoryContainer', () => {
  const mockTestData = mockData.slice(0, 4);

  const mockFunc = jest.fn();

  it('renders without crashing', () => {
    shallow(
      <SidebarCategoryContainer
        sidebarData={mockTestData as unknown as ICategoryDnDLayout[]}
        handleAddCategory={mockFunc}
        handleAddSubCategory={mockFunc}
      />,
    );
  });
});
