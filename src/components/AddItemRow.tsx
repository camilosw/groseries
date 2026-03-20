interface AddItemRowProps {
  name: string;
  inList: boolean;
  isNew?: boolean;
  onAdd: () => void;
  onRemove?: () => void;
}

export function AddItemRow({
  name,
  inList,
  isNew = false,
  onAdd,
  onRemove,
}: AddItemRowProps) {
  return (
    <div className="add-item-row">
      <span className="add-item-row__name">
        {isNew ? <em>{name}</em> : name}
      </span>
      <button
        className={`add-item-row__btn${inList ? ' add-item-row__btn--active' : ''}`}
        onClick={inList ? onRemove : onAdd}
        aria-label={inList ? `Remove ${name} from list` : `Add ${name}`}
      >
        {inList ? '✓' : '+'}
      </button>
    </div>
  );
}
