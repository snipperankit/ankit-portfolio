import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { findResource } from "@/lib/resources";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const resource = path.startsWith("/resources/") ? findResource(path.slice(11).split("/")) : null;
  if (!resource) return new Response("Not found", { status: 404 });
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0e0e0d", color: "#f4f2e8", borderBottom: "16px solid #8fd98f" }}>
    <div style={{ fontSize: 25, color: "#8fd98f", marginBottom: 35 }}>ANKIT ANAND · ENGINEERING NOTES</div>
    <div style={{ fontSize: 58 }}>{resource.title}</div>
    <div style={{ fontSize: 24, marginTop: 30, color: "#cfcec4" }}>{resource.kind === "handbook" ? "Technical handbook · Free preview" : "GenAI visual reference · Free to read"}</div>
  </div>, { width: 1200, height: 630 });
}