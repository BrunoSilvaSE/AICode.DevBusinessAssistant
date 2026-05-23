import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const ContactSchema = z.object({
  sender_name: z.string().min(1, "Nome é obrigatório").max(100),
  sender_contact: z.string().min(1, "E-mail ou celular é obrigatório").max(200),
  message: z.string().min(1, "Mensagem é obrigatória").max(2000),
});

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const raw = await req.json().catch(() => ({}));
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const supabase = adminSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .single();

  if (!profile) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const { error } = await supabase.from("contact_messages").insert({
    recipient_user_id: profile.user_id,
    sender_name: parsed.data.sender_name,
    sender_contact: parsed.data.sender_contact,
    message: parsed.data.message,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
