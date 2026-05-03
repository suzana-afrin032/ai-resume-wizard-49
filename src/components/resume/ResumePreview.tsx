import { ResumeData } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface Props {
  data: ResumeData;
  template: "modern" | "classic" | "minimal";
}

const Section = ({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) => (
  <section className="mb-5">
    <h2
      className="text-[13px] font-bold tracking-widest uppercase mb-2 pb-1 border-b"
      style={{ color: accent, borderColor: accent ? `${accent}30` : "#ddd" }}
    >
      {title}
    </h2>
    <div className="text-[13px] leading-relaxed">{children}</div>
  </section>
);

export const ResumePreview = ({ data, template }: Props) => {
  const accent = template === "modern" ? "#2563eb" : template === "classic" ? "#1f2937" : "#111";
  const order = data.sectionOrder;
  const p = data.personal;

  const contactItems = [
    p.email && { icon: Mail, text: p.email },
    p.phone && { icon: Phone, text: p.phone },
    p.address && { icon: MapPin, text: p.address },
    p.linkedin && { icon: Linkedin, text: p.linkedin },
    p.github && { icon: Github, text: p.github },
    p.website && { icon: Globe, text: p.website },
  ].filter(Boolean) as { icon: any; text: string }[];

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <Section key={key} title="Summary" accent={accent}>
            <p>{data.summary}</p>
          </Section>
        ) : null;
      case "experience":
        return data.experience.length ? (
          <Section key={key} title="Experience" accent={accent}>
            {data.experience.map((e) => (
              <div key={e.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold">{e.role || "Role"}{e.company && <> · <span className="font-normal">{e.company}</span></>}</div>
                  <div className="text-xs text-gray-500">{e.start} {e.end && `– ${e.end}`}</div>
                </div>
                {e.location && <div className="text-xs text-gray-500 italic">{e.location}</div>}
                <ul className="list-disc ml-5 mt-1">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;
      case "education":
        return data.education.length ? (
          <Section key={key} title="Education" accent={accent}>
            {data.education.map((e) => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between">
                  <div className="font-semibold">{e.degree} {e.field && `in ${e.field}`}</div>
                  <div className="text-xs text-gray-500">{e.start} {e.end && `– ${e.end}`}</div>
                </div>
                <div className="text-sm">{e.school}</div>
                {e.details && <div className="text-xs mt-1">{e.details}</div>}
              </div>
            ))}
          </Section>
        ) : null;
      case "skills":
        return data.skills.length ? (
          <Section key={key} title="Skills" accent={accent}>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded"
                  style={
                    template === "minimal"
                      ? { background: "transparent", border: "1px solid #ddd" }
                      : { background: `${accent}15`, color: accent }
                  }
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        ) : null;
      case "projects":
        return data.projects.length ? (
          <Section key={key} title="Projects" accent={accent}>
            {data.projects.map((pr) => (
              <div key={pr.id} className="mb-2">
                <div className="font-semibold">
                  {pr.title}
                  {pr.link && <span className="text-xs font-normal text-gray-500"> · {pr.link}</span>}
                </div>
                <div className="text-sm">{pr.description}</div>
              </div>
            ))}
          </Section>
        ) : null;
      case "certifications":
        return data.certifications.length ? (
          <Section key={key} title="Certifications" accent={accent}>
            {data.certifications.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span><strong>{c.name}</strong> · {c.issuer}</span>
                <span className="text-xs text-gray-500">{c.date}</span>
              </div>
            ))}
          </Section>
        ) : null;
      case "languages":
        return data.languages.length ? (
          <Section key={key} title="Languages" accent={accent}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {data.languages.map((l) => (
                <div key={l.id}><strong>{l.name}</strong> {l.level && `– ${l.level}`}</div>
              ))}
            </div>
          </Section>
        ) : null;
    }
  };

  if (template === "classic") {
    return (
      <div className="resume-page p-10 mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Georgia, serif" }}>
        <header className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: accent }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{p.fullName || "Your Name"}</h1>
          {p.title && <div className="text-base text-gray-600 mt-1">{p.title}</div>}
          <div className="flex justify-center flex-wrap gap-3 mt-2 text-xs text-gray-600">
            {contactItems.map((c, i) => <span key={i} className="flex items-center gap-1"><c.icon size={11}/>{c.text}</span>)}
          </div>
        </header>
        {order.map(renderSection)}
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className="resume-page p-12 mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif" }}>
        <header className="mb-8">
          <h1 className="text-4xl font-light tracking-tight">{p.fullName || "Your Name"}</h1>
          {p.title && <div className="text-sm text-gray-500 mt-1 uppercase tracking-widest">{p.title}</div>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-600">
            {contactItems.map((c, i) => <span key={i}>{c.text}</span>)}
          </div>
        </header>
        {order.map(renderSection)}
      </div>
    );
  }

  // Modern (sidebar layout)
  return (
    <div className="resume-page mx-auto flex" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif" }}>
      <aside className="w-[35%] p-6 text-white" style={{ background: accent }}>
        <h1 className="text-2xl font-bold leading-tight">{p.fullName || "Your Name"}</h1>
        {p.title && <div className="text-sm opacity-90 mt-1">{p.title}</div>}
        <div className="mt-6 space-y-1.5 text-xs">
          {contactItems.map((c, i) => (
            <div key={i} className="flex items-start gap-2 break-all">
              <c.icon size={12} className="mt-0.5 shrink-0" />
              <span>{c.text}</span>
            </div>
          ))}
        </div>
        {data.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[11px] font-bold tracking-widest uppercase mb-2 opacity-90">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/15">{s}</span>
              ))}
            </div>
          </div>
        )}
        {data.languages.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[11px] font-bold tracking-widest uppercase mb-2 opacity-90">Languages</h2>
            {data.languages.map((l) => (
              <div key={l.id} className="text-xs mb-0.5">{l.name} {l.level && `– ${l.level}`}</div>
            ))}
          </div>
        )}
      </aside>
      <main className="flex-1 p-8">
        {order.filter((k) => k !== "skills" && k !== "languages").map(renderSection)}
      </main>
    </div>
  );
};
