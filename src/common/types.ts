/**
 * @description Interface for the user
 * @members {id: number, email: string, role: IRole}
 */
export interface IUser {
  employee_id: number;
  email: string;
  name?: string;
  role_id: number;
  initial_login: boolean;
  jobTitle?: string;
}

/**
 * @description Interface for the role of the user based off their job title
 * @members {id: number, name: string, description: string}
 */
export interface IRole {
  id: number;
  name: string;
  description: string;
}

/**
 * @description Interface for Metric data
 * @members { date: string, value: string, target: string, image_url: string, trend_ind_url: string}
 */
export interface IMetricValues {
  datetime: string;
  value: string;
  target: string;
  image_url: string;
  trend_ind_url: string;
}

/**
 * @description Interface for tile data
 * @members { id: number, category: string, name: string, owner: string, description: string, dashboard_url: string, metrics: IMetricValues }
 */
export interface ITileValues {
  id: string;
  category: string;
  name: string;
  owner: string;
  description: string;
  order?: number;
  dashboard_url: string;
  metrics: IMetricValues;
}

/**
 * @description Interface for tile data grouped by category
 * @members { [key: string]: ITileValues[] }
 */
export interface ITileDictionary {
  [key: string]: ITileValues[];
}

export interface ITileLayout {
  tile_db_id: number;
  tile_id: number;
  tile_order: number;
}

export interface ICategoryLayout {
  category_db_id: number;
  category_id: number;
  category_order: number;
}
export interface ILayout {
  tile_layout: ITileLayout[];
  category_layout: ICategoryLayout[];
}

export interface ICategoryDnDLayout {
  id?: number;
  name?: string;
  order?: number;
  tiles?: ITileValues[];
}
export interface IGroupedData {
  userData: IUser;
  role: IRole;
  inventory: ITileValues[];
  layoutData: ILayout;
}
