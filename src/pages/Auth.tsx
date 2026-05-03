import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TopNav } from "@/components/TopNav";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(100),
  fullName: z.string().trim().max(100).optional(),
});

export default function Auth() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handle = async (mode: "signin" | "signup") => {
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
        nav("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        nav("/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <TopNav />
      <div className="container max-w-md py-16">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl gradient-primary items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to ResumeAI</h1>
          <p className="text-sm text-muted-foreground">Build a stunning resume in minutes</p>
        </div>
        <Card className="p-6 shadow-card">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-3 mt-4">
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
              <div><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>
              <Button className="w-full" onClick={() => handle("signin")} disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3 mt-4">
              <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
              <div><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>
              <Button className="w-full" onClick={() => handle("signup")} disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
