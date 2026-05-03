import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Row {
  id: string;
  title: string;
  template: string;
  updated_at: string;
}

function DashboardInner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resumes")
      .select("id,title,template,updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Resume deleted");
    load();
  };

  return (
    <div className="min-h-screen gradient-soft">
      <TopNav />
      <main className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="text-sm text-muted-foreground">Create, edit and download your resumes</p>
          </div>
          <Button onClick={() => nav("/builder/new")} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-1.5" /> New resume
          </Button>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered resume.</p>
            <Button onClick={() => nav("/builder/new")} className="gradient-primary text-white border-0">
              <Plus className="w-4 h-4 mr-1.5" /> Create resume
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => (
              <Card key={r.id} className="p-5 shadow-card hover:shadow-elegant transition-shadow group">
                <div className="aspect-[3/4] rounded-md gradient-soft border mb-3 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold truncate">{r.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {r.template} · updated {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button asChild size="sm" variant="secondary" className="flex-1">
                    <Link to={`/builder/${r.id}`}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardInner /></ProtectedRoute>;
}
