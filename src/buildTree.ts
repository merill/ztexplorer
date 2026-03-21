import type { PillarData, MindmapNode } from './types';

export function buildMindmapTree(data: PillarData, rootName: string): MindmapNode {
  const root: MindmapNode = {
    name: rootName,
    children: [],
  };

  const tasksByArea = new Map<string, Map<string, PillarData['tasks']>>();

  for (const task of data.tasks) {
    if (!tasksByArea.has(task.functionalAreaId)) {
      tasksByArea.set(task.functionalAreaId, new Map());
    }
    const swimlanes = tasksByArea.get(task.functionalAreaId)!;
    if (!swimlanes.has(task.swimlane)) {
      swimlanes.set(task.swimlane, []);
    }
    swimlanes.get(task.swimlane)!.push(task);
  }

  for (const area of data.functionalAreas) {
    const areaNode: MindmapNode = {
      name: area.name,
      icon: area.icon,
      children: [],
    };

    const swimlanes = tasksByArea.get(area.id);
    if (swimlanes) {
      for (const [swimlaneName, tasks] of swimlanes) {
        const swimlaneNode: MindmapNode = {
          name: swimlaneName,
          children: tasks.map((task) => ({
            name: task.name,
            icon: task.icon,
            link: task.link,
          })),
        };
        areaNode.children!.push(swimlaneNode);
      }
    }

    root.children!.push(areaNode);
  }

  return root;
}
