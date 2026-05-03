import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortableProps {
  id: string;
  children: ReactNode;
}

const Item = ({ id, children }: SortableProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex gap-2 items-start"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-4 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground"
        aria-label="Drag handle"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
};

interface ListProps<T extends { id: string }> {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: ListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const handle = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIdx, newIdx));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handle}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, i) => (
            <Item key={item.id} id={item.id}>{renderItem(item, i)}</Item>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SectionListProps {
  ids: string[];
  onReorder: (next: string[]) => void;
  renderItem: (id: string) => ReactNode;
}

export function SortableSections({ ids, onReorder, renderItem }: SectionListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const handle = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(active.id as string), ids.indexOf(over.id as string)));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handle}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {ids.map((id) => (
            <Item key={id} id={id}>{renderItem(id)}</Item>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
