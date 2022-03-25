import { shallow } from 'enzyme';
import SidebarTile from './SidebarTile';
import { ITileValues } from '../../common/types';
import mockData from '../../utils/mock/mockTileData.json';

it('renders without crashing', () => {
  const mockTileData: ITileValues = mockData[0];
  const mockFunc = jest.fn();
  shallow(
    <SidebarTile
      categoryIndex={1}
      categoryName="Category 1"
      tileValues={mockTileData}
      handleAddSubCategory={mockFunc}
    />,
  );
});
