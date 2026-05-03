import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, FileText, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TopNav = () => {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-gradient">ResumeAI</span>
        </Link>
        <nav className="flex items-center gap-1">
          {user && (
            <>
              <Button asChild variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm">
                <Link to="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1.5" />Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/builder/new"><FileText className="w-4 h-4 mr-1.5" />New</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-1"><Link to="/auth">Sign in</Link></Button>
          )}
        </nav>
      </div>
    </header>
  );
};
