import { shallow } from 'enzyme';
import Category from './Category';

const mockFunc = jest.fn();

it('renders without crashing', () => {
  shallow(<Category categoryName="categoryName" handleRemoveCategory={mockFunc} />);
});
