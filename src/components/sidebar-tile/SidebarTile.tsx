import { ITileValues } from '../../common/types';
import './SidebarTile.scss';
import addSubcategory from '../../assets/add.svg';

/**
 * @description Tile component that displays tile data.
 * @param {ITileValues} ITileValues - Tile data
 * @returns {JSX.Element} - Tile Data
 */
function SidebarTile({
  categoryIndex,
  categoryName,
  tileValues,
  handleAddSubCategory,
}: {
  categoryIndex: number;
  categoryName: string | undefined;
  tileValues: ITileValues;
  handleAddSubCategory: (id: string, categoryIndex: number, categoryName?: string) => void;
}): JSX.Element {
  return (
    <div key={tileValues.id} className="sidebar-tile">
      <input
        className="add-category"
        type="image"
        src={addSubcategory}
        alt="Add Category"
        onClick={() => handleAddSubCategory(tileValues.id, categoryIndex, categoryName)}
      />
      <p className="sidebar-tile-title">{tileValues.name}</p>
    </div>
  );
}

export default SidebarTile;
