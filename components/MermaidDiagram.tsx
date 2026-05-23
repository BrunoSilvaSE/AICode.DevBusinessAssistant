"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

// Renders Mermaid diagrams via mermaid.ink CDN — no npm package needed
function buildMermaidUrl(chart: string): string {
  const encoded = btoa(unescape(encodeURIComponent(chart.trim())));
  return `https://mermaid.ink/svg/${encoded}`;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const [imgError, setImgError] = useState(false);

  if (!chart.trim()) return null;

  if (imgError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive justify-center py-6">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Diagrama inválido — tente gerar novamente.
      </div>
    );
  }

  const url = buildMermaidUrl(chart);

  return (
    <div className="w-full overflow-auto rounded-xl border bg-white dark:bg-slate-950 p-4 flex justify-center">
      <img
        src={url}
        alt="Diagrama de arquitetura"
        className="max-w-full h-auto"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
