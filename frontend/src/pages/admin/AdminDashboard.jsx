import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers, questionsQuery, topicsQuery } from "@/lib/sheet.js";

export default function AdminDashboard() {
  const topics = useQuery(topicsQuery(true));
  const questions = useQuery(questionsQuery(true));
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const stats = [
    { label: "Topics", value: topics.data?.length ?? 0 },
    { label: "Questions", value: questions.data?.length ?? 0 },
    { label: "Users", value: users.data?.length ?? 0 },
  ];

  return (
    <div className="mt-8">
      <h1 className="text-lg font-semibold tracking-tight">Admin Dashboard</h1>

      <div className="mt-5 border-y border-border">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-b-0"
          >
            <span className="text-muted-foreground">{stat.label}</span>
            <span className="tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-medium text-muted-foreground">Topics</h2>
      <div className="mt-2 border-t border-border">
        {(topics.data ?? []).map((topic) => {
          const count = (questions.data ?? []).filter((q) => q.topic_id === topic.id).length;
          return (
            <div
              key={topic.id}
              className="flex items-center justify-between border-b border-border py-2.5 text-sm"
            >
              <span className="truncate">
                {topic.name}
                {!topic.active && (
                  <span className="ml-2 text-xs text-muted-foreground">inactive</span>
                )}
              </span>
              <span className="tabular-nums text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 text-sm font-medium text-muted-foreground">Users</h2>
      <div className="mt-2 border-t border-border">
        {(users.data ?? []).map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border-b border-border py-2.5 text-sm"
          >
            <span className="truncate">{user.username || user.name || "—"}</span>
            <span className="truncate text-muted-foreground">{user.email}</span>
          </div>
        ))}
        {users.data?.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No users yet.</p>
        )}
      </div>
    </div>
  );
}
