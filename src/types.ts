export interface FunctionalArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Task {
  id: string;
  name: string;
  implementationEffort: string;
  userImpact: string;
  icon: string;
  license: string;
  link: string;
  status: string;
  phase: string;
  functionalAreaId: string;
  dependencies: string[];
  swimlane: string;
  isCrossPillar: boolean;
  priority: string;
}

export interface PillarData {
  functionalAreas: FunctionalArea[];
  tasks: Task[];
}

export interface MindmapNode {
  name: string;
  icon?: string;
  link?: string;
  children?: MindmapNode[];
}

export interface PillarConfig {
  id: string;
  name: string;
  dataFile: string;
  icon: string;
}
