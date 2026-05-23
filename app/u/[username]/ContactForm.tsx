"use client";

import { useState } from "react";
import { Send, CheckCircle, RefreshCw, Loader2 } from "lucide-react";

type FormState = { sender_name: string; sender_contact: string; message: string };

const EMPTY: FormState = { sender_name: "", sender_contact: "", message: "" };

export function ContactForm({ username }: { username: string }) {
  const [form, setForm] = useState<FormState>(EMPTY);
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
      setError(body.error ?? "Erro ao enviar mensagem. Tente novamente.");
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">Mensagem enviada!</p>
          <p className="text-sm text-slate-400">Em breve você receberá um retorno.</p>
        </div>
        <button
          onClick={() => { setSent(false); setForm(EMPTY); }}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mt-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Enviar outra mensagem
        </button>
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
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-colors"
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
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-colors"
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
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent resize-none transition-colors"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs transition-colors ${form.message.length > 1800 ? "text-yellow-400" : "text-slate-500"}`}>
            {form.message.length}/2000
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-white font-medium text-sm"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {sending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
