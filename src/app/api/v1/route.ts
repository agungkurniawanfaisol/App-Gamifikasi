import { NextRequest, NextResponse } from "next/server";
import { getApiDiscoveryDocument } from "@/lib/external-api";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(getApiDiscoveryDocument(baseUrl));
}
