import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ value, onChange, placeholder }: Props) => {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px]">
      {value.map((t, i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1">
          {t}
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input && add(input)}
        placeholder={placeholder || "Type and press Enter"}
        className="border-0 shadow-none focus-visible:ring-0 h-7 px-1 flex-1 min-w-[120px]"
      />
    </div>
  );
};
