/* eslint-disable react/jsx-props-no-spreading */
import useCollapse from 'react-collapsed';
import { ITileValues } from '../../common/types';
import SidebarTile from '../sidebar-tile/SidebarTile';
import categoryIcon from '../../assets/category-icon.svg';
import addCategory from '../../assets/add.svg';
import expandArrow from '../../assets/cat-expand-arrow.svg';
import collapseArrow from '../../assets/cat-collapse-arrow.svg';
import './SidebarCategory.scss';

function SidebarCategory({
  id,
  categoryIndex,
  tiles,
  categoryName,
  handleAddCategory,
  handleAddSubCategory,
}: {
  id: string | undefined;
  categoryIndex: number;
  tiles: ITileValues[] | undefined;
  categoryName: string | undefined;
  handleAddCategory: (category?: string) => void;
  handleAddSubCategory: (id: string, categoryIndex: number, categoryName?: string) => void;
}) {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  const catCollapseArrow = isExpanded ? collapseArrow : expandArrow;
  return (
    <div className="sidebar-category-container">
      <div className="sidebar-category">
        <input
          className="add-category"
          type="image"
          src={addCategory}
          alt="Add Category"
          onClick={() => handleAddCategory(id)}
        />
        <img className="category-icon" src={categoryIcon} alt="Category" />
        <h2 className="sidebar-category-title">{categoryName}</h2>
        <img
          className="arrow-expand"
          src={catCollapseArrow}
          alt="Expand Subcategory"
          {...getToggleProps()}
        />
      </div>
      <div {...getCollapseProps()}>
        {tiles?.map((tile: ITileValues) => (
          <SidebarTile
            key={`${tile.name}-tile`}
            categoryIndex={categoryIndex}
            categoryName={categoryName}
            tileValues={tile}
            handleAddSubCategory={handleAddSubCategory}
          />
        ))}
      </div>
    </div>
  );
}

export default SidebarCategory;
