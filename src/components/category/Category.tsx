import remove from '../../assets/remove.svg';
import './Category.scss';

function Category({
  categoryName,
  handleRemoveCategory,
}: {
  categoryName: string;
  handleRemoveCategory: (category: string) => void;
}): JSX.Element {
  return (
    <>
      <div className="category">
        <input
          className="remove-category"
          type="image"
          src={remove}
          alt="Remove Category"
          onClick={() => handleRemoveCategory(categoryName)}
        />
        <h2 className="category-title">{categoryName}</h2>
      </div>
      <hr />
    </>
  );
}

export default Category;
