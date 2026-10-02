import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth.jsx";
import { extractYouTubeId, fetchQuestion, progressQuery, setProgress } from "@/lib/sheet.js";
import { YouTubePlayer } from "@/components/YouTubePlayer.jsx";
import { Markdown } from "@/components/Markdown.jsx";

const actionClass =
  "inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-hover";

export default function QuestionPage() {
  const { questionId } = useParams();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => fetchQuestion(questionId),
  });

  const progress = useQuery(progressQuery(userId));
  const completed = progress.data?.has(questionId) ?? false;

  const toggle = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("not-signed-in");
      await setProgress(userId, questionId, !completed);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
    onError: (error) =>
      toast(
        error.message === "not-signed-in"
          ? "Sign in to track your progress."
          : "Could not save your progress. Try again.",
      ),
  });

  if (detail.isLoading) {
    return <main className="container-sheet py-10 text-sm text-muted-foreground">Loading...</main>;
  }

  if (detail.isError || !detail.data) {
    return (
      <main className="container-sheet py-10">
        <p className="text-sm text-foreground">This question is no longer available.</p>
        <Link
          to="/"
          className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-2"
        >
          Back to the sheet
        </Link>
      </main>
    );
  }

  const question = detail.data;
  const videoId = question.youtube_video_id ?? extractYouTubeId(question.youtube_url);

  return (
    <main className="container-sheet py-8 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {question.topics?.name ?? "sheet"}
      </Link>

      <h1 className="mt-5 text-xl font-semibold tracking-tight">{question.name}</h1>

      {question.item_type === "theory" ? (
        <article className="mt-6 border-t border-border pt-2">
          {question.content?.trim() ? (
            <Markdown>{question.content}</Markdown>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              This article has not been written yet.
            </p>
          )}
        </article>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {question.problem_url && (
              <a
                href={question.problem_url}
                target="_blank"
                rel="noreferrer"
                className={actionClass}
              >
                Problem
              </a>
            )}
            {question.github_url && (
              <a
                href={question.github_url}
                target="_blank"
                rel="noreferrer"
                className={actionClass}
              >
                GitHub Solution
              </a>
            )}
            {question.resource_url && (
              <a
                href={question.resource_url}
                target="_blank"
                rel="noreferrer"
                className={actionClass}
              >
                Resource
              </a>
            )}
          </div>

          {videoId ? (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                YouTube Explanation
              </h2>
              <YouTubePlayer videoId={videoId} title={question.name} />
            </section>
          ) : (
            <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              No video explanation has been added for this problem yet.
            </p>
          )}
        </>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => toggle.mutate()}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
            completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-hover"
          }`}
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          {completed ? "Completed" : "Mark as Completed"}
        </button>
      </div>
    </main>
  );
}
