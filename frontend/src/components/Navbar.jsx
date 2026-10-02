import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth.jsx";
import { useTheme } from "@/lib/theme.jsx";

const navLinkBase =
  "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200";

function navClass({ isActive }) {
  return isActive
    ? `${navLinkBase} bg-primary text-primary-foreground shadow-sm`
    : `${navLinkBase} text-muted-foreground hover:text-foreground hover:bg-hover`;
}

export function Navbar() {
  const { user, email, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container-sheet flex h-14 items-center justify-between gap-4">
        {/* ── Brand ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-sm font-bold select-none shadow-md transition-transform duration-200 group-hover:scale-110"
            style={{
              background: "linear-gradient(135deg, oklch(0.50 0.22 290), oklch(0.52 0.18 225))",
            }}
          >
            <Code2 className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight">
            <span
              style={{
                background: "linear-gradient(90deg, oklch(0.50 0.22 290), oklch(0.52 0.18 225))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DSA
            </span>
            <span className="text-foreground"> Sheet</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>
            Sheet
          </NavLink>
          <NavLink to="/progress" className={navClass}>
            Progress
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 rounded-lg p-1.5 text-muted-foreground transition-all duration-200 hover:bg-hover hover:text-foreground hover:scale-110"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User area */}
          {user ? (
            <div className="ml-1 flex items-center gap-2">
              <span
                className="hidden h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white sm:flex shadow-sm"
                style={{
                  background: "linear-gradient(135deg, oklch(0.50 0.22 290), oklch(0.52 0.18 225))",
                }}
              >
                {(user.username || user.name || email || "U")[0].toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              className="ml-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md hover:-translate-y-px"
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
