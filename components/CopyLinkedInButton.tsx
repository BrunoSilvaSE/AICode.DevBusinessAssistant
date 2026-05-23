"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function CopyLinkedInButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      title="Copiar texto e abrir LinkedIn"
      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#0077B5]/30 text-[#0077B5] bg-[#0077B5]/5 hover:bg-[#0077B5]/15 transition-colors dark:text-blue-400 dark:border-blue-400/30"
    >
      {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
      {copied ? "Copiado!" : "LinkedIn"}
    </button>
  );
}
