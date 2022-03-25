import { shallow } from 'enzyme';
import { ITileValues } from '../../common/types';
import SidebarCategory from './SidebarCategory';
import mockData from '../../utils/mock/mockTileData.json';

const mockTileData: ITileValues[] = mockData.splice(0, 4);

it('renders without crashing', () => {
  const mockFunc = jest.fn();

  shallow(
    <SidebarCategory
      id="1"
      categoryIndex={1}
      tiles={mockTileData}
      categoryName="cat1"
      handleAddCategory={mockFunc}
      handleAddSubCategory={mockFunc}
    />,
  );
});
