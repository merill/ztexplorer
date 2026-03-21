import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Task } from '@/types';

interface TaskDetailPanelProps {
  task: Task;
  pillarName: string;
  functionalAreaName: string;
}

/* ---------- pill color helpers ---------- */

function levelColor(level: string): string {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'P0':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'P1':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'P2':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'P3':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/* ---------- inline SVG icons matching ZT workshop ---------- */

function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81a.49.49 0 0 0-.48-.41h-3.84c-.24 0-.44.17-.47.41L9.25 5.35c-.59.24-1.13.57-1.62.94L5.24 5.33a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
        fill="currentColor"
      />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 4 24 18" className={className} aria-hidden="true">
      <path
        d="M9 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM9 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2s5.78 1.28 6 2H3zm14-4c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h4v-2.5c0-2.33-3.33-3.5-5-3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------- extract doc slug from link ---------- */

function docSlugFromLink(link: string): string | null {
  if (!link) return null;
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

/* ---------- metadata field ---------- */

function MetaField({
  label,
  icon,
  value,
  colorClass,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

/* ---------- component ---------- */

export default function TaskDetailPanel({
  task,
  pillarName,
  functionalAreaName,
}: TaskDetailPanelProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [mdLoading, setMdLoading] = useState(true);

  useEffect(() => {
    setMarkdown(null);
    setMdLoading(true);

    const slug = docSlugFromLink(task.link);
    if (!slug) {
      setMdLoading(false);
      return;
    }

    fetch(`/docs/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        // Strip docusaurus frontmatter if present
        const stripped = text.replace(/^---[\s\S]*?---\s*/, '');
        setMarkdown(stripped);
        setMdLoading(false);
      })
      .catch(() => {
        setMarkdown(null);
        setMdLoading(false);
      });
  }, [task]);

  return (
    <div className="space-y-5 pt-2">
      {/* Task heading with icon */}
      <div className="flex items-start gap-3 pr-8">
        <img src={`/icons/${task.icon}`} alt="" className="h-8 w-8 shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0">
          <h2 className="text-lg font-semibold leading-tight">{task.name}</h2>
          <p className="text-xs text-muted-foreground">
            {pillarName} &rsaquo; {functionalAreaName} &rsaquo; {task.swimlane}
          </p>
        </div>
      </div>

      {/* Documentation link */}
      {task.link && (
        <a
          href={task.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          View on Microsoft docs
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* Key metadata fields */}
      <div className="flex flex-wrap gap-4">
        {task.priority && (
          <MetaField
            label="Priority"
            value={task.priority}
            colorClass={priorityColor(task.priority)}
          />
        )}
        {task.userImpact && (
          <MetaField
            label="User Impact"
            icon={<PeopleIcon className="h-3.5 w-3.5" />}
            value={task.userImpact}
            colorClass={levelColor(task.userImpact)}
          />
        )}
        {task.implementationEffort && (
          <MetaField
            label="Implementation Effort"
            icon={<GearIcon className="h-3.5 w-3.5" />}
            value={task.implementationEffort}
            colorClass={levelColor(task.implementationEffort)}
          />
        )}
        {task.license && (
          <MetaField
            label="License"
            icon={<span className="text-xs" aria-hidden="true">🔑</span>}
            value={task.license}
            colorClass="bg-muted text-foreground"
          />
        )}
      </div>

      <Separator />

      {/* Markdown content */}
      {mdLoading && (
        <p className="text-sm text-muted-foreground">Loading documentation...</p>
      )}
      {!mdLoading && markdown && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      )}
      {!mdLoading && !markdown && (
        <p className="text-sm text-muted-foreground italic">
          No documentation available for this task.
        </p>
      )}
    </div>
  );
}
