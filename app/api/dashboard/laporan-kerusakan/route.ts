import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET semua laporan
export async function GET() {
  const { data, error } = await supabase
    .from("pelaporan_kerusakan")
    .select("*")
    .order("waktu_dibuat", { ascending: false });

  if (error) {
    console.error("GET laporan error:", error);
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST laporan baru
export async function POST(req: Request) {
  const body = await req.json();
  const { judul, deskripsi, lokasi, status } = body;

  const { data, error } = await supabase
    .from("pelaporan_kerusakan")
    .insert([{ judul, deskripsi, lokasi, status }])
    .select();

  if (error) {
    console.error("POST laporan error:", error);
    return NextResponse.json({ message: "Gagal tambah laporan" }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
