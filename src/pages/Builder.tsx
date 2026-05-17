import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData, emptyResume, SECTION_LABELS, SectionKey, TemplateKey, TEMPLATE_LABELS, normalizeTemplate } from "@/types/resume";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TagInput } from "@/components/resume/TagInput";
import { SortableList, SortableSections } from "@/components/resume/Sortable";
import { callAI } from "@/lib/ai";
import { toast } from "sonner";
import {
  Save, Download, Printer, Plus, Trash2, Sparkles, Loader2, Wand2, FileText,
  User as UserIcon, Briefcase, GraduationCap, Code, FolderGit2, Award, Languages as LangIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const uid = () => Math.random().toString(36).slice(2, 10);

const SECTION_ICONS: Record<SectionKey, any> = {
  summary: Sparkles, experience: Briefcase, education: GraduationCap,
  skills: Code, projects: FolderGit2, certifications: Award, languages: LangIcon,
};

function calcProgress(d: ResumeData) {
  let total = 8, filled = 0;
  if (d.personal.fullName) filled++;
  if (d.personal.email) filled++;
  if (d.summary) filled++;
  if (d.experience.length) filled++;
  if (d.education.length) filled++;
  if (d.skills.length) filled++;
  if (d.projects.length) filled++;
  if (d.personal.phone) filled++;
  return Math.round((filled / total) * 100);
}

function BuilderInner() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [title, setTitle] = useState("Untitled Resume");
  const [template, setTemplate] = useState<TemplateKey>("executive");
  const [resumeId, setResumeId] = useState<string | null>(id && id !== "new" ? id : null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [atsResult, setAtsResult] = useState("");
  const [atsJob, setAtsJob] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!resumeId) { setLoading(false); return; }
      const { data: row, error } = await supabase.from("resumes").select("*").eq("id", resumeId).maybeSingle();
      if (error) toast.error(error.message);
      if (row) {
        setData({ ...emptyResume, ...(row.data as any) });
        setTitle(row.title);
        setTemplate(normalizeTemplate(row.template as string));
      }
      setLoading(false);
    })();
  }, [resumeId]);

  const progress = useMemo(() => calcProgress(data), [data]);

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((d) => ({ ...d, [key]: value }));
  const updatePersonal = (k: keyof ResumeData["personal"], v: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not signed in"); setSaving(false); return; }
    const payload = { user_id: user.id, title, template, data: data as any };
    if (resumeId) {
      const { error } = await supabase.from("resumes").update(payload).eq("id", resumeId);
      if (error) toast.error(error.message); else toast.success("Saved");
    } else {
      const { data: row, error } = await supabase.from("resumes").insert(payload).select().single();
      if (error) toast.error(error.message);
      else { setResumeId(row.id); window.history.replaceState(null, "", `/builder/${row.id}`); toast.success("Created"); }
    }
    setSaving(false);
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    toast.info("Generating PDF…");
    const original = previewRef.current.querySelector(".resume-page") as HTMLElement;
    if (!original) return;

    // Clone off-screen at full A4 width with no parent transform/scale to avoid
    // html2canvas layout glitches (overlapping text from scaled flex/gap).
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position:fixed;left:-10000px;top:0;background:#fff;width:210mm;z-index:-1;";
    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.width = "210mm";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      // Wait for fonts/layout to settle
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pdfW, imgH);
      heightLeft -= pdfH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfW, imgH);
        heightLeft -= pdfH;
      }
      pdf.save(`${title || "resume"}.pdf`);
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const aiSummary = async () => {
    setAiLoading("summary");
    const text = await callAI("summary", {
      name: data.personal.fullName, title: data.personal.title,
      years: data.experience.length, skills: data.skills.join(", "),
    });
    if (text) update("summary", text.trim());
    setAiLoading(null);
  };

  const aiBullets = async (idx: number) => {
    const e = data.experience[idx];
    setAiLoading(`bullets-${idx}`);
    const text = await callAI("bullets", { role: e.role, company: e.company, notes: e.bullets.join("\n") || e.role });
    if (text) {
      const lines = text.split("\n").map((l) => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);
      const next = [...data.experience];
      next[idx] = { ...e, bullets: lines };
      update("experience", next);
    }
    setAiLoading(null);
  };

  const aiSkills = async () => {
    if (!data.personal.title) return toast.error("Set a job title first");
    setAiLoading("skills");
    const text = await callAI("skills", { title: data.personal.title });
    if (text) {
      const list = text.split(",").map((s) => s.trim()).filter(Boolean);
      update("skills", Array.from(new Set([...data.skills, ...list])));
    }
    setAiLoading(null);
  };

  const aiATS = async () => {
    setAiLoading("ats");
    const summary = `Title: ${data.personal.title}\nSummary: ${data.summary}\nSkills: ${data.skills.join(", ")}\nExperience: ${data.experience.map((e) => `${e.role} at ${e.company}: ${e.bullets.join(" | ")}`).join("\n")}`;
    const text = await callAI("ats", { resume: summary, jobTitle: atsJob });
    if (text) { setAtsResult(text); setAtsOpen(true); }
    setAiLoading(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <TopNav />
      <div className="border-b bg-background">
        <div className="container py-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold border-0 shadow-none focus-visible:ring-0 h-9 px-1 max-w-xs" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-[180px]">
              <Progress value={progress} className="w-32" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
            <Select value={template} onValueChange={(v) => setTemplate(v as TemplateKey)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TEMPLATE_LABELS) as TemplateKey[]).map((k) => (
                  <SelectItem key={k} value={k}>{TEMPLATE_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1.5" />Print</Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}><Download className="w-4 h-4 mr-1.5" />PDF</Button>
            <Button size="sm" onClick={save} disabled={saving} className="gradient-primary text-white border-0">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />} Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 grid lg:grid-cols-2 gap-6">
        {/* LEFT: form */}
        <div>
          <Tabs defaultValue="personal">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full h-auto">
              <TabsTrigger value="personal"><UserIcon className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="summary"><Sparkles className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="experience"><Briefcase className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="education"><GraduationCap className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="skills"><Code className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="projects"><FolderGit2 className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="more"><Award className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="relative group cursor-pointer shrink-0">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-border bg-muted overflow-hidden flex items-center justify-center">
                      {data.personal.photo ? (
                        <img src={data.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      {data.personal.photo ? "Change Photo" : "Upload Photo"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
                        const reader = new FileReader();
                        reader.onload = () => updatePersonal("photo", reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <div className="flex-1">
                    <Label className="text-sm">Profile photo</Label>
                    <p className="text-xs text-muted-foreground mb-2">Optional. Square images work best (max 2MB).</p>
                    {data.personal.photo && (
                      <Button size="sm" variant="outline" onClick={() => updatePersonal("photo", "")}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Full name</Label><Input value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} /></div>
                  <div><Label>Job title</Label><Input value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} placeholder="Senior Software Engineer" /></div>
                  <div><Label>Email</Label><Input value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} type="email" /></div>
                  <div><Label>Phone</Label><Input value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} /></div>
                  <div className="col-span-2"><Label>Address</Label><Input value={data.personal.address} onChange={(e) => updatePersonal("address", e.target.value)} /></div>
                  <div><Label>LinkedIn</Label><Input value={data.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} /></div>
                  <div><Label>GitHub</Label><Input value={data.personal.github} onChange={(e) => updatePersonal("github", e.target.value)} /></div>
                  <div className="col-span-2"><Label>Website</Label><Input value={data.personal.website} onChange={(e) => updatePersonal("website", e.target.value)} /></div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Professional summary</Label>
                  <Button size="sm" variant="secondary" onClick={aiSummary} disabled={aiLoading === "summary"}>
                    {aiLoading === "summary" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />} Generate with AI
                  </Button>
                </div>
                <Textarea rows={6} value={data.summary} onChange={(e) => update("summary", e.target.value)} placeholder="A brief professional summary…" />
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Work experience</Label>
                  <Button size="sm" variant="outline" onClick={() => update("experience", [...data.experience, { id: uid(), company: "", role: "", location: "", start: "", end: "", bullets: [""] }])}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Add
                  </Button>
                </div>
                <SortableList
                  items={data.experience}
                  onReorder={(next) => update("experience", next)}
                  renderItem={(e, idx) => (
                    <Card className="p-3 space-y-2 bg-muted/40">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Role" value={e.role} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, role: ev.target.value }; update("experience", n); }} />
                        <Input placeholder="Company" value={e.company} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, company: ev.target.value }; update("experience", n); }} />
                        <Input placeholder="Start (e.g. Jan 2022)" value={e.start} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, start: ev.target.value }; update("experience", n); }} />
                        <Input placeholder="End (or Present)" value={e.end} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, end: ev.target.value }; update("experience", n); }} />
                        <Input className="col-span-2" placeholder="Location" value={e.location} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, location: ev.target.value }; update("experience", n); }} />
                      </div>
                      <Textarea rows={3} placeholder="One bullet per line…" value={e.bullets.join("\n")} onChange={(ev) => { const n = [...data.experience]; n[idx] = { ...e, bullets: ev.target.value.split("\n") }; update("experience", n); }} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => aiBullets(idx)} disabled={aiLoading === `bullets-${idx}`}>
                          {aiLoading === `bullets-${idx}` ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />} AI bullets
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => update("experience", data.experience.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Education</Label>
                  <Button size="sm" variant="outline" onClick={() => update("education", [...data.education, { id: uid(), school: "", degree: "", field: "", start: "", end: "", details: "" }])}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Add
                  </Button>
                </div>
                <SortableList
                  items={data.education}
                  onReorder={(next) => update("education", next)}
                  renderItem={(e, idx) => (
                    <Card className="p-3 space-y-2 bg-muted/40">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="School" value={e.school} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, school: ev.target.value }; update("education", n); }} />
                        <Input placeholder="Degree" value={e.degree} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, degree: ev.target.value }; update("education", n); }} />
                        <Input placeholder="Field" value={e.field} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, field: ev.target.value }; update("education", n); }} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Start" value={e.start} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, start: ev.target.value }; update("education", n); }} />
                          <Input placeholder="End" value={e.end} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, end: ev.target.value }; update("education", n); }} />
                        </div>
                      </div>
                      <Textarea rows={2} placeholder="Notes / GPA / honors" value={e.details} onChange={(ev) => { const n = [...data.education]; n[idx] = { ...e, details: ev.target.value }; update("education", n); }} />
                      <Button size="sm" variant="ghost" onClick={() => update("education", data.education.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </Card>
                  )}
                />
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={aiSkills} disabled={aiLoading === "skills"}>
                      {aiLoading === "skills" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />} Suggest
                    </Button>
                    <Button size="sm" variant="outline" onClick={aiATS} disabled={aiLoading === "ats"}>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />ATS scan
                    </Button>
                  </div>
                </div>
                <TagInput value={data.skills} onChange={(v) => update("skills", v)} placeholder="React, TypeScript, Leadership…" />
                <div>
                  <Label className="text-xs text-muted-foreground">Target job title (for ATS scan)</Label>
                  <Input value={atsJob} onChange={(e) => setAtsJob(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Projects</Label>
                  <Button size="sm" variant="outline" onClick={() => update("projects", [...data.projects, { id: uid(), title: "", description: "", link: "" }])}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Add
                  </Button>
                </div>
                <SortableList
                  items={data.projects}
                  onReorder={(next) => update("projects", next)}
                  renderItem={(p, idx) => (
                    <Card className="p-3 space-y-2 bg-muted/40">
                      <Input placeholder="Title" value={p.title} onChange={(ev) => { const n = [...data.projects]; n[idx] = { ...p, title: ev.target.value }; update("projects", n); }} />
                      <Input placeholder="Link" value={p.link} onChange={(ev) => { const n = [...data.projects]; n[idx] = { ...p, link: ev.target.value }; update("projects", n); }} />
                      <Textarea rows={2} placeholder="Description" value={p.description} onChange={(ev) => { const n = [...data.projects]; n[idx] = { ...p, description: ev.target.value }; update("projects", n); }} />
                      <Button size="sm" variant="ghost" onClick={() => update("projects", data.projects.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </Card>
                  )}
                />
              </Card>
            </TabsContent>

            <TabsContent value="more">
              <Card className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Certifications</Label>
                    <Button size="sm" variant="outline" onClick={() => update("certifications", [...data.certifications, { id: uid(), name: "", issuer: "", date: "" }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Add
                    </Button>
                  </div>
                  {data.certifications.map((c, idx) => (
                    <div key={c.id} className="grid grid-cols-[1fr_1fr_120px_auto] gap-2 mb-2">
                      <Input placeholder="Name" value={c.name} onChange={(ev) => { const n = [...data.certifications]; n[idx] = { ...c, name: ev.target.value }; update("certifications", n); }} />
                      <Input placeholder="Issuer" value={c.issuer} onChange={(ev) => { const n = [...data.certifications]; n[idx] = { ...c, issuer: ev.target.value }; update("certifications", n); }} />
                      <Input placeholder="Date" value={c.date} onChange={(ev) => { const n = [...data.certifications]; n[idx] = { ...c, date: ev.target.value }; update("certifications", n); }} />
                      <Button size="icon" variant="ghost" onClick={() => update("certifications", data.certifications.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Languages</Label>
                    <Button size="sm" variant="outline" onClick={() => update("languages", [...data.languages, { id: uid(), name: "", level: "" }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Add
                    </Button>
                  </div>
                  {data.languages.map((l, idx) => (
                    <div key={l.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                      <Input placeholder="Language" value={l.name} onChange={(ev) => { const n = [...data.languages]; n[idx] = { ...l, name: ev.target.value }; update("languages", n); }} />
                      <Input placeholder="Level (Native, Fluent…)" value={l.level} onChange={(ev) => { const n = [...data.languages]; n[idx] = { ...l, level: ev.target.value }; update("languages", n); }} />
                      <Button size="icon" variant="ghost" onClick={() => update("languages", data.languages.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <div>
                  <Label className="mb-2 block">Reorder sections</Label>
                  <SortableSections
                    ids={data.sectionOrder}
                    onReorder={(next) => update("sectionOrder", next as SectionKey[])}
                    renderItem={(id) => {
                      const Icon = SECTION_ICONS[id as SectionKey];
                      return (
                        <div className="flex items-center gap-2 p-2 bg-muted/40 rounded">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{SECTION_LABELS[id as SectionKey]}</span>
                        </div>
                      );
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: preview */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="rounded-lg border shadow-card bg-muted/40 p-4 max-h-[calc(100vh-7rem)] overflow-auto">
            <div className="printable" ref={previewRef}>
              <div style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "210mm" }}>
                <ResumePreview data={data} template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={atsOpen} onOpenChange={setAtsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>ATS optimization tips</DialogTitle></DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{atsResult}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Builder() {
  return <ProtectedRoute><BuilderInner /></ProtectedRoute>;
}
