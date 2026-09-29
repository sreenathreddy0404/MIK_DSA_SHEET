import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth.jsx";
import { progressQuery, questionsQuery, setProgress, topicsQuery } from "@/lib/sheet.js";
import { ProgressBar } from "@/components/ProgressBar.jsx";
import { QuestionRow } from "@/components/QuestionRow.jsx";

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

  const loading = topics.isLoading || questions.isLoading;
  const failed = topics.isError || questions.isError;

  const toggleTopic = (id) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  return (
    <main className="container-sheet py-8 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight">DSA Sheet</h1>
        <p className="text-sm tabular-nums text-muted-foreground">
          {totalCompleted} / {totalQuestions} completed
        </p>
      </div>

      <div className="mt-4">
        <ProgressBar value={totalCompleted} total={totalQuestions} />
      </div>

      {!userId && (
        <p className="mt-3 text-xs text-muted-foreground">
          <Link to="/auth" className="underline underline-offset-2 hover:text-foreground">
            Sign in
          </Link>{" "}
          to save your progress across devices.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems or topics..."
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
        />
        <div className="flex shrink-0 items-center gap-1 text-xs">
          {["all", "completed", "pending"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-md px-2.5 py-1.5 capitalize transition-colors ${
                filter === key
                  ? "bg-hover text-foreground"
                  : "text-muted-foreground hover:bg-hover hover:text-foreground"
              }`}
            >
              {key === "pending" ? "Not completed" : key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading && <p className="py-10 text-sm text-muted-foreground">Loading sheet...</p>}

        {failed && (
          <p className="py-10 text-sm text-muted-foreground">
            Could not load the sheet. Check your connection and refresh.
          </p>
        )}

        {!loading && !failed && shown.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-foreground">No questions found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or filter.
            </p>
          </div>
        )}

        <div className="divide-y divide-border border-y border-border">
          {shown.map(({ topic, visible, total, completed }, i) => {
            const open = expanded.includes(topic.id) || searching;
            return (
              <section key={topic.id}>
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-hover sm:px-4"
                >
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
                      open ? "rotate-90" : ""
                    }`}
                  />
                  <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{topic.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {completed} / {total}
                  </span>
                </button>

                {open && (
                  <div className="pb-2">
                    {visible.length === 0 ? (
                      <p className="px-12 pb-3 text-sm text-muted-foreground">
                        No questions here yet.
                      </p>
                    ) : (
                      <div className="ml-6 border-l border-border sm:ml-10">
                        {visible.map((question, qi) => (
                          <QuestionRow
                            key={question.id}
                            question={question}
                            index={qi + 1}
                            completed={done.has(question.id)}
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
