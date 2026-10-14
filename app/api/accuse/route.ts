import { generate } from "@/lib/generator";

export async function POST(req: Request) {
  const { level, suspectId, secondsTaken = 0, hintsUsed = 0, wrongGuesses = 0 } = await req.json();
  const { sol } = generate(Number(level) || 1);
  const correct = suspectId === sol.culpritId;
  const over = correct || wrongGuesses >= 2; // third wrong guess ends the case
  const score = correct ? Math.max(0, Math.round(1000 - secondsTaken * 2 - hintsUsed * 100 - wrongGuesses * 150)) : 0;
  return Response.json({ correct, score, over, breakdown: over ? sol.breakdown : undefined, culpritId: over ? sol.culpritId : undefined });
}
