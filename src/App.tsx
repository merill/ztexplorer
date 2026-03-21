import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import OverviewPage from '@/pages/OverviewPage';
import PillarPage from '@/pages/PillarPage';
import { TaskPanelProvider, useTaskPanel } from '@/hooks/useTaskPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskDetailPanel from '@/components/TaskDetailPanel';

function TaskSheet() {
  const { selected, close } = useTaskPanel();

  return (
    <Sheet open={!!selected} onOpenChange={(open) => !open && close()}>
      <SheetContent className="p-0 flex flex-col sm:max-w-xl md:max-w-2xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{selected?.task.name ?? 'Task Details'}</SheetTitle>
          <SheetDescription>Task metadata and documentation</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 p-6">
          {selected && (
            <TaskDetailPanel
              task={selected.task}
              pillarName={selected.pillarName}
              functionalAreaName={selected.functionalAreaName}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default function App() {
  return (
    <TaskPanelProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="pillar/:pillarId" element={<PillarPage />} />
        </Route>
      </Routes>
      <TaskSheet />
    </TaskPanelProvider>
  );
}
