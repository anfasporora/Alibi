import { generate } from "@/lib/generator";
export async function GET(req: Request) {
  const level = Number(new URL(req.url).searchParams.get("level")) || 1;
  return Response.json(generate(level).pub);
}
