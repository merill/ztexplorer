import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ── Types for the pre-built book data ─────────────────────────────── */

interface BookTask {
  id: string;
  name: string;
  icon: string;
  phase: string;
  priority: string;
  implementationEffort: string;
  userImpact: string;
  license: string;
  swimlane: string;
  link: string;
  contentHtml: string | null;
}

interface BookSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  tasks: BookTask[];
}

interface BookChapter {
  pillarId: string;
  pillarName: string;
  pillarIcon: string;
  introHtml: string | null;
  youtubeUrl: string | null;
  sections: BookSection[];
}

interface BookData {
  generatedAt: string;
  frameworkImage: string;
  chapters: BookChapter[];
}

/* ── Pill badge helper ─────────────────────────────────────────────── */

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      <span className="text-[10px] opacity-70">{label}</span> {value}
    </span>
  );
}

function phaseBadgeColor(phase: string) {
  switch (phase) {
    case 'First': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Then':  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Next':  return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:      return 'bg-muted text-muted-foreground';
  }
}

function priorityBadgeColor(priority: string) {
  switch (priority) {
    case 'P0': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'P1': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'P2': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'P3': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:   return 'bg-muted text-muted-foreground';
  }
}

function effortBadgeColor(level: string) {
  switch (level) {
    case 'High':   return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'Low':    return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:       return 'bg-muted text-muted-foreground';
  }
}

/* ── YouTube icon (inline SVG) ─────────────────────────────────────── */

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ── Anchor ID helpers ─────────────────────────────────────────────── */

function chapterId(pillarId: string) {
  return `chapter-${pillarId}`;
}

function sectionId(pillarId: string, sectionIdx: number) {
  return `section-${pillarId}-${sectionIdx}`;
}

/* ── TOC Sidebar ───────────────────────────────────────────────────── */

function BookToc({ book }: { book: BookData }) {
  return (
    <nav aria-label="Table of Contents" className="space-y-1">
      <h2 className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Contents
      </h2>
      {book.chapters.map((chapter, ci) => (
        <div key={chapter.pillarId} className="space-y-0.5">
          <a
            href={`#${chapterId(chapter.pillarId)}`}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <img src={`/icons/${chapter.pillarIcon}`} alt="" className="h-4 w-4 shrink-0" />
            <span className="truncate">{ci + 1}. {chapter.pillarName}</span>
          </a>
          <div className="ml-4 border-l pl-2 space-y-0.5">
            {chapter.sections.map((section, si) => (
              <a
                key={section.id}
                href={`#${sectionId(chapter.pillarId, si)}`}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <img src={`/icons/${section.icon}`} alt="" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{section.name}</span>
                <span className="ml-auto shrink-0 text-[10px] opacity-50">
                  {section.tasks.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function BookPage() {
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/book-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: BookData) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading book data...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-destructive">
          Failed to load book data{error ? `: ${error}` : ''}. Run{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">npm run build:book</code> first.
        </p>
      </div>
    );
  }

  const totalTasks = book.chapters.reduce(
    (sum, ch) => sum + ch.sections.reduce((s, sec) => s + sec.tasks.length, 0),
    0,
  );

  return (
    <div className="book-page flex h-full">
      {/* ── Left TOC sidebar (desktop) ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r bg-sidebar print:hidden">
        <div className="px-3 py-4">
          <h1 className="text-sm font-bold leading-tight">Microsoft Zero Trust Book</h1>
        </div>
        <Separator />
        <ScrollArea className="flex-1 py-2">
          <BookToc book={book} />
        </ScrollArea>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">

          {/* ── Save as PDF bar ─────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 print:hidden">
            <span className="text-xs text-muted-foreground">
              
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <path d="m9 15 3-3 3 3" />
              </svg>
              Save as PDF
            </button>
          </div>

          {/* ── Title page ──────────────────────────────────────────── */}
          <header className="space-y-6 text-center print:break-after-page">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Microsoft Zero Trust Book
            </h1>

            <img
              src={`/${book.frameworkImage}`}
              alt="Microsoft Zero Trust Framework — showing the six pillars: Identity, Devices, Data, Network, Infrastructure, and Security Operations, with AI at the center."
              className="mx-auto max-w-full rounded-lg shadow-md"
            />

            <div className="max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                This book view is based on the{' '}
                <a
                  href="https://zerotrust.microsoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Zero Trust Workshop
                </a>{' '}
                by Microsoft and is intended as a learning guide for understanding and
                implementing Zero Trust using the Microsoft Security stack.
              </p>
              <p>
                It covers {book.chapters.length} pillars, {totalTasks} tasks, and is
                organized as a reference you can read end-to-end or jump to any section
                that interests you.
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Generated on {new Date(book.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          <Separator className="print:hidden" />

          {/* ── Print-only TOC (since sidebar is hidden in print) ───── */}
          <nav className="hidden print:block print:break-after-page space-y-4" aria-label="Table of Contents">
            <h2 className="text-2xl font-bold tracking-tight">Table of Contents</h2>
            <ol className="space-y-3">
              {book.chapters.map((chapter, ci) => (
                <li key={chapter.pillarId}>
                  <span className="text-base font-semibold">
                    {ci + 1}. {chapter.pillarName}
                  </span>
                  <ol className="ml-6 mt-1 space-y-0.5">
                    {chapter.sections.map((section, si) => (
                      <li key={section.id} className="text-sm text-muted-foreground">
                        {ci + 1}.{si + 1} {section.name}
                        <span className="ml-1 text-xs opacity-60">
                          ({section.tasks.length})
                        </span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── Chapters ─────────────────────────────────────────────── */}
          {book.chapters.map((chapter, ci) => (
            <article key={chapter.pillarId} className="space-y-8 print:break-before-page">
              {/* Chapter heading */}
              <div id={chapterId(chapter.pillarId)} className="scroll-mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`/icons/${chapter.pillarIcon}`}
                    alt=""
                    className="h-8 w-8 shrink-0"
                  />
                  <h2 className="text-3xl font-bold tracking-tight">
                    Chapter {ci + 1}: {chapter.pillarName}
                  </h2>
                </div>
                {chapter.introHtml && (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: chapter.introHtml }}
                  />
                )}
                {chapter.youtubeUrl && (
                  <a
                    href={chapter.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <YouTubeIcon className="h-5 w-5" />
                    Watch on YouTube
                  </a>
                )}
              </div>

              {/* Sections (functional areas) */}
              {chapter.sections.map((section, si) => (
                <div key={section.id} className="space-y-4">
                  <div
                    id={sectionId(chapter.pillarId, si)}
                    className="scroll-mt-6 space-y-1"
                  >
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                      <img src={`/icons/${section.icon}`} alt="" className="h-5 w-5 shrink-0" />
                      {ci + 1}.{si + 1} {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground ml-7">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Tasks */}
                  {section.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border bg-card p-4 space-y-3 print:break-inside-avoid"
                    >
                      {/* Task header */}
                      <div className="flex items-start gap-2 min-w-0">
                        {task.icon && (
                          <img
                            src={`/icons/${task.icon}`}
                            alt=""
                            className="h-5 w-5 shrink-0 mt-0.5"
                          />
                        )}
                        <h4 className="text-base font-semibold leading-tight">
                          {task.name}
                        </h4>
                      </div>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge label="" value={task.phase} color={phaseBadgeColor(task.phase)} />
                        <Badge label="" value={task.priority} color={priorityBadgeColor(task.priority)} />
                        {task.implementationEffort && (
                          <Badge label="Effort:" value={task.implementationEffort} color={effortBadgeColor(task.implementationEffort)} />
                        )}
                        {task.userImpact && (
                          <Badge label="Impact:" value={task.userImpact} color={effortBadgeColor(task.userImpact)} />
                        )}
                        {task.license && (
                          <Badge label="License:" value={task.license} color="bg-muted text-foreground" />
                        )}
                      </div>

                      {/* Rendered doc content */}
                      {task.contentHtml && (
                        <>
                          <Separator />
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: task.contentHtml }}
                          />
                        </>
                      )}

                      {/* Doc link (visible in print) */}
                      {task.link && (
                        <p className="text-xs text-muted-foreground hidden print:block">
                          Source: {task.link}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {ci < book.chapters.length - 1 && <Separator className="print:hidden" />}
            </article>
          ))}

          {/* ── Footer ───────────────────────────────────────────────── */}
          <Separator />
          <footer className="text-center text-xs text-muted-foreground space-y-1 pb-8">
            <p>
              Based on the{' '}
              <a
                href="https://zerotrust.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Microsoft Zero Trust Workshop
              </a>
            </p>
            <p>
              This site is not a Microsoft product and is not affiliated with or endorsed
              by Microsoft.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
