import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useTask } from "../../contexts/TaskContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PRIORITY_COLORS = {
  high: "text-[#ba1a1a] bg-[#ffdad6]",
  medium: "text-[#26665f] bg-[#b0efe5]",
  low: "text-[#5b5f5f] bg-[#e0e3e2]",
};

export default function TaskRow({ task, index, onEdit }) {
  const { toggleTask, deleteTask } = useTask();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteTask(task.id);
  };

  const formatDue = () => {
    if (!task.dueDate) return null;
    try {
      const d = new Date(task.dueDate + (task.dueTime ? "T" + task.dueTime : "T00:00"));
      const dateStr = format(d, "d MMM", { locale: id });
      return task.dueTime ? `${dateStr} • ${task.dueTime}` : dateStr;
    } catch { return null; }
  };

  const dueDateStr = formatDue();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`task-row group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-b border-[#dee4e3] gap-3 sm:gap-0
            ${task.completed ? "task-completed" : ""}
            ${index === 0 ? "rounded-t-xl" : ""}
            ${snapshot.isDragging ? "shadow-lg ring-2 ring-[#26665f]/20 rounded-xl" : ""}
            ${deleting ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div {...provided.dragHandleProps} className="text-[#bfc9c6] hover:text-[#26665f] cursor-grab active:cursor-grabbing shrink-0 mt-1 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-xl">drag_indicator</span>
            </div>
            <input
              type="checkbox"
              className="checkbox-custom mt-0.5 sm:mt-0"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="task-text text-base font-medium text-[#181c1c] truncate">{task.title}</span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {task.category && (
                  <span className="text-xs font-semibold text-[#3f4947] bg-[#e6e9e8] px-2 py-0.5 rounded-full">{task.category}</span>
                )}
                {dueDateStr && (
                  <span className="text-xs text-[#5b5f5f] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {dueDateStr}
                  </span>
                )}
                {task.priority && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(task)} className="text-[#575d5d] hover:text-[#26665f] transition-colors p-2 rounded-full hover:bg-[#f1f4f4]">
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button onClick={handleDelete} className="text-[#575d5d] hover:text-[#ba1a1a] transition-colors p-2 rounded-full hover:bg-[#ffdad6]">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
