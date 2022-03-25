/* eslint-disable jsx-a11y/click-events-have-key-events */
import remove from '../../assets/remove.svg';
import { ITileValues } from '../../common/types';
import './Tile.scss';

function Tile({
  id,
  tileCategory,
  tileValues,
  handleRemoveSubCategory,
}: {
  id: string;
  tileCategory: string;
  tileValues: ITileValues;
  handleRemoveSubCategory: (id: string, tileCategory: string) => void;
}): JSX.Element {
  return (
    <a
      className="link-wrapper"
      target="_blank"
      rel="noopener noreferrer"
      href={tileValues.dashboard_url}
    >
      <div className="tile-container">
        <div className="left-content">
          <input
            className="remove-category"
            type="image"
            src={remove}
            alt="Remove Subcategory"
            onClick={(event) => {
              event.preventDefault();
              handleRemoveSubCategory(id, tileCategory);
            }}
          />
          <img
            className="subcategory-icon"
            src={tileValues.metrics.image_url}
            alt="subcategory icon"
          />
          <p className="subcategory-title">{tileValues.name}</p>
        </div>
        <div className="right-content">
          <p className="performance">{Number(tileValues.metrics.value).toFixed(2)}</p>
          <img src={tileValues.metrics.trend_ind_url} alt="Performance Indicator" />
        </div>
      </div>
    </a>
  );
}

export default Tile;
