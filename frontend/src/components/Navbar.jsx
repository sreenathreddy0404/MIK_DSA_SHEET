import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth.jsx";
import { useTheme } from "@/lib/theme.jsx";

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground";

function navClass({ isActive }) {
  return isActive ? `${navLinkClass} text-foreground` : navLinkClass;
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-sheet flex h-14 items-center justify-between gap-3">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          DSA Sheet
        </Link>

        <nav className="flex items-center gap-0.5">
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

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="ml-1 flex items-center gap-2">
              <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline">
                {user.username || user.name || email}
              </span>
              <button type="button" onClick={handleSignOut} className={navLinkClass}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className={navClass}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
