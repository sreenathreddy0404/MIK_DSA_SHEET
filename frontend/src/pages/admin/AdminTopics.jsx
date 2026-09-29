import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createTopic, deleteTopic, topicsQuery, updateTopic } from "@/lib/sheet.js";

const input =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40";
const btn =
  "rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground disabled:opacity-40";

export default function AdminTopics() {
  const qc = useQueryClient();
  const topics = useQuery(topicsQuery(true));
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["topics"] });
  const list = topics.data ?? [];

  const reset = () => {
    setEditing(null);
    setName("");
    setDescription("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    const payload = { name: name.trim(), description: description.trim() || null };
    try {
      if (editing) {
        await updateTopic(editing.id, payload);
      } else {
        await createTopic({ ...payload, position: (list.at(-1)?.position ?? 0) + 1 });
      }
    } catch (err) {
      setError(err.message);
      return;
    }
    reset();
    refresh();
  };

  const move = async (i, dir) => {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    await updateTopic(a.id, { position: b.position });
    await updateTopic(b.id, { position: a.position });
    refresh();
  };

  const toggle = async (t) => {
    await updateTopic(t.id, { active: !t.active });
    refresh();
  };

  const remove = async (t) => {
    if (!confirm(`Delete "${t.name}" and all its questions?`)) return;
    try {
      await deleteTopic(t.id);
    } catch (err) {
      setError(err.message);
    }
    refresh();
    qc.invalidateQueries({ queryKey: ["questions"] });
  };

  return (
    <div className="mt-8">
      <h1 className="text-lg font-semibold tracking-tight">Topics</h1>

      <form onSubmit={save} className="mt-5 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <input
          className={input}
          placeholder="Topic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={input}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className={btn}>
            {editing ? "Save" : "Add topic"}
          </button>
          {editing && (
            <button type="button" className={btn} onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-6 border-t border-border">
        {list.map((t, i) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center gap-2 border-b border-border py-2.5 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {t.name}
                {!t.active && <span className="ml-2 text-xs text-muted-foreground">hidden</span>}
              </div>
              {t.description && (
                <div className="truncate text-xs text-muted-foreground">{t.description}</div>
              )}
            </div>
            <button
              className={btn}
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              className={btn}
              disabled={i === list.length - 1}
              onClick={() => move(i, 1)}
              aria-label="Move down"
            >
              ↓
            </button>
            <button className={btn} onClick={() => toggle(t)}>
              {t.active ? "Hide" : "Show"}
            </button>
            <button
              className={btn}
              onClick={() => {
                setEditing(t);
                setName(t.name);
                setDescription(t.description ?? "");
              }}
            >
              Edit
            </button>
            <button className={btn} onClick={() => remove(t)}>
              Delete
            </button>
          </div>
        ))}
        {list.length === 0 && !topics.isLoading && (
          <p className="py-3 text-sm text-muted-foreground">No topics yet.</p>
        )}
      </div>
    </div>
  );
}
