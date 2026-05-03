import { Link, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Wand2, FileDown, Layout, Moon, Languages } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Wand2, title: "AI-powered writing", desc: "Generate summaries, bullet points, and skills tuned for your role." },
  { icon: Layout, title: "3 modern templates", desc: "Switch between Modern, Classic and Minimal — live preview." },
  { icon: FileDown, title: "Instant PDF export", desc: "Pixel-perfect, ATS-friendly downloads in one click." },
  { icon: Sparkles, title: "ATS optimization", desc: "Get keyword suggestions tailored to job descriptions." },
  { icon: Moon, title: "Dark & light mode", desc: "Beautiful interface that adapts to your environment." },
  { icon: Languages, title: "Drag to reorder", desc: "Rearrange sections with drag and drop." },
];

export default function Landing() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen gradient-soft">
      <TopNav />
      <main>
        <section className="container py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/60 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Powered by AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Build your dream resume<br />
            <span className="text-gradient">in minutes, not hours</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Professional templates, AI-generated content, and instant PDF export.
            Everything you need to land your next role.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={() => nav(user ? "/builder/new" : "/auth")} className="gradient-primary text-white shadow-elegant border-0">
              <Wand2 className="w-4 h-4 mr-2" />
              Start building free
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={user ? "/dashboard" : "/auth"}>{user ? "My resumes" : "Sign in"}</Link>
            </Button>
          </div>
        </section>

        <section className="container pb-20">
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="p-6 shadow-card hover:shadow-elegant transition-shadow">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
