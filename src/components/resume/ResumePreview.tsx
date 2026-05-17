import { ResumeData, TemplateKey } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface Props {
  data: ResumeData;
  template: TemplateKey;
}

/* ---------- Shared helpers ---------- */

const contactList = (p: ResumeData["personal"]) =>
  [
    p.email && { icon: Mail, text: p.email },
    p.phone && { icon: Phone, text: p.phone },
    p.address && { icon: MapPin, text: p.address },
    p.linkedin && { icon: Linkedin, text: p.linkedin },
    p.github && { icon: Github, text: p.github },
    p.website && { icon: Globe, text: p.website },
  ].filter(Boolean) as { icon: any; text: string }[];

const Section = ({
  title,
  children,
  accent,
  variant = "underline",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
  variant?: "underline" | "block" | "plain" | "double";
}) => {
  if (variant === "block") {
    return (
      <section className="mb-5">
        <h2
          className="text-[12px] font-bold tracking-[0.2em] uppercase mb-3 px-3 py-1.5 text-white inline-block"
          style={{ background: accent }}
        >
          {title}
        </h2>
        <div className="text-[13px] leading-relaxed">{children}</div>
      </section>
    );
  }
  if (variant === "plain") {
    return (
      <section className="mb-5">
        <h2 className="text-[11px] font-semibold tracking-[0.25em] uppercase mb-2 text-gray-500">
          {title}
        </h2>
        <div className="text-[13px] leading-relaxed">{children}</div>
      </section>
    );
  }
  if (variant === "double") {
    return (
      <section className="mb-5">
        <h2
          className="text-[13px] font-bold tracking-widest uppercase mb-2 py-1 border-y-2 text-center"
          style={{ borderColor: accent, color: accent }}
        >
          {title}
        </h2>
        <div className="text-[13px] leading-relaxed">{children}</div>
      </section>
    );
  }
  return (
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
};

/* ---------- Reusable section renderer ---------- */

function renderSections(
  data: ResumeData,
  accent: string,
  opts: {
    variant?: "underline" | "block" | "plain" | "double";
    skip?: string[];
    skillStyle?: "pill" | "outline" | "comma" | "dot";
    bulletStyle?: "disc" | "arrow" | "square";
  } = {}
) {
  const { variant = "underline", skip = [], skillStyle = "pill", bulletStyle = "disc" } = opts;

  const bulletPrefix = bulletStyle === "arrow" ? "▸ " : bulletStyle === "square" ? "▪ " : "";
  const listClass = bulletStyle === "disc" ? "list-disc ml-5 mt-1" : "ml-1 mt-1 space-y-0.5";

  return data.sectionOrder
    .filter((k) => !skip.includes(k))
    .map((key) => {
      switch (key) {
        case "summary":
          return data.summary ? (
            <Section key={key} title="Professional Summary" accent={accent} variant={variant}>
              <p>{data.summary}</p>
            </Section>
          ) : null;
        case "experience":
          return data.experience.length ? (
            <Section key={key} title="Experience" accent={accent} variant={variant}>
              {data.experience.map((e) => (
                <div key={e.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold">
                      {e.role || "Role"}
                      {e.company && (
                        <>
                          {" · "}
                          <span className="font-normal">{e.company}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {e.start} {e.end && `– ${e.end}`}
                    </div>
                  </div>
                  {e.location && <div className="text-xs text-gray-500 italic">{e.location}</div>}
                  {bulletStyle === "disc" ? (
                    <ul className={listClass}>
                      {e.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className={listClass}>
                      {e.bullets.filter(Boolean).map((b, i) => (
                        <div key={i}>
                          {bulletPrefix}
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          ) : null;
        case "education":
          return data.education.length ? (
            <Section key={key} title="Education" accent={accent} variant={variant}>
              {data.education.map((e) => (
                <div key={e.id} className="mb-2">
                  <div className="flex justify-between">
                    <div className="font-semibold">
                      {e.degree} {e.field && `in ${e.field}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {e.start} {e.end && `– ${e.end}`}
                    </div>
                  </div>
                  <div className="text-sm">{e.school}</div>
                  {e.details && <div className="text-xs mt-1">{e.details}</div>}
                </div>
              ))}
            </Section>
          ) : null;
        case "skills":
          return data.skills.length ? (
            <Section key={key} title="Skills" accent={accent} variant={variant}>
              {skillStyle === "comma" ? (
                <div className="text-sm">{data.skills.join(" · ")}</div>
              ) : skillStyle === "dot" ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {data.skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                      {s}
                    </div>
                  ))}
                </div>
              ) : skillStyle === "outline" ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: "#ccc" }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          ) : null;
        case "projects":
          return data.projects.length ? (
            <Section key={key} title="Projects" accent={accent} variant={variant}>
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
            <Section key={key} title="Certifications" accent={accent} variant={variant}>
              {data.certifications.map((c) => (
                <div key={c.id} className="flex items-center gap-3 mb-2 text-sm">
                  {c.image && (
                    <img
                      src={c.image}
                      alt=""
                      crossOrigin="anonymous"
                      className="object-cover rounded border shrink-0"
                      style={{ width: 44, height: 44, borderColor: "#e5e5e5" }}
                    />
                  )}
                  <div className="flex-1 flex justify-between items-baseline gap-2 min-w-0">
                    <span className="truncate">
                      <strong>{c.name}</strong> · {c.issuer}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">{c.date}</span>
                  </div>
                </div>
              ))}
            </Section>
          ) : null;
        case "languages":
          return data.languages.length ? (
            <Section key={key} title="Languages" accent={accent} variant={variant}>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {data.languages.map((l) => (
                  <div key={l.id}>
                    <strong>{l.name}</strong> {l.level && `– ${l.level}`}
                  </div>
                ))}
              </div>
            </Section>
          ) : null;
      }
    });
}

/* ---------- Template renderers ---------- */

const Photo = ({
  src,
  size,
  border,
  className,
}: {
  src?: string;
  size: number;
  border?: string;
  className?: string;
}) =>
  src ? (
    <img
      src={src}
      alt=""
      className={`rounded-full object-cover ${className || ""}`}
      style={{ width: size, height: size, border }}
      crossOrigin="anonymous"
    />
  ) : null;

export const ResumePreview = ({ data, template }: Props) => {
  const p = data.personal;
  const contacts = contactList(p);

  /* 1. EXECUTIVE — formal, authoritative, serif */
  if (template === "executive") {
    const accent = "#1a2238";
    return (
      <div
        className="resume-page p-12 mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a" }}
      >
        <header className="text-center mb-6 pb-5 border-b-4" style={{ borderColor: accent }}>
          <Photo src={p.photo} size={110} border={`3px solid ${accent}`} className="mx-auto mb-3" />
          <h1 className="text-4xl font-bold tracking-wide uppercase" style={{ color: accent, letterSpacing: "0.05em" }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.title && <div className="text-base text-gray-700 mt-2 italic">{p.title}</div>}
          <div className="flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-700">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <c.icon size={11} />
                {c.text}
              </span>
            ))}
          </div>
        </header>
        {renderSections(data, accent, { variant: "double", skillStyle: "comma" })}
      </div>
    );
  }

  /* 2. TECH MINIMALIST — clean, monospaced touches, ATS-friendly */
  if (template === "tech") {
    const accent = "#0a0a0a";
    return (
      <div
        className="resume-page p-12 mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, ui-sans-serif, system-ui", color: "#111" }}
      >
        <header className="mb-7 flex items-center gap-5">
          <Photo src={p.photo} size={90} border="1px solid #e5e5e5" />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{p.fullName || "Your Name"}</h1>
            {p.title && (
              <div className="text-sm text-gray-600 mt-1" style={{ fontFamily: "ui-monospace, monospace" }}>
                {p.title}
              </div>
            )}
            <div
              className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-700"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
            >
              {contacts.map((c, i) => (
                <span key={i}>{c.text}</span>
              ))}
            </div>
          </div>
        </header>
        {renderSections(data, accent, { variant: "plain", skillStyle: "outline", bulletStyle: "arrow" })}
      </div>
    );
  }

  /* 3. CREATIVE STORYTELLER — bold, modern sidebar with vibrant accent */
  if (template === "creative") {
    const accent = "#7c3aed";
    return (
      <div
        className="resume-page mx-auto flex bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif" }}
      >
        <aside className="w-[36%] p-7 text-white" style={{ background: `linear-gradient(160deg, ${accent}, #ec4899)` }}>
          <Photo src={p.photo} size={120} border="3px solid rgba(255,255,255,0.45)" className="mb-4 mx-auto block" />
          <h1 className="text-2xl font-bold leading-tight">{p.fullName || "Your Name"}</h1>
          {p.title && <div className="text-sm opacity-95 mt-1 italic">{p.title}</div>}
          <div className="mt-6 space-y-1.5 text-xs">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-start gap-2 break-all">
                <c.icon size={12} className="mt-0.5 shrink-0" />
                <span>{c.text}</span>
              </div>
            ))}
          </div>
          {data.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[11px] font-bold tracking-widest uppercase mb-2 opacity-90">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((s, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[11px] font-bold tracking-widest uppercase mb-2 opacity-90">Languages</h2>
              {data.languages.map((l) => (
                <div key={l.id} className="text-xs mb-0.5">
                  {l.name} {l.level && `– ${l.level}`}
                </div>
              ))}
            </div>
          )}
        </aside>
        <main className="flex-1 p-8">
          {data.summary && (
            <section className="mb-6">
              <h2 className="text-[13px] font-bold tracking-widest uppercase mb-2" style={{ color: accent }}>
                My Story
              </h2>
              <p className="text-[14px] leading-relaxed italic text-gray-700">"{data.summary}"</p>
            </section>
          )}
          {renderSections(data, accent, { skip: ["summary", "skills", "languages"], variant: "underline" })}
        </main>
      </div>
    );
  }

  /* 4. ACADEMIC / CV — detailed, dense, serif */
  if (template === "academic") {
    const accent = "#3b2f1e";
    return (
      <div
        className="resume-page p-10 mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Times New Roman', Times, serif", color: "#1a1a1a" }}
      >
        <header className="mb-5 text-center">
          <h1 className="text-3xl font-bold">{p.fullName || "Your Name"}</h1>
          {p.title && <div className="text-sm text-gray-700 mt-1">{p.title}</div>}
          <div className="text-xs text-gray-700 mt-2">
            {contacts.map((c) => c.text).join(" • ")}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Curriculum Vitae</div>
        </header>
        {data.summary && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">Research Statement</h2>
            <p className="text-[13px] leading-relaxed text-justify">{data.summary}</p>
          </section>
        )}
        {data.education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">Education</h2>
            {data.education.map((e) => (
              <div key={e.id} className="mb-2 text-[13px]">
                <div className="flex justify-between">
                  <strong>
                    {e.degree} {e.field && `in ${e.field}`}
                  </strong>
                  <span className="italic">
                    {e.start} – {e.end}
                  </span>
                </div>
                <div>{e.school}</div>
                {e.details && <div className="text-xs text-gray-700 mt-0.5">{e.details}</div>}
              </div>
            ))}
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">
              Research &amp; Teaching Experience
            </h2>
            {data.experience.map((e) => (
              <div key={e.id} className="mb-3 text-[13px]">
                <div className="flex justify-between">
                  <strong>
                    {e.role} — <span className="font-normal italic">{e.company}</span>
                  </strong>
                  <span className="italic">
                    {e.start} – {e.end}
                  </span>
                </div>
                {e.location && <div className="text-xs italic text-gray-600">{e.location}</div>}
                <ul className="list-disc ml-5 mt-1">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="text-justify">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
        {data.projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">
              Publications &amp; Projects
            </h2>
            {data.projects.map((pr, i) => (
              <div key={pr.id} className="mb-1.5 text-[13px]">
                <span className="font-semibold">[{i + 1}]</span> {pr.title}. {pr.description}
                {pr.link && <span className="italic text-gray-600"> — {pr.link}</span>}
              </div>
            ))}
          </section>
        )}
        {data.certifications.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">
              Certifications &amp; Awards
            </h2>
            {data.certifications.map((c) => (
              <div key={c.id} className="flex items-center gap-3 mb-1 text-[13px]">
                {c.image && (
                  <img
                    src={c.image}
                    alt=""
                    crossOrigin="anonymous"
                    className="object-cover rounded border shrink-0"
                    style={{ width: 40, height: 40, borderColor: "#d4d4d4" }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <strong>{c.name}</strong>, {c.issuer} <span className="italic text-gray-600">({c.date})</span>
                </div>
              </div>
            ))}
          </section>
        )}
        {data.skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">
              Areas of Specialization
            </h2>
            <div className="text-[13px]">{data.skills.join("; ")}.</div>
          </section>
        )}
        {data.languages.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1 border-b border-gray-400">Languages</h2>
            <div className="text-[13px]">
              {data.languages.map((l) => `${l.name} (${l.level || "—"})`).join(", ")}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* 5. FUNCTIONAL / CAREER CHANGER — skills-grouped first */
  if (template === "functional") {
    const accent = "#0f766e";
    return (
      <div
        className="resume-page p-10 mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif", color: "#111" }}
      >
        <header className="mb-6 flex items-center gap-5">
          <Photo src={p.photo} size={95} border={`2px solid ${accent}`} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: accent }}>
              {p.fullName || "Your Name"}
            </h1>
            {p.title && <div className="text-sm text-gray-600 mt-1 uppercase tracking-widest">{p.title}</div>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-700">
              {contacts.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <c.icon size={11} />
                  {c.text}
                </span>
              ))}
            </div>
          </div>
        </header>
        {data.summary && (
          <Section title="Career Profile" accent={accent}>
            <p>{data.summary}</p>
          </Section>
        )}
        {data.skills.length > 0 && (
          <Section title="Functional Skill Areas" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {data.skills.map((s, i) => (
                <div key={i} className="text-[13px] flex items-start gap-2">
                  <span
                    className="mt-1 w-2 h-2 rounded-full shrink-0"
                    style={{ background: accent }}
                  />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
        {data.experience.length > 0 && (
          <Section title="Professional History" accent={accent}>
            {data.experience.map((e) => (
              <div key={e.id} className="mb-2 text-[13px] flex justify-between">
                <div>
                  <strong>{e.role}</strong> — {e.company}
                  {e.location && <span className="text-gray-500"> · {e.location}</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {e.start} – {e.end}
                </div>
              </div>
            ))}
          </Section>
        )}
        {renderSections(data, accent, { skip: ["summary", "skills", "experience"], variant: "underline" })}
      </div>
    );
  }

  /* 6. STARTUP HUSTLER — punchy, energetic */
  if (template === "startup") {
    const accent = "#f97316";
    return (
      <div
        className="resume-page p-10 mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif", color: "#111" }}
      >
        <header className="mb-6 pb-4" style={{ borderBottom: `4px double ${accent}` }}>
          <div className="flex items-center gap-5">
            <Photo src={p.photo} size={90} border={`3px solid ${accent}`} />
            <div className="flex-1">
              <h1 className="text-4xl font-black tracking-tight uppercase">
                {p.fullName || "Your Name"}
              </h1>
              {p.title && (
                <div className="text-sm font-semibold mt-1" style={{ color: accent }}>
                  ⚡ {p.title}
                </div>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-700">
                {contacts.map((c, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <c.icon size={11} />
                    {c.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>
        {renderSections(data, accent, { variant: "block", skillStyle: "pill", bulletStyle: "arrow" })}
      </div>
    );
  }

  /* 7. PROJECT-CENTRIC — freelancer / consultant */
  const accent = "#0369a1";
  return (
    <div
      className="resume-page p-10 mx-auto bg-white"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "Inter, sans-serif", color: "#111" }}
    >
      <header className="mb-6 grid grid-cols-[auto,1fr] gap-5 items-center">
        <Photo src={p.photo} size={100} border={`2px solid ${accent}`} />
        <div>
          <h1 className="text-3xl font-bold">{p.fullName || "Your Name"}</h1>
          {p.title && (
            <div className="text-sm font-medium mt-1" style={{ color: accent }}>
              Independent {p.title}
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-700">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <c.icon size={11} />
                {c.text}
              </span>
            ))}
          </div>
        </div>
      </header>
      {data.summary && (
        <Section title="Consulting Profile" accent={accent}>
          <p>{data.summary}</p>
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title="Client Case Studies" accent={accent}>
          {data.projects.map((pr) => (
            <div key={pr.id} className="mb-3 p-3 rounded border-l-4" style={{ borderColor: accent, background: `${accent}08` }}>
              <div className="font-semibold flex justify-between items-baseline">
                <span>{pr.title}</span>
                {pr.link && <span className="text-xs font-normal text-gray-500">{pr.link}</span>}
              </div>
              <div className="text-sm mt-1">{pr.description}</div>
            </div>
          ))}
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Engagements" accent={accent}>
          {data.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">
                  {e.role} <span className="font-normal text-gray-600">@ {e.company}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {e.start} – {e.end}
                </div>
              </div>
              <ul className="list-disc ml-5 mt-1 text-[13px]">
                {e.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}
      {renderSections(data, accent, {
        skip: ["summary", "projects", "experience"],
        variant: "underline",
        skillStyle: "dot",
      })}
    </div>
  );
};
