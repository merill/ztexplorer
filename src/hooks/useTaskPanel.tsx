import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Task } from '@/types';

export interface SelectedTask {
  task: Task;
  pillarName: string;
  functionalAreaName: string;
}

interface TaskPanelContextValue {
  selected: SelectedTask | null;
  openTask: (task: Task, pillarName: string, functionalAreaName: string) => void;
  close: () => void;
}

const TaskPanelContext = createContext<TaskPanelContextValue | null>(null);

export function TaskPanelProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedTask | null>(null);

  const openTask = useCallback(
    (task: Task, pillarName: string, functionalAreaName: string) => {
      setSelected({ task, pillarName, functionalAreaName });
    },
    [],
  );

  const close = useCallback(() => setSelected(null), []);

  return (
    <TaskPanelContext.Provider value={{ selected, openTask, close }}>
      {children}
    </TaskPanelContext.Provider>
  );
}

export function useTaskPanel(): TaskPanelContextValue {
  const ctx = useContext(TaskPanelContext);
  if (!ctx) throw new Error('useTaskPanel must be used within a TaskPanelProvider');
  return ctx;
}
