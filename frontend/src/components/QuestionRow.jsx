import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ExternalLink, Github, BookOpen, Play, X } from "lucide-react";
import { extractYouTubeId } from "@/lib/sheet.js";
import { YouTubePlayer } from "@/components/YouTubePlayer.jsx";

export function QuestionRow({ question, index, completed, onToggle, accentColor }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoId = question.youtube_video_id ?? extractYouTubeId(question.youtube_url);

  const dot = accentColor?.dot ?? "oklch(0.50 0.22 290)";
  const bg = accentColor?.bg ?? "oklch(0.93 0.06 290)";
  const border = accentColor?.border ?? "oklch(0.80 0.12 290)";

  return (
    <div className="border-t border-border/60 first:border-t-0 transition-colors">
      <div
        className="flex items-center gap-3 px-4 py-2.5 transition-all duration-150 hover:bg-hover sm:px-5"
        style={completed ? { background: bg + "28" } : {}}
      >
        {/* Completion toggle */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={completed ? "Mark as not completed" : "Mark as completed"}
          aria-pressed={completed}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110"
          style={
            completed
              ? { background: dot, borderColor: dot, color: "white" }
              : { borderColor: "var(--color-border)", color: "transparent", background: "transparent" }
          }
          onMouseEnter={(e) => {
            if (!completed) e.currentTarget.style.borderColor = dot;
          }}
          onMouseLeave={(e) => {
            if (!completed) e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </button>

        {/* Index number */}
        <span
          className="w-6 shrink-0 text-xs font-mono tabular-nums font-semibold"
          style={{ color: dot + "cc" }}
        >
          {String(index).padStart(2, "0")}
        </span>

        {/* Question name */}
        <Link
          to={`/question/${question.id}`}
          className={`min-w-0 flex-1 truncate text-sm transition-colors hover:underline underline-offset-2 ${
            completed ? "text-muted-foreground line-through decoration-1" : "text-foreground font-medium"
          }`}
          style={completed ? { textDecorationColor: dot + "60" } : {}}
        >
          {question.name}
        </Link>

        {/* Action links */}
        <div className="flex shrink-0 items-center gap-1">
          {question.item_type === "theory" ? (
            <Link
              to={`/question/${question.id}`}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
              style={{
                background: "oklch(0.92 0.06 225)",
                color: "oklch(0.42 0.18 225)",
                border: "1px solid oklch(0.78 0.12 225)",
              }}
            >
              <BookOpen className="h-2.5 w-2.5" />
              Read
            </Link>
          ) : (
            <>
              {question.problem_url && (
                <a
                  href={question.problem_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
                  style={{
                    background: "oklch(0.93 0.06 290)",
                    color: "oklch(0.42 0.18 290)",
                    border: "1px solid oklch(0.80 0.12 290)",
                  }}
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Solve
                </a>
              )}
              {question.github_url && (
                <a
                  href={question.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
                  style={{
                    background: "oklch(0.93 0.06 330)",
                    color: "oklch(0.44 0.18 330)",
                    border: "1px solid oklch(0.79 0.12 330)",
                  }}
                >
                  <Github className="h-2.5 w-2.5" />
                  Code
                </a>
              )}
              {question.resource_url && (
                <a
                  href={question.resource_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
                  style={{
                    background: "oklch(0.92 0.06 225)",
                    color: "oklch(0.42 0.18 225)",
                    border: "1px solid oklch(0.78 0.12 225)",
                  }}
                >
                  <BookOpen className="h-2.5 w-2.5" />
                  Read
                </a>
              )}
              {videoId && (
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
                  style={
                    showVideo
                      ? {
                          background: "oklch(0.56 0.20 25)",
                          color: "white",
                          border: "1px solid oklch(0.56 0.20 25)",
                        }
                      : {
                          background: "oklch(0.94 0.06 25)",
                          color: "oklch(0.44 0.18 25)",
                          border: "1px solid oklch(0.80 0.12 25)",
                        }
                  }
                >
                  {showVideo ? (
                    <><X className="h-2.5 w-2.5" />Close</>
                  ) : (
                    <><Play className="h-2.5 w-2.5" />Watch</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showVideo && videoId && (
        <div className="px-4 pb-4 sm:px-5">
          <YouTubePlayer videoId={videoId} title={question.name} />
        </div>
      )}
    </div>
  );
}

