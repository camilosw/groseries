interface AddItemRowProps {
  name: string;
  inList: boolean;
  isNew?: boolean;
  onAdd: () => void;
}

export function AddItemRow({
  name,
  inList,
  isNew = false,
  onAdd,
}: AddItemRowProps) {
  return (
    <div className="add-item-row">
      <span className="add-item-row__name">
        {isNew ? <em>{name}</em> : name}
      </span>
      <button
        className={`add-item-row__btn${inList ? ' add-item-row__btn--active' : ''}`}
        onClick={onAdd}
        aria-label={inList ? 'Already in list' : `Add ${name}`}
      >
        +
      </button>
    </div>
  );
}
