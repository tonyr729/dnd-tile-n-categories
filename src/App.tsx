import { useState, useEffect } from 'react';
import { uniqueId } from 'lodash';
import { AxiosResponse } from 'axios';
import Sidebar from './components/sidebar/Sidebar';
import './App.scss';
import MainContent from './components/main-content/MainContent';
import {
  ILayout,
  ICategoryDnDLayout,
  ITileDictionary,
  ITileValues,
  IUser,
  ICategoryLayout,
  ITileLayout,
} from './common/types';
import { getData, postLayout } from './utils/api/baseApi';
import { authContext } from './adalConfig';

/**
 * @description Root component of the application
 * @returns {JSX.Element}
 */
function App(): JSX.Element {
  /** @description Expanded state of sidebar */
  const [expanded, setExpanded] = useState(true);
  /** @description Saved or unsaved layout */
  const [saved, setSaved] = useState(true);
  /** @description User information */
  const [user, setUser] = useState<IUser>({} as IUser);
  /** @description Layout of tiles */
  const [layout, setLayout] = useState<ILayout>({} as ILayout);
  /** @description All tile data */
  const [tiles, setTiles] = useState<ITileValues[]>([]);
  /** @description All categories inside main content */
  const [mainContentData, setMainContentData] = useState<ICategoryDnDLayout[]>([]);
  /** @description All categories inside sidebar */
  const [sidebarData, setSidebarData] = useState<ICategoryDnDLayout[]>([]);

  /**
   * @description Sorts categories by their order inside main content
   * @param {ICategoryDnDLayout[]} layoutData - main content data to be sorted
   * @returns {ICategoryDnDLayout[]} - sorted main content data
   */
  const sortList = (layoutData: ICategoryDnDLayout[]): ICategoryDnDLayout[] => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return layoutData.slice().sort((first, second) => first.order! - second.order!);
  };

  /**
   * @description Sets sorted main content data to state
   * @param {boolean} initialSort - whether to sort data on first load from server
   */
  const handleSortList = (initialSort?: boolean): void => {
    if (!initialSort) setSaved(false);
    setMainContentData((prevState) => {
      const categories = [...prevState];
      return [...sortList(categories)];
    });
  };

  /**
   * @description Places tile data into a dictionary with category name as key
   * @param {ITileValues[]} tilesList  - list of tiles
   * @returns {ITileDictionary} - dictionary of tiles
   */
  const categorizeData = (tilesList: ITileValues[]): ITileDictionary => {
    const tilesByCategory: ITileDictionary = {};

    tilesList.forEach((tile: ITileValues) => {
      if (!tilesByCategory[tile.category]) {
        tilesByCategory[tile.category] = [];
      }

      tilesByCategory[tile.category].push(tile);
    });
    return tilesByCategory;
  };

  /**
   * @description Converts tiles into ICategoryDnDLayout and sorts it by name for sidebar.
   * @param {ITileValues[]} inventory - list of tiles
   * @returns {ICategoryDnDLayout[]} - list of category data sorted by name
   */
  const generateCategory = (inventory: ITileValues[]): ICategoryDnDLayout[] => {
    const updatedData: ICategoryDnDLayout[] = [];
    const tilesByCategory = categorizeData(inventory);

    inventory.forEach((tile: ITileValues) => {
      const categoryObj: ICategoryDnDLayout = {} as ICategoryDnDLayout;

      const checkCategory = (obj: ICategoryDnDLayout) => obj.name === tile.category;
      if (!updatedData.some(checkCategory)) {
        categoryObj.name = tile.category;
        categoryObj.id = Number(uniqueId());
        categoryObj.order = 0;
        categoryObj.tiles = [];
        updatedData.push(categoryObj);
      }
    });

    updatedData.forEach((categoryObject) => {
      if (categoryObject.name !== undefined) {
        const tilesArray = tilesByCategory[categoryObject.name];
        tilesArray.forEach((tileItem: ITileValues) => {
          const orderedTile = { ...tileItem, order: 0 };
          categoryObject.tiles?.push(orderedTile);
        });
      }
    });

    updatedData.sort((a, b) => {
      if (!a.name || !b.name) return 0;
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    return updatedData;
  };

  /**
   * @description Sets both main content and sidebar data to state based of layout data from database
   * @param {ILayout} layoutData - layout data from database
   * @param {ITileValues[]} inventory - list of tiles
   */
  const generateInitalContentFromLayout = (layoutData: ILayout, inventory: ITileValues[]): void => {
    let sideBarContent: ICategoryDnDLayout[] = generateCategory(inventory);
    const mainContent: ICategoryDnDLayout[] = [];

    // loop through the layout category info
    layoutData.category_layout.forEach((catLayout) => {
      // if the category order is not 0 it belongs in main content so we will modify that content
      if (catLayout.category_order !== 0) {
        // map over the current sidebar content that includes all tiles and reassign with the final result
        sideBarContent = sideBarContent.map((sidebarCategory) => {
          // clone the category with tiles to not mutate
          // we dont set the category order here since it says at 0 indicating sidebar
          const sidebarCategoryClone = { ...sidebarCategory };
          // if the current category matches a category in this layout then its a main content category
          if (sidebarCategory.id === catLayout.category_id) {
            // clone the sidebar category to convert it to a "main content" category
            const mainContentCategory = { ...sidebarCategory };
            // wipe the tiles to provide a clean slate to add to
            mainContentCategory.tiles = [];
            // we DO set the order here since this is a main content category now
            mainContentCategory.order = catLayout.category_order;
            // loop over the tile layout data
            layoutData.tile_layout.forEach((tileLayout) => {
              // same logic as above, if the order is not 0 it belongs in main content
              if (tileLayout.tile_order !== 0) {
                // filter out the sidebar category tiles of any tiles that are main content tiles
                sidebarCategoryClone.tiles = sidebarCategoryClone.tiles?.filter((tile) => {
                  // clone the tile to not mutate
                  const tileClone = { ...tile };
                  // if they are main content tiles then push them into the main content version of this category
                  if (Number(tileClone.id) === tileLayout.tile_id) {
                    // set the tile order
                    tileClone.order = tileLayout.tile_order;
                    mainContentCategory.tiles?.push(tileClone);
                  }
                  // return all non-main content tiles back to the sidebar tiles.
                  return Number(tileClone.id) !== tileLayout.tile_id;
                });
              }
            });
            // push the final category into the main content area
            mainContent.push(mainContentCategory);
          }
          // return all sidebar categories with the new set of tiles that are not main content tiles
          return sidebarCategoryClone;
        });
      }
    });
    // set the content for both sidebar and main content
    setSidebarData(sideBarContent);
    setMainContentData(mainContent);
    // sort the main content
    handleSortList(true);
  };

  /**
   * @description Gets cachedUser from Azure SSO and gets all resources from server and sets to state.
   */
  useEffect(() => {
    const cachedUser = authContext.getCachedUser();

    getData(cachedUser).then((result) => {
      const { userData, inventory, layoutData } = result;

      setUser(userData);
      setTiles(inventory);
      setLayout(layoutData);
      generateInitalContentFromLayout(layoutData, inventory);
    });
  }, []);

  /**
   * @description Converts ICategoryDnDLayout interface to ILayout interface to be sent to server for saving.
   * @param {ICategoryDnDLayout[]} content - list of category data in both sidebar and main content area
   * @param startingLayout - Current config of sidebar/main content data
   * @param prevLayout - Initial layout state from server
   * @returns {ILayout} - layout data after save, to be sent to server
   */
  const convertContentToLayout = (
    content: ICategoryDnDLayout[],
    startingLayout: ILayout,
    prevLayout: ILayout,
  ): ILayout => {
    return content.reduce((convertedLayout, category) => {
      const convertedLayoutClone = { ...convertedLayout };
      if (category) {
        const existingDBCategory = prevLayout.category_layout.find(
          (catLayout) => catLayout.category_id === category.id,
        );

        const categoryConfig: ICategoryLayout = {
          category_db_id: existingDBCategory ? existingDBCategory.category_db_id : 0, // Value of 0 will auto increment in database
          category_id: existingDBCategory
            ? existingDBCategory.category_id
            : (category.id as number), // TODO: Figure out typing to remove type casting
          category_order: category.order as number, // TODO: Figure out typing to remove type casting
        };

        category.tiles?.forEach((tile) => {
          const existingTile = prevLayout.tile_layout.find(
            (tileLayout) => tileLayout.tile_id === Number(tile.id),
          );
          const tileConfig: ITileLayout = {
            tile_db_id: existingTile ? existingTile.tile_db_id : 0,
            tile_id: existingTile ? existingTile.tile_id : Number(tile.id), // TODO: Change tile.id to number and remove parseInt here
            tile_order: tile.order as number,
          };
          convertedLayoutClone.tile_layout.push(tileConfig);
        });
        let existingLayoutCategory = false;
        convertedLayoutClone.category_layout = convertedLayoutClone.category_layout.map(
          (catLayout) => {
            if (catLayout.category_id === category.id) {
              existingLayoutCategory = true;
              const catLayoutClone = { ...catLayout };
              catLayoutClone.category_order = category.order as number;
              return catLayoutClone;
            }
            return catLayout;
          },
        );

        if (!existingLayoutCategory) convertedLayoutClone.category_layout.push(categoryConfig);
      }

      return convertedLayoutClone;
    }, startingLayout);
  };

  /**
   * @description Converts main content data into the layout interface to be posted to DB
   * @param {ICategoryDnDLayout} mainContent - Data that is used to display the information in the "main content" section
   * @returns {ILayout} Layout interface data
   */
  const generateFullLayout = (
    sidebarContent: ICategoryDnDLayout[],
    mainContent: ICategoryDnDLayout[],
    prevLayout: ILayout,
  ): ILayout => {
    const startingLayout: ILayout = {
      tile_layout: [],
      category_layout: [],
    };
    return convertContentToLayout(
      mainContent,
      convertContentToLayout(sidebarContent, startingLayout, prevLayout),
      prevLayout,
    );
  };

  /**
   * @description Saves the layout data to the database onClick of save button in main content
   */
  const saveDashboard = (): void => {
    const prevLayout = { ...layout };
    const fullLayout = generateFullLayout(sidebarData, mainContentData, prevLayout);

    postLayout(fullLayout, user.employee_id).then((response) => {
      if ((response as AxiosResponse).status === 200) setSaved(true);
    });
  };

  /**
   * @description A function that adds a category container
   * to the dashboard based on selected category
   * @param {string} categoryToAdd - Selected category that will be used to index
   * @returns - An updated state object with newly added categories
   */
  const handleAddCategory = (categoryToAdd?: string) => {
    if (!tiles) {
      return undefined;
    }

    const categoryExists = mainContentData.map((category) => category.name).includes(categoryToAdd);

    if (categoryExists) {
      return undefined;
    }
    const sideBarCategoryToUpdate = {
      ...sidebarData.find((category) => category.name === categoryToAdd),
    };
    const addedTiles: ITileValues[] = [];
    const categoryObj: ICategoryDnDLayout = {} as ICategoryDnDLayout;

    tiles.forEach((tile: ITileValues, index) => {
      const tileOrder = index + 1000;
      const clonedTile = { ...tile };
      if (tile.category === categoryToAdd) {
        clonedTile.order = tileOrder;
        addedTiles.push(clonedTile);
        categoryObj.id = sideBarCategoryToUpdate.id;
        categoryObj.name = tile.category;
        categoryObj.order = mainContentData.length + 1000;
        categoryObj.tiles = addedTiles;
      }
    });

    // Remove tiles from sidebar once category is added to main layout
    setSidebarData((prevState) => {
      const categories = [...prevState];
      sideBarCategoryToUpdate.tiles = [];
      const catIndex = categories.findIndex(
        (category) => category.id === sideBarCategoryToUpdate.id,
      );
      categories[catIndex] = sideBarCategoryToUpdate;

      return [...categories];
    });

    setSaved(false);

    return setMainContentData([...mainContentData, categoryObj]);
  };

  /**
   * @description A function that removes a category container
   * from the dashboard based on selected category
   * @param {string} categoryToRemove - Selected category that will be used to index
   */
  const handleRemoveCategory = (categoryToRemove?: string): void => {
    if (!tiles) {
      return;
    }

    const addedTiles: ITileValues[] = [];
    const categoryObj: ICategoryDnDLayout = {} as ICategoryDnDLayout;

    tiles.forEach((tile: ITileValues) => {
      if (tile.category === categoryToRemove) {
        addedTiles.push(tile);
        categoryObj.name = tile.category;
        const dynamicCategoryId = uniqueId();
        categoryObj.id = Number(dynamicCategoryId);
        categoryObj.order = mainContentData.length + 1;
        categoryObj.tiles = [addedTiles] as unknown as ITileValues[];
      }
    });

    // Add tiles from main layout back to sidebar once category is removed
    setSidebarData((prevState) => {
      const categories = [...prevState];
      const sideBarCategoryToUpdate = {
        ...categories.find((category) => category.name === categoryToRemove),
      };
      const mainContentCategoryToUpdate = {
        ...mainContentData.find((category) => category.name === categoryToRemove),
      };
      const updatedSidebarTiles = [
        ...(sideBarCategoryToUpdate.tiles as ITileValues[]),
        ...(mainContentCategoryToUpdate.tiles as ITileValues[]),
      ].map((tile) => {
        const clonedTile = { ...tile };
        clonedTile.order = 0;
        return clonedTile;
      });
      sideBarCategoryToUpdate.tiles = updatedSidebarTiles;
      const catIndex = categories.findIndex(
        (category) => category.id === sideBarCategoryToUpdate.id,
      );
      categories[catIndex] = { ...sideBarCategoryToUpdate };

      return [...categories];
    });

    setSaved(false);

    const filteredMainContentData = mainContentData.filter((key) => key.name !== categoryToRemove);

    setMainContentData(filteredMainContentData);
  };

  /**
   * @description A function that adds a subcategory
   * to the dashboard based on selected subcategory id
   * @param {string} subCategoryIdToAdd - Id of selected subcategory that will be used to index
   */
  const handleAddSubCategory = (
    subCategoryIdToAdd: string,
    categoryIndex: number,
    categoryName?: string,
  ): void => {
    if (!tiles) {
      return;
    }
    const addedTiles: ITileValues[] = [];
    const categoryObj: ICategoryDnDLayout = {} as ICategoryDnDLayout;

    tiles.forEach((tile: ITileValues, index) => {
      const clonedTile = { ...tile };
      clonedTile.order = index + 1000;

      if (tile.id === subCategoryIdToAdd) {
        const categoryExists = mainContentData
          .map((category) => category.name)
          .includes(tile.category);

        // Dashboard does not contain category of selected tile
        if (!categoryExists) {
          addedTiles.push(clonedTile);
          const dynamicCategoryId = mainContentData.length ? mainContentData.length : 0;
          categoryObj.id = dynamicCategoryId;
          categoryObj.order = dynamicCategoryId + 1;
          categoryObj.name = clonedTile.category;
          categoryObj.tiles = addedTiles;

          return setMainContentData([...mainContentData, categoryObj]);
        }
        // Dashboard contains category but does not contain selected tile
        if (categoryExists) {
          setMainContentData((prevState) => {
            const categories = [...prevState];
            const categoryToUpdate = {
              ...categories.find((category) => category.name === categoryName),
            };
            const categoryTiles = [...(categoryToUpdate.tiles as never[]), clonedTile];
            categoryToUpdate.tiles = categoryTiles;
            const catIndex = categories.findIndex(
              (category) => category.id === categoryToUpdate.id,
            );
            categories[catIndex] = { ...categoryToUpdate };

            return [...categories];
          });
        }
      }
      // Remove tile from sidebar once added to layout
      return setSidebarData((prevState) => {
        const categories = [...prevState];
        const categoryToUpdate = { ...categories[categoryIndex] };
        const filteredTiles = categoryToUpdate.tiles?.filter(
          (tileItem) => tileItem.id !== subCategoryIdToAdd,
        );
        categoryToUpdate.tiles = filteredTiles;
        categories[categoryIndex] = { ...categoryToUpdate };

        return [...categories];
      });
    });

    setSaved(false);
  };

  /**
   * @description A function that removes a subcategory
   * from the dashboard based on selected subcategory id
   * @param {string} subCategoryIdToRemove - Id of selected subcategory that will be used to index
   */
  const handleRemoveSubCategory = (subCategoryIdToRemove: string, tileCategory: string): void => {
    if (!tiles) {
      return;
    }

    setSidebarData((prevState) => {
      const categories = [...prevState];
      const categoryToUpdate = {
        ...categories.find((category) => category.name === tileCategory),
      };
      const tileToAdd = tiles.find((tile) => tile.id === subCategoryIdToRemove);
      if (tileToAdd) tileToAdd.order = 0;
      const categoryTiles = [...(categoryToUpdate.tiles as never[]), tileToAdd];
      categoryToUpdate.tiles = categoryTiles as never[];
      const catIndex = categories.findIndex((category) => category.id === categoryToUpdate.id);
      categories[catIndex] = { ...categoryToUpdate };

      return [...categories];
    });

    setSaved(false);

    setMainContentData((prevState) => {
      const categories = [...prevState];

      const updatedMainContent = categories.reduce(
        (mainContent: ICategoryDnDLayout[], category) => {
          const clonedCategory = category;
          if (clonedCategory.name === tileCategory) {
            mainContent.push(...categories);
            const filteredTiles = clonedCategory.tiles?.filter(
              (tile) => tile.id !== subCategoryIdToRemove,
            );
            if (filteredTiles?.length === 0) {
              return mainContent.filter((categoryItem) => categoryItem.name !== tileCategory);
            }
            clonedCategory.tiles = filteredTiles;
            mainContent.concat(clonedCategory);
          }
          return mainContent;
        },
        [],
      );

      return [...updatedMainContent];
    });
  };

  /**
   * @description A function to toggle the sidebar's expanded state
   * @returns {void}
   */
  const toggleExpanded = (): void => {
    setExpanded(!expanded);
  };

  // TODO: Create component to replace MainContent for no data
  // if (!tiles.length) {
  //   return <p>Connecting to database...</p>;
  // }

  return (
    <main>
      <Sidebar
        sidebarData={sidebarData}
        toggleExpanded={toggleExpanded}
        expanded={expanded}
        handleAddCategory={handleAddCategory}
        handleAddSubCategory={handleAddSubCategory}
      />
      <MainContent
        user={user}
        saved={saved}
        saveDashboard={saveDashboard}
        mainContentData={mainContentData}
        expanded={expanded}
        handleRemoveCategory={handleRemoveCategory}
        handleRemoveSubCategory={handleRemoveSubCategory}
        handleSortList={handleSortList}
      />
    </main>
  );
}

export default App;
