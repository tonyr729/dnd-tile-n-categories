import './Sidebar.scss';
import SidebarCategoryContainer from '../sidebar-category-container/SidebarCategoryContainer';
import { ICategoryDnDLayout } from '../../common/types';
import leftArrow from '../../assets/left-arrow.svg';
import rightArrow from '../../assets/right-arrow.svg';
import logoutImg from '../../assets/logout.svg';
import { authContext } from '../../adalConfig';

/**
 * @description Sidebar component that expands and collapses on click.
 * @param toggleExpanded - A setter function to set the sidebar's expanded state.
 * @param {boolean} expanded - Whether the sidebar is expanded or not.
 * @returns {JSX.Element} - A collapsible sidebar.
 */
function Sidebar({
  sidebarData,
  toggleExpanded,
  expanded,
  handleAddCategory,
  handleAddSubCategory,
}: {
  sidebarData: ICategoryDnDLayout[];
  toggleExpanded: () => void;
  expanded: boolean;
  handleAddCategory: (category?: string) => void;
  handleAddSubCategory: (id: string, categoryIndex: number, categoryName?: string) => void;
}): JSX.Element {
  const logout = () => {
    authContext.logOut();
  };
  const toggleInput = (expandedProp: boolean) => {
    const toggleImgSource = expandedProp ? leftArrow : rightArrow;
    return (
      <>
        <input
          className="toggle-expand"
          type="image"
          src={toggleImgSource}
          onClick={toggleExpanded}
          onKeyDown={toggleExpanded}
          alt="Expand Toggle"
        />
        <img className={expandedProp ? 'brand' : 'logo'} src="" alt="Logo" />
      </>
    );
  };
  return (
    <div className={expanded ? 'sidebar sidebar--expanded' : 'sidebar'} role="button">
      {expanded ? (
        <>
          {toggleInput(expanded)}
          <SidebarCategoryContainer
            sidebarData={sidebarData}
            handleAddCategory={handleAddCategory}
            handleAddSubCategory={handleAddSubCategory}
          />
        </>
      ) : (
        <>{toggleInput(expanded)}</>
      )}
      <input
        className={expanded ? 'logout' : 'logout logout--collapsed'}
        type="image"
        src={logoutImg}
        onClick={() => logout()}
        alt="Logout"
      />
    </div>
  );
}

export default Sidebar;
