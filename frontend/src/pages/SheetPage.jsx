import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Search, Zap, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth.jsx";
import { progressQuery, questionsQuery, setProgress, topicsQuery } from "@/lib/sheet.js";
import { ProgressBar } from "@/components/ProgressBar.jsx";
import { QuestionRow } from "@/components/QuestionRow.jsx";

// 8-hue palette cycling for topics (oklch h values + light-mode colors)
const TOPIC_COLORS = [
  { hue: 290, bg: "oklch(0.93 0.06 290)", border: "oklch(0.80 0.12 290)", text: "oklch(0.42 0.18 290)", dot: "oklch(0.50 0.22 290)" },
  { hue: 155, bg: "oklch(0.92 0.06 155)", border: "oklch(0.78 0.12 155)", text: "oklch(0.40 0.17 155)", dot: "oklch(0.48 0.17 155)" },
  { hue: 225, bg: "oklch(0.92 0.06 225)", border: "oklch(0.78 0.12 225)", text: "oklch(0.42 0.18 225)", dot: "oklch(0.52 0.18 225)" },
  { hue: 25,  bg: "oklch(0.94 0.06 25)",  border: "oklch(0.80 0.12 25)",  text: "oklch(0.44 0.18 25)",  dot: "oklch(0.55 0.19 25)"  },
  { hue: 65,  bg: "oklch(0.96 0.06 75)",  border: "oklch(0.82 0.12 70)",  text: "oklch(0.46 0.17 65)",  dot: "oklch(0.60 0.17 65)"  },
  { hue: 330, bg: "oklch(0.93 0.06 330)", border: "oklch(0.79 0.12 330)", text: "oklch(0.44 0.18 330)", dot: "oklch(0.54 0.20 330)" },
  { hue: 190, bg: "oklch(0.93 0.06 190)", border: "oklch(0.78 0.12 190)", text: "oklch(0.42 0.17 190)", dot: "oklch(0.50 0.18 190)" },
  { hue: 45,  bg: "oklch(0.95 0.06 50)",  border: "oklch(0.82 0.12 50)",  text: "oklch(0.46 0.17 45)",  dot: "oklch(0.58 0.18 45)"  },
];

const TOPIC_COLORS_DARK = [
  { hue: 290, bg: "oklch(0.26 0.09 290)", border: "oklch(0.38 0.14 290)", text: "oklch(0.78 0.18 290)", dot: "oklch(0.72 0.20 290)" },
  { hue: 155, bg: "oklch(0.22 0.07 155)", border: "oklch(0.35 0.12 155)", text: "oklch(0.72 0.18 155)", dot: "oklch(0.65 0.18 155)" },
  { hue: 225, bg: "oklch(0.22 0.07 225)", border: "oklch(0.35 0.12 225)", text: "oklch(0.76 0.16 225)", dot: "oklch(0.68 0.16 225)" },
  { hue: 25,  bg: "oklch(0.24 0.07 25)",  border: "oklch(0.38 0.13 25)",  text: "oklch(0.78 0.18 25)",  dot: "oklch(0.70 0.18 25)"  },
  { hue: 65,  bg: "oklch(0.26 0.07 70)",  border: "oklch(0.40 0.12 70)",  text: "oklch(0.84 0.16 65)",  dot: "oklch(0.76 0.16 65)"  },
  { hue: 330, bg: "oklch(0.24 0.08 330)", border: "oklch(0.37 0.14 330)", text: "oklch(0.78 0.18 330)", dot: "oklch(0.72 0.20 330)" },
  { hue: 190, bg: "oklch(0.22 0.07 190)", border: "oklch(0.35 0.12 190)", text: "oklch(0.76 0.17 190)", dot: "oklch(0.68 0.18 190)" },
  { hue: 45,  bg: "oklch(0.24 0.07 50)",  border: "oklch(0.38 0.12 50)",  text: "oklch(0.82 0.17 45)",  dot: "oklch(0.76 0.18 45)"  },
];

export default function SheetPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const topics = useQuery(topicsQuery());
  const questions = useQuery(questionsQuery());
  const progress = useQuery(progressQuery(userId));

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState([]);
  const [restored, setRestored] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dsa-expanded");
      if (saved) setExpanded(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem("dsa-expanded", JSON.stringify(expanded));
    } catch {
      /* ignore */
    }
  }, [expanded, restored]);

  const done = useMemo(() => progress.data ?? new Set(), [progress.data]);

  const toggleProgress = useMutation({
    mutationFn: async ({ questionId, next }) => {
      if (!userId) throw new Error("not-signed-in");
      await setProgress(userId, questionId, next);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
    onError: (error) => {
      toast(
        error.message === "not-signed-in"
          ? "Sign in to track your progress."
          : "Could not save your progress. Try again.",
      );
    },
  });

  const grouped = useMemo(() => {
    const all = questions.data ?? [];
    const term = search.trim().toLowerCase();
    return (topics.data ?? []).map((topic) => {
      const topicQuestions = all.filter((q) => q.topic_id === topic.id);
      const matchesTopic = term.length > 0 && topic.name.toLowerCase().includes(term);
      const visible = topicQuestions.filter((q) => {
        if (term && !matchesTopic && !q.name.toLowerCase().includes(term)) return false;
        if (filter === "completed" && !done.has(q.id)) return false;
        if (filter === "pending" && done.has(q.id)) return false;
        return true;
      });
      return {
        topic,
        visible,
        total: topicQuestions.length,
        completed: topicQuestions.filter((q) => done.has(q.id)).length,
      };
    });
  }, [topics.data, questions.data, search, filter, done]);

  const searching = search.trim().length > 0 || filter !== "all";
  const shown = grouped.filter((g) => (searching ? g.visible.length > 0 : g.total > 0));

  const totalQuestions = questions.data?.length ?? 0;
  const totalCompleted = (questions.data ?? []).filter((q) => done.has(q.id)).length;
  const totalPct = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;
  const remaining = totalQuestions - totalCompleted;

  const loading = topics.isLoading || questions.isLoading;
  const failed = topics.isError || questions.isError;

  const toggleTopic = (id) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const filters = [
    { key: "all", label: "All", icon: null },
    { key: "completed", label: "Completed", icon: "âœ“" },
    { key: "pending", label: "Pending", icon: "â—‹" },
  ];

  const palette = isDark ? TOPIC_COLORS_DARK : TOPIC_COLORS;

  return (
    <main className="container-sheet py-8 sm:py-10">
      {/* â”€â”€ Hero header â”€â”€ */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
        style={{
          background: isDark
            ? "linear-gradient(135deg, oklch(0.20 0.04 290 / 0.6) 0%, oklch(0.18 0.03 225 / 0.4) 50%, oklch(0.17 0.03 155 / 0.3) 100%)"
            : "linear-gradient(135deg, oklch(0.93 0.06 290 / 0.5) 0%, oklch(0.92 0.06 225 / 0.4) 50%, oklch(0.93 0.06 155 / 0.3) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.50 0.22 290)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.52 0.18 225)" }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              DSA Sheet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Master data structures & algorithms, one problem at a time.
            </p>
          </div>

          {/* Stats mini cards */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "oklch(0.92 0.06 155)" }}
              >
                <Trophy className="h-3.5 w-3.5" style={{ color: "oklch(0.40 0.17 155)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Solved</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "oklch(0.40 0.17 155)" }}>
                  {totalCompleted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "oklch(0.96 0.07 75)" }}
              >
                <Clock className="h-3.5 w-3.5" style={{ color: "oklch(0.46 0.17 65)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "oklch(0.46 0.17 65)" }}>
                  {remaining}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "oklch(0.93 0.06 290)" }}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: "oklch(0.50 0.22 290)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "oklch(0.50 0.22 290)" }}>
                  {totalPct}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall completion</span>
            <span className="font-medium tabular-nums">{totalCompleted} / {totalQuestions}</span>
          </div>
          <ProgressBar value={totalCompleted} total={totalQuestions} />
        </div>

        {!userId && (
          <p className="mt-3 text-xs text-muted-foreground">
            <Link
              to="/auth"
              className="font-medium underline underline-offset-2 transition-colors"
              style={{ color: "oklch(0.50 0.22 290)" }}
            >
              Sign in
            </Link>{" "}
            to save your progress across devices.
          </p>
        )}
      </div>

      {/* â”€â”€ Search & filters â”€â”€ */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or topicsâ€¦"
            className="input-field pl-9"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === key
                  ? key === "completed"
                    ? "bg-success text-success-fg shadow-sm"
                    : key === "pending"
                    ? "text-warning-fg shadow-sm"
                    : "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-hover"
              }`}
              style={
                filter === key && key === "pending"
                  ? { background: "oklch(0.64 0.17 65)", color: "oklch(0.18 0.05 65)" }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Topic list â”€â”€ */}
      <div>
        {loading && (
          <div className="flex flex-col gap-3 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-14 rounded-xl border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {failed && (
          <div className="rounded-xl border border-border bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">Could not load the sheet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Check your connection and refresh.</p>
          </div>
        )}

        {!loading && !failed && shown.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-2xl mb-2">ðŸ”</p>
            <p className="text-sm font-medium text-foreground">No questions found.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try changing your search or filter.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {shown.map(({ topic, visible, total, completed }, i) => {
            const open = expanded.includes(topic.id) || searching;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const allDone = completed === total && total > 0;
            const color = palette[i % palette.length];

            return (
              <section
                key={topic.id}
                className="overflow-hidden rounded-xl border transition-all duration-200"
                style={{ borderColor: open ? color.border : "var(--color-border)" }}
              >
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-200"
                  style={{
                    background: open ? color.bg : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!open) e.currentTarget.style.background = color.bg + "80";
                  }}
                  onMouseLeave={(e) => {
                    if (!open) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Color dot */}
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-200"
                    style={{
                      background: color.dot,
                      boxShadow: open ? `0 0 0 3px ${color.dot}30` : "none",
                    }}
                  />

                  {/* Topic number */}
                  <span
                    className="w-6 shrink-0 text-xs font-mono tabular-nums font-semibold"
                    style={{ color: color.text }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Topic name */}
                  <span
                    className={`min-w-0 flex-1 truncate text-sm font-semibold ${allDone ? "opacity-60" : ""}`}
                  >
                    {topic.name}
                  </span>

                  {/* Badge: x/total */}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
                    style={{
                      background: allDone ? color.dot : color.bg,
                      color: allDone ? (isDark ? "oklch(0.10 0.015 155)" : "oklch(0.99 0 0)") : color.text,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    {completed}/{total}
                  </span>

                  {/* Mini progress bar */}
                  <span className="hidden shrink-0 sm:block">
                    <span className="flex h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <span
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${pct}%`, background: color.dot }}
                      />
                    </span>
                  </span>

                  {/* Chevron */}
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                    style={{ color: open ? color.dot : "var(--color-muted-foreground)" }}
                  />
                </button>

                {open && (
                  <div
                    className="border-t"
                    style={{ borderColor: color.border }}
                  >
                    {visible.length === 0 ? (
                      <p className="px-10 py-4 text-sm text-muted-foreground">
                        No questions here yet.
                      </p>
                    ) : (
                      <div>
                        {visible.map((question, qi) => (
                          <QuestionRow
                            key={question.id}
                            question={question}
                            index={qi + 1}
                            completed={done.has(question.id)}
                            accentColor={color}
                            onToggle={() =>
                              toggleProgress.mutate({
                                questionId: question.id,
                                next: !done.has(question.id),
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

