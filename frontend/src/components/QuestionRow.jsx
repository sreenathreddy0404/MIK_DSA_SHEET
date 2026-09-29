import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { extractYouTubeId } from "@/lib/sheet.js";
import { YouTubePlayer } from "@/components/YouTubePlayer.jsx";

const linkClass =
  "rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-hover hover:text-foreground";

export function QuestionRow({ question, index, completed, onToggle }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoId = question.youtube_video_id ?? extractYouTubeId(question.youtube_url);

  return (
    <div className="border-t border-border first:border-t-0">
      <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-hover sm:px-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label={completed ? "Mark as not completed" : "Mark as completed"}
          aria-pressed={completed}
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
            completed
              ? "border-foreground bg-foreground text-background"
              : "border-border text-transparent hover:border-muted-foreground"
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </button>

        <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>

        <Link
          to={`/question/${question.id}`}
          className={`min-w-0 flex-1 truncate text-sm transition-colors hover:text-foreground ${
            completed ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {question.name}
        </Link>

        <div className="flex shrink-0 items-center gap-0.5">
          {question.item_type === "theory" ? (
            <Link to={`/question/${question.id}`} className={linkClass}>
              Read
            </Link>
          ) : (
            <>
              {question.problem_url && (
                <a
                  href={question.problem_url}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  Problem
                </a>
              )}
              {question.github_url && (
                <a
                  href={question.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  Code
                </a>
              )}
              {question.resource_url && (
                <a
                  href={question.resource_url}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  Read
                </a>
              )}
              {videoId && (
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className={`${linkClass} ${showVideo ? "bg-hover text-foreground" : ""}`}
                >
                  {showVideo ? "Close" : "Watch"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showVideo && videoId && (
        <div className="px-3 pb-4 sm:px-4">
          <YouTubePlayer videoId={videoId} title={question.name} />
        </div>
      )}
    </div>
  );
}
