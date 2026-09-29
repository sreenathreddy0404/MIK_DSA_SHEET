import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth.jsx";
import { ThemeProvider } from "@/lib/theme.jsx";
import { Navbar } from "@/components/Navbar.jsx";
import { Toaster } from "@/components/ui/sonner.jsx";
import SheetPage from "@/pages/SheetPage.jsx";
import AuthPage from "@/pages/AuthPage.jsx";
import AuthCallbackPage from "@/pages/AuthCallbackPage.jsx";
import ProgressPage from "@/pages/ProgressPage.jsx";
import QuestionPage from "@/pages/QuestionPage.jsx";
import AdminLayout from "@/pages/admin/AdminLayout.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminTopics from "@/pages/admin/AdminTopics.jsx";
import AdminQuestions from "@/pages/admin/AdminQuestions.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<SheetPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/question/:questionId" element={<QuestionPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="topics" element={<AdminTopics />} />
                <Route path="questions" element={<AdminQuestions />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
