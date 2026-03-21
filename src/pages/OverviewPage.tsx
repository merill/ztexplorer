import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskPanel } from '@/hooks/useTaskPanel';
import { pillarConfigs } from '@/pillarConfig';
import type { PillarData, FunctionalArea, Task } from '@/types';

interface PillarOverview {
  configId: string;
  configName: string;
  configIcon: string;
  areas: FunctionalArea[];
  tasks: Task[];
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export default function OverviewPage() {
  const [pillars, setPillars] = useState<PillarOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openTask } = useTaskPanel();

  useEffect(() => {
    Promise.all(
      pillarConfigs.map(async (cfg) => {
        const res = await fetch(`/${cfg.dataFile}`);
        if (!res.ok) throw new Error(`Failed to load ${cfg.dataFile}: HTTP ${res.status}`);
        const text = await res.text();
        const data: PillarData = JSON.parse(stripBom(text));
        return {
          configId: cfg.id,
          configName: cfg.name,
          configIcon: cfg.icon,
          areas: data.functionalAreas,
          tasks: data.tasks,
        };
      })
    )
      .then((results) => {
        setPillars(results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Failed to load data: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading overview...
      </div>
    );
  }

  const totalAreas = pillars.reduce((sum, p) => sum + p.areas.length, 0);
  const totalTasks = pillars.reduce((sum, p) => sum + p.tasks.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Microsoft Zero Trust Framework</h1>
        <p className="text-muted-foreground max-w-3xl">
          An interactive explorer for Microsoft's{' '}
          <a
            href="https://zerotrust.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Zero Trust Workshop
          </a>
          . Browse all {pillars.length} pillars, {totalAreas} functional areas, and {totalTasks} tasks
          that make up the framework. Each pillar can be viewed as an interactive mindmap &mdash; click
          a pillar name below or use the sidebar to navigate.
        </p>
      </div>

      {/* Sticky pillar jump nav */}
      <nav className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex flex-wrap gap-2">
          {pillars.map((pillar) => (
            <a
              key={pillar.configId}
              href={`#${pillar.configId}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <img src={`/icons/${pillar.configIcon}`} alt="" className="h-4 w-4" />
              {pillar.configName}
            </a>
          ))}
        </div>
      </nav>

      {/* Pillar sections */}
      {pillars.map((pillar) => {
        const areaNameMap = new Map(pillar.areas.map((a) => [a.id, a.name]));

        const tasksByArea = new Map<string, Map<string, Task[]>>();
        for (const task of pillar.tasks) {
          if (!tasksByArea.has(task.functionalAreaId)) {
            tasksByArea.set(task.functionalAreaId, new Map());
          }
          const swimlanes = tasksByArea.get(task.functionalAreaId)!;
          if (!swimlanes.has(task.swimlane)) {
            swimlanes.set(task.swimlane, []);
          }
          swimlanes.get(task.swimlane)!.push(task);
        }

        return (
          <section key={pillar.configId} id={pillar.configId} className="space-y-4 scroll-mt-16">
            {/* Pillar heading */}
            <div className="flex items-center gap-3">
              <img src={`/icons/${pillar.configIcon}`} alt="" className="h-7 w-7" />
              <h2 className="text-2xl font-semibold">
                <Link
                  to={`/pillar/${pillar.configId}`}
                  className="hover:text-primary transition-colors"
                >
                  {pillar.configName}
                </Link>
              </h2>
              <span className="text-sm text-muted-foreground">
                {pillar.areas.length} areas &middot; {pillar.tasks.length} tasks
              </span>
            </div>

            {/* Functional area cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pillar.areas.map((area) => {
                const swimlanes = tasksByArea.get(area.id);
                return (
                  <Card key={area.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <img src={`/icons/${area.icon}`} alt="" className="h-5 w-5 shrink-0" />
                        {area.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {swimlanes &&
                        Array.from(swimlanes.entries()).map(([swimlaneName, tasks]) => (
                          <div key={swimlaneName}>
                            <h4 className="font-medium text-muted-foreground mb-1">
                              {swimlaneName}
                            </h4>
                            <ul className="space-y-0.5 pl-1">
                              {tasks.map((task) => (
                                <li key={task.id} className="flex items-start gap-1.5">
                                  <img
                                    src={`/icons/${task.icon}`}
                                    alt=""
                                    className="h-4 w-4 shrink-0 mt-0.5"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openTask(
                                        task,
                                        pillar.configName,
                                        areaNameMap.get(task.functionalAreaId) ?? '',
                                      )
                                    }
                                    className="text-left text-primary hover:underline cursor-pointer"
                                  >
                                    {task.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
