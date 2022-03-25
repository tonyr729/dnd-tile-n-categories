import { shallow } from 'enzyme';
import Tile from './Tile';
import mockData from '../../utils/mock/mockTileData.json';

const tileValuesMock = mockData[0];

const mockFunc = jest.fn();

it('renders without crashing', () => {
  shallow(
    <Tile
      id="1"
      tileCategory="Category 1"
      tileValues={tileValuesMock}
      handleRemoveSubCategory={mockFunc}
    />,
  );
});
