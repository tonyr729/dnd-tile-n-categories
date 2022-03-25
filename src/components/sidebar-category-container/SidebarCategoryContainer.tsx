import { ICategoryDnDLayout } from '../../common/types';
import SidebarCategory from '../sidebar-category/SidebarCategory';

/**
 * @description A container of tiles grouped into categories
 * @returns {JSX.Element} - A container of Tile components.
 */
export default function SidebarCategoryContainer({
  sidebarData,
  handleAddCategory,
  handleAddSubCategory,
}: {
  sidebarData: ICategoryDnDLayout[];
  handleAddCategory: (category?: string) => void;
  handleAddSubCategory: (id: string, categoryIndex: number, categoryName?: string) => void;
}): JSX.Element {
  return (
    <div className="sidebar-container">
      {sidebarData.map((category, index) => (
        <SidebarCategory
          id={category.name}
          categoryIndex={index}
          tiles={category.tiles}
          categoryName={category.name}
          key={`${category.name}-category`}
          handleAddCategory={handleAddCategory}
          handleAddSubCategory={handleAddSubCategory}
        />
      ))}
    </div>
  );
}
