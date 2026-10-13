import { solution } from "@/lib/case";

export async function POST(req: Request) {
  const { suspectId, secondsTaken = 0, hintsUsed = 0, wrongGuesses = 0 } = await req.json();
  const correct = suspectId === solution.culpritId;
  const gaveUp = !correct && wrongGuesses >= 2; // third wrong guess ends the case
  const score = correct
    ? Math.max(0, Math.round(1000 - secondsTaken * 2 - hintsUsed * 100 - wrongGuesses * 150))
    : 0;
  const reveal = correct || gaveUp;
  return Response.json({
    correct, score, over: reveal,
    breakdown: reveal ? solution.breakdown : undefined,
    culpritId: reveal ? solution.culpritId : undefined,
  });
}
