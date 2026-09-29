import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth.jsx";
import { progressQuery, questionsQuery, topicsQuery } from "@/lib/sheet.js";
import { ProgressBar } from "@/components/ProgressBar.jsx";

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

  if (!loading && !userId) {
    return (
      <main className="container-sheet py-10">
        <h1 className="text-lg font-semibold tracking-tight">Progress</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link to="/auth" className="underline underline-offset-2 hover:text-foreground">
            Sign in
          </Link>{" "}
          to track and review your progress.
        </p>
      </main>
    );
  }

  return (
    <main className="container-sheet py-8 sm:py-10">
      <h1 className="text-lg font-semibold tracking-tight">Progress</h1>

      <section className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Overall</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={completed} total={total} />
        </div>
        <div className="mt-3 flex gap-6 text-sm tabular-nums text-muted-foreground">
          <span>Completed {completed}</span>
          <span>Remaining {total - completed}</span>
          <span>Total {total}</span>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">By topic</h2>
        <div className="mt-3 border-t border-border">
          {(topics.data ?? []).map((topic) => {
            const topicQuestions = all.filter((q) => q.topic_id === topic.id);
            const topicDone = topicQuestions.filter((q) => done.has(q.id)).length;
            return (
              <div key={topic.id} className="border-b border-border py-3.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{topic.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {topicDone} / {topicQuestions.length}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={topicDone} total={topicQuestions.length} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
