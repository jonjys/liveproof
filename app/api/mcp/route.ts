import { NextResponse } from "next/server";
import { analyzeInbound } from "@/lib/check/analyze";
import { newCheckId, saveReport, getReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";
import type { CheckReport } from "@/lib/check/types";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type JsonRpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

function ok(id: string | number | null | undefined, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function err(
  id: string | number | null | undefined,
  code: number,
  message: string
) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  });
}

const TOOLS = [
  {
    name: "check_inbound_message",
    description:
      "Analyze an inbound freelance/job/client message for scam patterns. Returns a LiveProof risk score and report URL.",
    inputSchema: {
      type: "object",
      properties: {
        sourceText: {
          type: "string",
          description: "Full inbound email or DM text",
        },
        companyName: { type: "string" },
        contact: { type: "string" },
      },
      required: ["sourceText"],
    },
  },
  {
    name: "get_message_check",
    description: "Fetch a previously created LiveProof message-check report by id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
];

async function callTool(
  name: string,
  args: Record<string, unknown>,
  origin: string
) {
  if (name === "check_inbound_message") {
    const sourceText = String(args.sourceText || "").trim();
    if (sourceText.length < 40) {
      throw new Error("sourceText must be at least a few sentences.");
    }
    const analyzed = analyzeInbound({
      sourceText,
      companyName: args.companyName ? String(args.companyName) : undefined,
      contact: args.contact ? String(args.contact) : undefined,
    });
    const report: CheckReport = {
      id: newCheckId(),
      createdAt: new Date().toISOString(),
      unlocked: false,
      paidAt: null,
      stripeSessionId: null,
      ...analyzed,
    };
    await saveReport(report);
    const pub = toPublicReport(report);
    return {
      ...pub,
      url: `${origin}/check/r/${report.id}`,
    };
  }

  if (name === "get_message_check") {
    const id = String(args.id || "");
    const report = await getReport(id);
    if (!report) throw new Error("Report not found.");
    const pub = toPublicReport(report);
    return { ...pub, url: `${origin}/check/r/${report.id}` };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = rateLimit(`mcp:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const origin = new URL(request.url).origin;
  const body = (await request.json().catch(() => ({}))) as JsonRpc;
  const id = body.id ?? null;
  const method = body.method;

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "liveproof", version: "1.1.0" },
    });
  }

  if (method === "tools/list") {
    return ok(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const name = body.params?.name;
    const args = body.params?.arguments ?? {};
    if (!name) return err(id, -32602, "Missing tool name");
    try {
      const result = await callTool(name, args, origin);
      return ok(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      });
    } catch (e) {
      return err(id, -32000, e instanceof Error ? e.message : "Tool failed");
    }
  }

  if (method === "notifications/initialized" || method === "ping") {
    return ok(id, {});
  }

  return err(id, -32601, `Method not found: ${method}`);
}

export async function GET() {
  return NextResponse.json({
    name: "liveproof",
    tools: TOOLS.map((t) => t.name),
    endpoint: "/api/mcp",
  });
}
