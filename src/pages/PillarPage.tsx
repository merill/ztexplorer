import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkmapView from '@/components/MarkmapView';
import { buildMindmapTree } from '@/buildTree';
import { pillarConfigs } from '@/pillarConfig';
import { useTheme } from '@/hooks/useTheme';
import { useTaskPanel } from '@/hooks/useTaskPanel';
import type { PillarData, MindmapNode, Task } from '@/types';

export default function PillarPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const { theme } = useTheme();
  const { openTask } = useTaskPanel();
  const [tree, setTree] = useState<MindmapNode | null>(null);
  const [pillarData, setPillarData] = useState<PillarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = pillarConfigs.find((p) => p.id === pillarId);

  useEffect(() => {
    if (!config) {
      setError('Pillar not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setTree(null);
    setPillarData(null);

    fetch(`/${config.dataFile}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
        return JSON.parse(cleaned) as PillarData;
      })
      .then((data) => {
        setPillarData(data);
        setTree(buildMindmapTree(data, config.name));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [config]);

  // Build a lookup from link → Task so we can resolve clicked mindmap links
  const handleLinkClick = (href: string) => {
    if (!pillarData || !config) return;
    const task = pillarData.tasks.find((t: Task) => t.link === href);
    if (!task) return;
    const area = pillarData.functionalAreas.find((a) => a.id === task.functionalAreaId);
    openTask(task, config.name, area?.name ?? '');
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Pillar not found
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Failed to load: {error}
      </div>
    );
  }

  if (loading || !tree) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading {config.name} pillar...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b bg-background shrink-0">
        <img src={`/icons/${config.icon}`} alt="" className="h-6 w-6" />
        <div>
          <h1 className="text-lg font-semibold">{config.name}</h1>
          <p className="text-xs text-muted-foreground">
            {tree.children?.length} functional areas &middot; Scroll to zoom, drag to pan, click
            circles to expand/collapse
          </p>
        </div>
      </div>

      {/* Mindmap */}
      <div className="flex-1 min-h-0">
        <MarkmapView root={tree} theme={theme} onLinkClick={handleLinkClick} />
      </div>
    </div>
  );
}
