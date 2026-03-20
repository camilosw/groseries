import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './OrderScreen.css';
import { useGroceries } from '../store/grocery-context';
import type { GroceryItem } from '../types';

interface OrderScreenProps {
  onClose: () => void;
}

interface SortableItemProps {
  item: GroceryItem;
}

function SortableItem({ item }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`order-item${isDragging ? ' order-item--dragging' : ''}`}
    >
      <span className={`order-item__name${item.bought ? ' order-item__name--bought' : ''}`}>
        {item.name}
      </span>
      <span className="order-item__handle" {...attributes} {...listeners} aria-label="Drag to reorder">
        ⠿
      </span>
    </li>
  );
}

export function OrderScreen({ onClose }: OrderScreenProps) {
  const { state, dispatch } = useGroceries();

  const sorted = [...state.items].sort((a, b) => a.purchaseOrder - b.purchaseOrder);
  const ids = sorted.map(item => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    dispatch({
      type: 'REORDER',
      activeId: String(active.id),
      overId: String(over.id),
    });
  }

  return (
    <div className="order-screen">
      <div className="order-screen__header">
        <button className="order-screen__back" onClick={onClose} aria-label="Back">
          ←
        </button>
        <span className="order-screen__title">Order</span>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="order-screen__list">
            {sorted.map(item => (
              <SortableItem key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
