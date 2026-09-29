import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, getGoogleAuthUrl, setToken } from "@/lib/api.js";
import { useAuth } from "@/lib/auth.jsx";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_failed") {
      setMessage("Google sign-in failed. Try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup" ? { email, password, username } : { email, password };
      const data = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) });
      setToken(data.token);
      await refreshUser();
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(error.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const googleEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";

  return (
    <main className="container-sheet flex min-h-[calc(100vh-3.5rem)] items-start justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your completed problems are saved to your account.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
              minLength={3}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-9 w-full rounded-md bg-primary text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {googleEnabled && (
          <button
            type="button"
            onClick={google}
            className="mt-3 h-9 w-full rounded-md border border-border text-sm transition-colors hover:bg-hover"
          >
            Continue with Google
          </button>
        )}

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
          className="mt-6 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
