import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function callAI(type: string, input: Record<string, unknown>): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("ai-resume", {
    body: { type, input },
  });
  if (error) {
    const msg = (error as any)?.context?.status === 429
      ? "Rate limit exceeded — try again shortly."
      : (error as any)?.context?.status === 402
      ? "AI credits exhausted. Add credits in Settings → Workspace → Usage."
      : error.message || "AI request failed";
    toast.error(msg);
    return null;
  }
  if ((data as any)?.error) {
    toast.error((data as any).error);
    return null;
  }
  return (data as any)?.text ?? null;
}
