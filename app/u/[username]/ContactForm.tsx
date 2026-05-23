"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm({ username }: { username: string }) {
  const [form, setForm] = useState({ sender_name: "", sender_contact: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const res = await fetch(`/api/contact/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao enviar mensagem");
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-10 w-10 text-green-400" />
        <p className="text-lg font-semibold text-white">Mensagem enviada!</p>
        <p className="text-sm text-slate-400">Em breve você receberá um retorno.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4 text-left">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome</label>
        <input
          type="text"
          required
          value={form.sender_name}
          onChange={(e) => setForm((f) => ({ ...f, sender_name: e.target.value }))}
          placeholder="Seu nome"
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          E-mail ou Celular
        </label>
        <input
          type="text"
          required
          value={form.sender_contact}
          onChange={(e) => setForm((f) => ({ ...f, sender_contact: e.target.value }))}
          placeholder="seu@email.com ou +55 81 99999-9999"
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Mensagem</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Olá! Gostaria de conversar sobre..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent resize-none"
        />
        <p className="text-right text-xs text-slate-500 mt-1">{form.message.length}/2000</p>
      </div>
      {error && (
        <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors text-white font-medium text-sm"
      >
        <Send className="h-4 w-4" />
        {sending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
