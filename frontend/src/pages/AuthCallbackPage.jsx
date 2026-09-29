import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "@/lib/api.js";
import { useAuth } from "@/lib/auth.jsx";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      refreshUser().then(() => navigate("/", { replace: true }));
    } else {
      navigate("/auth?error=google_failed", { replace: true });
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <main className="container-sheet py-10 text-sm text-muted-foreground">Signing you in...</main>
  );
}
