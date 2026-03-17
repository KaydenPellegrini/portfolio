import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const data = await db.collection("budget").findOne({ name: "main" });

  return NextResponse.json(data || {});
}

export async function POST(req: Request) {
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // ❗ REMOVE _id before updating
  const { _id, ...safeBody } = body;

  await db.collection("budget").updateOne(
    { name: "main" },
    { $set: { ...safeBody, name: "main" } },
    { upsert: true }
  );

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}