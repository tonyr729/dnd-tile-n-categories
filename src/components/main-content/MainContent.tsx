/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ListManager } from 'react-beautiful-dnd-grid';
import CategoryContainer from '../category-container/CategoryContainer';
import { ICategoryDnDLayout, IUser } from '../../common/types';
import './MainContent.scss';

/**
 * @description MainContent container.
 * @param {bool} expanded - if true, the sidebar content is expanded
 * @returns {JSX.Element}
 */
function MainContent({
  user,
  mainContentData,
  expanded,
  saved,
  handleRemoveCategory,
  handleRemoveSubCategory,
  handleSortList,
  saveDashboard,
}: {
  user: IUser;
  saved: boolean;
  mainContentData: ICategoryDnDLayout[] | undefined;
  expanded: boolean;
  handleRemoveCategory: (category: string) => void;
  handleRemoveSubCategory: (id: string, tileCategory: string) => void;
  handleSortList: () => void;
  saveDashboard: () => void;
}) {
  if (!mainContentData || Object.keys(mainContentData).length === 0) {
    return (
      <div className="welcome-container">
        <section className="welcome-content">
          <h1 className="greeting">
            {user && user.name ? `Welcome back, ${user.name}!` : 'Welcome back!'}
          </h1>
        </section>
      </div>
    );
  }

  const reorderList = (sourceIndex: number, destinationIndex: number) => {
    if (destinationIndex === sourceIndex) {
      return;
    }
    const list = mainContentData;

    if (destinationIndex === 0) {
      list[sourceIndex].order = list[0].order! - 1;
      handleSortList();
      return;
    }
    if (destinationIndex === list.length - 1) {
      list[sourceIndex].order = list[list.length - 1].order! + 1;
      handleSortList();
      return;
    }
    if (destinationIndex < sourceIndex) {
      list[sourceIndex].order =
        (list[destinationIndex].order! + list[destinationIndex - 1].order!) / 2;
      handleSortList();
      return;
    }
    list[sourceIndex].order =
      (list[destinationIndex].order! + list[destinationIndex + 1].order!) / 2;
    handleSortList();
  };

  return (
    <div
      className={
        expanded
          ? 'main-content-container main-content-container--expanded'
          : 'main-content-container'
      }
    >
      <div className="header">
        <h1 className="greeting">
          {user && user.name ? `Welcome back, ${user.name}!` : 'Welcome back!'}
        </h1>
        <button
          onClick={saveDashboard}
          className="save-dashboard-btn"
          type="button"
          disabled={saved}
        >
          Save Dashboard
        </button>
      </div>
      <section className={expanded ? 'main-content main-content--expanded' : 'main-content'}>
        <ListManager
          items={mainContentData}
          direction="horizontal"
          maxItems={2}
          render={(category) => (
            <CategoryContainer
              key={category.id}
              tiles={category.tiles}
              categoryName={category.name}
              handleRemoveCategory={handleRemoveCategory}
              handleRemoveSubCategory={handleRemoveSubCategory}
            />
          )}
          onDragEnd={reorderList}
        />
      </section>
    </div>
  );
}

export default MainContent;
