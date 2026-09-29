import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth.jsx";

const tabClass =
  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground";

function tabNavClass({ isActive }) {
  return isActive ? `${tabClass} bg-hover text-foreground` : tabClass;
}

export default function AdminLayout() {
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return <main className="container-sheet py-10 text-sm text-muted-foreground">Loading...</main>;
  }

  if (!user || !isAdmin) {
    return (
      <main className="container-sheet py-10">
        <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have access to this area.{" "}
          <Link to="/" className="underline underline-offset-2 hover:text-foreground">
            Back to the sheet
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container-sheet py-8 sm:py-10">
      <div className="flex items-center gap-1 border-b border-border pb-3">
        <NavLink to="/admin" end className={tabNavClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/topics" className={tabNavClass}>
          Topics
        </NavLink>
        <NavLink to="/admin/questions" className={tabNavClass}>
          Questions
        </NavLink>
      </div>
      <Outlet />
    </main>
  );
}
