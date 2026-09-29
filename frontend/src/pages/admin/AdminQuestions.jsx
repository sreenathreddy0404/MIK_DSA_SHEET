import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  deleteQuestion,
  extractYouTubeId,
  questionsQuery,
  topicsQuery,
  updateQuestion,
} from "@/lib/sheet.js";
import { Markdown } from "@/components/Markdown.jsx";

const input =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40";
const btn =
  "rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground disabled:opacity-40";

const empty = {
  topic_id: "",
  name: "",
  item_type: "problem",
  content: "",
  problem_url: "",
  github_url: "",
  resource_url: "",
  youtube_url: "",
};

export default function AdminQuestions() {
  const qc = useQueryClient();
  const topics = useQuery(topicsQuery(true));
  const questions = useQuery(questionsQuery(true));
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);

  const topicList = topics.data ?? [];
  const all = questions.data ?? [];
  const list = filter ? all.filter((q) => q.topic_id === filter) : all;
  const refresh = () => qc.invalidateQueries({ queryKey: ["questions"] });
  const topicName = (id) => topicList.find((t) => t.id === id)?.name ?? "—";
  const isTheory = form.item_type === "theory";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm({ ...empty, topic_id: form.topic_id, item_type: form.item_type });
    setEditingId(null);
    setPreview(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.topic_id) return setError("Title and topic are required.");

    let payload;
    if (isTheory) {
      if (!form.content.trim()) return setError("Write the theory content before saving.");
      payload = {
        topic_id: form.topic_id,
        name: form.name.trim(),
        item_type: "theory",
        content: form.content,
        problem_url: null,
        github_url: null,
        resource_url: null,
        youtube_url: null,
        youtube_video_id: null,
      };
    } else {
      const yt = form.youtube_url.trim() || null;
      const videoId = extractYouTubeId(yt);
      if (yt && !videoId) return setError("That YouTube link isn't recognised.");
      payload = {
        topic_id: form.topic_id,
        name: form.name.trim(),
        item_type: "problem",
        content: null,
        problem_url: form.problem_url.trim() || null,
        github_url: form.github_url.trim() || null,
        resource_url: form.resource_url.trim() || null,
        youtube_url: yt,
        youtube_video_id: videoId,
      };
    }

    const inTopic = all.filter((q) => q.topic_id === form.topic_id);
    try {
      if (editingId) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion({
          ...payload,
          position: Math.max(0, ...inTopic.map((q) => q.position)) + 1,
        });
      }
    } catch (err) {
      setError(err.message);
      return;
    }
    reset();
    refresh();
  };

  const edit = (q) => {
    setEditingId(q.id);
    setPreview(false);
    setForm({
      topic_id: q.topic_id,
      name: q.name,
      item_type: q.item_type,
      content: q.content ?? "",
      problem_url: q.problem_url ?? "",
      github_url: q.github_url ?? "",
      resource_url: q.resource_url ?? "",
      youtube_url: q.youtube_url ?? "",
    });
    window.scrollTo({ top: 0 });
  };

  const move = async (q, dir) => {
    const siblings = all.filter((x) => x.topic_id === q.topic_id);
    const i = siblings.findIndex((x) => x.id === q.id);
    const other = siblings[i + dir];
    if (!other) return;
    await updateQuestion(q.id, { position: other.position });
    await updateQuestion(other.id, { position: q.position });
    refresh();
  };

  const toggle = async (q) => {
    await updateQuestion(q.id, { active: !q.active });
    refresh();
  };

  const remove = async (q) => {
    if (!confirm(`Delete "${q.name}"?`)) return;
    try {
      await deleteQuestion(q.id);
    } catch (err) {
      setError(err.message);
    }
    refresh();
  };

  return (
    <div className="mt-8">
      <h1 className="text-lg font-semibold tracking-tight">Items</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Theory articles and problems share one ordered list inside each topic.
      </p>

      <div className="mt-5 flex items-center gap-1 text-sm">
        <span className="mr-2 text-muted-foreground">Item type</span>
        {["problem", "theory"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((f) => ({ ...f, item_type: t }))}
            className={`rounded-md px-2.5 py-1.5 capitalize transition-colors ${
              form.item_type === t
                ? "bg-hover text-foreground"
                : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="mt-3 grid gap-2 sm:grid-cols-2">
        <select className={input} value={form.topic_id} onChange={set("topic_id")}>
          <option value="">Select topic</option>
          {topicList.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          className={input}
          placeholder={isTheory ? "Theory title" : "Question name"}
          value={form.name}
          onChange={set("name")}
        />

        {isTheory ? (
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={`rounded-md px-2 py-1 ${!preview ? "bg-hover text-foreground" : "text-muted-foreground hover:bg-hover"}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className={`rounded-md px-2 py-1 ${preview ? "bg-hover text-foreground" : "text-muted-foreground hover:bg-hover"}`}
              >
                Preview
              </button>
              <span className="ml-2 text-muted-foreground">
                Markdown: # headings, lists, tables, ``` code blocks
              </span>
            </div>
            {preview ? (
              <div className="min-h-64 rounded-md border border-border px-4 py-2">
                {form.content.trim() ? (
                  <Markdown>{form.content}</Markdown>
                ) : (
                  <p className="py-6 text-sm text-muted-foreground">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <textarea
                className={`${input} min-h-64 font-mono text-[13px] leading-6`}
                placeholder={
                  "## What is an Array\n\nAn array stores elements in contiguous memory...\n\n```js\nconst a = [1, 2, 3];\n```"
                }
                value={form.content}
                onChange={set("content")}
              />
            )}
          </div>
        ) : (
          <>
            <input
              className={input}
              placeholder="Problem link"
              value={form.problem_url}
              onChange={set("problem_url")}
            />
            <input
              className={input}
              placeholder="GitHub code link"
              value={form.github_url}
              onChange={set("github_url")}
            />
            <input
              className={input}
              placeholder="Article / resource link"
              value={form.resource_url}
              onChange={set("resource_url")}
            />
            <input
              className={input}
              placeholder="YouTube link"
              value={form.youtube_url}
              onChange={set("youtube_url")}
            />
          </>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className={btn}>
            {editingId ? "Save changes" : isTheory ? "Add theory" : "Add question"}
          </button>
          {editingId && (
            <button type="button" className={btn} onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{list.length} items</span>
        <select
          className={`${input} max-w-56`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All topics</option>
          {topicList.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 border-t border-border">
        {list.map((q) => (
          <div
            key={q.id}
            className="flex flex-wrap items-center gap-2 border-b border-border py-2.5 text-sm"
          >
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              {q.item_type === "theory" ? "Theory" : "Problem"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {q.name}
                {!q.active && <span className="ml-2 text-xs text-muted-foreground">hidden</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground">{topicName(q.topic_id)}</div>
            </div>
            <button className={btn} onClick={() => move(q, -1)} aria-label="Move up">
              ↑
            </button>
            <button className={btn} onClick={() => move(q, 1)} aria-label="Move down">
              ↓
            </button>
            <button className={btn} onClick={() => toggle(q)}>
              {q.active ? "Hide" : "Show"}
            </button>
            <button className={btn} onClick={() => edit(q)}>
              Edit
            </button>
            <button className={btn} onClick={() => remove(q)}>
              Delete
            </button>
          </div>
        ))}
        {list.length === 0 && !questions.isLoading && (
          <p className="py-3 text-sm text-muted-foreground">No items yet.</p>
        )}
      </div>
    </div>
  );
}
