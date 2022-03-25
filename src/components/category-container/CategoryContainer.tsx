import Category from '../category/Category';
import Tile from '../tile/Tile';
import { ITileValues } from '../../common/types';
import './CategoryContainer.scss';

/**
 * @description Category container.
 * @returns {JSX.Element}
 */
function CategoryContainer({
  tiles,
  categoryName,
  handleRemoveCategory,
  handleRemoveSubCategory,
}: {
  tiles: ITileValues[];
  categoryName: string;
  handleRemoveCategory: (category: string) => void;
  handleRemoveSubCategory: (id: string, tileCategory: string) => void;
}): JSX.Element {
  return (
    <div className="category-container">
      <Category
        categoryName={categoryName}
        key={`${categoryName}-category`}
        handleRemoveCategory={handleRemoveCategory}
      />
      {tiles.map((tile: ITileValues) => (
        <Tile
          id={tile.id}
          tileCategory={tile.category}
          tileValues={tile}
          key={tile.id}
          handleRemoveSubCategory={handleRemoveSubCategory}
        />
      ))}
    </div>
  );
}

export default CategoryContainer;
