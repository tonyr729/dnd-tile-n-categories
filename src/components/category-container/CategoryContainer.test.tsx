import { shallow } from 'enzyme';
import CategoryContainer from './CategoryContainer';
import mockData from '../../utils/mock/mockTileData.json';
import { ITileValues } from '../../common/types';

describe('CategoryContainer', () => {
  const mockTileData: ITileValues[] = mockData.splice(0, 4);

  const mockFunc = jest.fn();

  it('renders without crashing', () => {
    shallow(
      <CategoryContainer
        tiles={mockTileData}
        categoryName="cat1"
        handleRemoveCategory={mockFunc}
        handleRemoveSubCategory={mockFunc}
      />,
    );
  });
});
