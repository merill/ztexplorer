import type { PillarConfig } from './types';

export const pillarConfigs: PillarConfig[] = [
  { id: 'identity',       name: 'Identity',            dataFile: 'identity-pillar-data.json',       icon: 'application-access.svg' },
  { id: 'devices',        name: 'Devices',             dataFile: 'devices-pillar-data.json',        icon: 'mdm-windows.svg' },
  { id: 'data',           name: 'Data',                dataFile: 'data-pillar-data.json',           icon: 'know-protect-data.svg' },
  { id: 'network',        name: 'Network',             dataFile: 'network-pillar-data.json',        icon: 'azure-networking.svg' },
  { id: 'infrastructure', name: 'Infrastructure',      dataFile: 'infrastructure-pillar-data.json', icon: 'app-infrastructure.svg' },
  { id: 'security-ops',   name: 'Security Operations', dataFile: 'security-ops-pillar-data.json',   icon: 'microsoft-sentinel.svg' },
  { id: 'ai',             name: 'AI',                  dataFile: 'ai-pillar-data.json',             icon: 'security-detection-response-ai.svg' },
];
