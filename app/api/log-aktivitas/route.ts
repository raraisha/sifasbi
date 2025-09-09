import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// koneksi ke supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ GET semua log
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("log_aktivitas")
      .select("*")
      .order("waktu", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API GET /log-aktivitas error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST log baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aksi, detail } = body;

    if (!aksi || !detail) {
      return NextResponse.json(
        { error: "aksi dan detail wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("aktivitas_log")
      .insert([{ aksi, detail }])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API POST /log-aktivitas error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
