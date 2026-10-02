import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, TrendingUp, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth.jsx";
import { progressQuery, questionsQuery, topicsQuery } from "@/lib/sheet.js";
import { ProgressBar } from "@/components/ProgressBar.jsx";

// Same 8-hue palette as SheetPage
const TOPIC_COLORS = [
  { dot: "oklch(0.50 0.22 290)", bg: "oklch(0.93 0.06 290)", border: "oklch(0.80 0.12 290)", text: "oklch(0.42 0.18 290)" },
  { dot: "oklch(0.48 0.17 155)", bg: "oklch(0.92 0.06 155)", border: "oklch(0.78 0.12 155)", text: "oklch(0.40 0.17 155)" },
  { dot: "oklch(0.52 0.18 225)", bg: "oklch(0.92 0.06 225)", border: "oklch(0.78 0.12 225)", text: "oklch(0.42 0.18 225)" },
  { dot: "oklch(0.55 0.19 25)",  bg: "oklch(0.94 0.06 25)",  border: "oklch(0.80 0.12 25)",  text: "oklch(0.44 0.18 25)"  },
  { dot: "oklch(0.60 0.17 65)",  bg: "oklch(0.96 0.06 75)",  border: "oklch(0.82 0.12 70)",  text: "oklch(0.46 0.17 65)"  },
  { dot: "oklch(0.54 0.20 330)", bg: "oklch(0.93 0.06 330)", border: "oklch(0.79 0.12 330)", text: "oklch(0.44 0.18 330)" },
  { dot: "oklch(0.50 0.18 190)", bg: "oklch(0.93 0.06 190)", border: "oklch(0.78 0.12 190)", text: "oklch(0.42 0.17 190)" },
  { dot: "oklch(0.58 0.18 45)",  bg: "oklch(0.95 0.06 50)",  border: "oklch(0.82 0.12 50)",  text: "oklch(0.46 0.17 45)"  },
];

export default function ProgressPage() {
  const { userId, loading } = useAuth();
  const topics = useQuery(topicsQuery());
  const questions = useQuery(questionsQuery());
  const progress = useQuery(progressQuery(userId));

  const done = progress.data ?? new Set();
  const all = questions.data ?? [];
  const total = all.length;
  const completed = all.filter((q) => done.has(q.id)).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  if (!loading && !userId) {
    return (
      <main className="container-sheet py-10">
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-3xl mb-3">ðŸ”’</p>
          <h1 className="text-lg font-bold">Track Your Progress</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link
              to="/auth"
              className="font-semibold underline underline-offset-2"
              style={{ color: "oklch(0.50 0.22 290)" }}
            >
              Sign in
            </Link>{" "}
            to track and review your progress.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-sheet py-8 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>

      {/* â”€â”€ Overall stats â”€â”€ */}
      <div
        className="mt-5 relative overflow-hidden rounded-2xl border border-border p-6"
        style={{
          background: "linear-gradient(135deg, oklch(0.93 0.06 290 / 0.4) 0%, oklch(0.92 0.06 225 / 0.3) 50%, oklch(0.92 0.06 155 / 0.25) 100%)",
        }}
      >
        {/* Decorative blob */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.50 0.22 290)" }}
        />

        <div className="relative">
          <p className="text-sm font-medium text-muted-foreground">Overall completion</p>
          <div className="mt-1 flex items-end gap-3">
            <span
              className="text-5xl font-black tabular-nums"
              style={{
                background: "linear-gradient(90deg, oklch(0.50 0.22 290), oklch(0.52 0.18 225))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {pct}%
            </span>
          </div>

          <div className="mt-4">
            <ProgressBar value={completed} total={total} />
          </div>

          {/* Stat cards row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-3.5 w-3.5" style={{ color: "oklch(0.48 0.17 155)" }} />
                <span className="text-xs text-muted-foreground">Solved</span>
              </div>
              <p className="text-xl font-black tabular-nums" style={{ color: "oklch(0.40 0.17 155)" }}>
                {completed}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3.5 w-3.5" style={{ color: "oklch(0.60 0.17 65)" }} />
                <span className="text-xs text-muted-foreground">Remaining</span>
              </div>
              <p className="text-xl font-black tabular-nums" style={{ color: "oklch(0.46 0.17 65)" }}>
                {remaining}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-3.5 w-3.5" style={{ color: "oklch(0.50 0.22 290)" }} />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl font-black tabular-nums" style={{ color: "oklch(0.42 0.18 290)" }}>
                {total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Topic breakdown â”€â”€ */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4" style={{ color: "oklch(0.50 0.22 290)" }} />
          <h2 className="text-sm font-bold text-foreground">By topic</h2>
        </div>

        <div className="grid gap-3">
          {(topics.data ?? []).map((topic, i) => {
            const topicQuestions = all.filter((q) => q.topic_id === topic.id);
            const topicDone = topicQuestions.filter((q) => done.has(q.id)).length;
            const topicPct = topicQuestions.length > 0
              ? Math.round((topicDone / topicQuestions.length) * 100)
              : 0;
            const allDone = topicDone === topicQuestions.length && topicQuestions.length > 0;
            const color = TOPIC_COLORS[i % TOPIC_COLORS.length];

            return (
              <div
                key={topic.id}
                className="rounded-xl border p-4 transition-all duration-200"
                style={{
                  borderColor: color.border,
                  background: color.bg + "50",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: color.dot }}
                    />
                    <span className="truncate text-sm font-semibold">{topic.name}</span>
                    {allDone && <span className="text-sm">âœ…</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
                      style={{
                        background: allDone ? color.dot : color.bg,
                        color: allDone ? "white" : color.text,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      {topicDone}/{topicQuestions.length}
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: color.text }}
                    >
                      {topicPct}%
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={topicDone}
                  total={topicQuestions.length}
                  color={`linear-gradient(90deg, ${color.dot}, ${TOPIC_COLORS[(i + 2) % TOPIC_COLORS.length].dot})`}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}