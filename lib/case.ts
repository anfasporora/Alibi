// The public case is sent to the browser. The solution NEVER is, until the player commits.
export type Suspect = { id: string; name: string; role: string; statement: string };
export type PublicCase = {
  id: string; title: string; intro: string;
  evidence: { id: string; time: string; text: string }[];
  suspects: Suspect[]; hints: string[];
};

export const publicCase: PublicCase = {
  id: "001",
  title: "Insulin at Halloran House",
  intro:
    "Edmund Halloran, 68, a retired shipping magnate, was found dead in his study at 22:10 on a rainy Friday. Five people were connected to the house tonight. Four are telling the truth. One has dressed a lie to look like routine.",
  evidence: [
    { id: "E1", time: "21:30–21:45", text: "Medical examiner: insulin overdose. Time of death falls in this window, in the study." },
    { id: "E2", time: "21:33", text: "Edmund's smart insulin pen logged one large dose." },
    { id: "E3", time: "21:52", text: "Front-door smart lock: exit recorded using Dr. Nair's keycode." },
    { id: "E4", time: "21:00–22:00", text: "Kitchen camera: Lena Voss at the stove or sink, continuously." },
    { id: "E5", time: "21:15 / 22:05", text: "Gate log: the car left at 21:15 and returned at 22:05, driven by Tom Reyes." },
    { id: "E6", time: "21:18", text: "Kingsford station: Iris Calloway's ticket scanned at the barrier." },
    { id: "E7", time: "21:25", text: "Study landline placed a 6-minute call to Marcus Hale's mobile." },
    { id: "E8", time: "21:20 / 21:46", text: "Rideshare receipt: Marcus picked up at the Riverside Club, dropped at the manor gate." },
  ],
  suspects: [
    { id: "priya", name: "Dr. Priya Nair", role: "Family physician",
      statement: "I did Edmund's evening check at 20:45, gave him his usual dose and left by the front door at nine. I was home by 21:30. He was alive and well when I walked out." },
    { id: "marcus", name: "Marcus Hale", role: "Business partner, heir to the firm",
      statement: "Edmund and I fought on the phone around 21:25. I won't pretend otherwise. I was in a taxi from the Riverside Club and reached the house a little before 22:00. We found him at 22:10." },
    { id: "lena", name: "Lena Voss", role: "Housekeeper, fired on Tuesday",
      statement: "I never left the kitchen all evening. Mr. Halloran sacked me, and I'm not sorry he's gone, but I didn't do this." },
    { id: "tom", name: "Tom Reyes", role: "Chauffeur",
      statement: "I took the car out at quarter past nine to fetch Miss Iris from Kingsford station. We were back at five past ten." },
    { id: "iris", name: "Iris Calloway", role: "Niece, cut from the will",
      statement: "My train got in at 21:18 and Tom drove me straight back. I haven't spoken to Uncle Edmund in a year." },
  ],
  hints: [
    "Four statements can be checked against a timestamped record. Check them one at a time.",
    "Who could have been inside the house between 21:30 and 21:45?",
    "Look at the front-door log. Who says they left, and when?",
  ],
};

export const solution = {
  culpritId: "priya",
  breakdown: [
    { suspectId: "priya", verdict: "Culprit", note: "She says she left at 21:00, but the lock log shows her keycode exiting at 21:52, after the 21:33 pen dose and inside the window of death. She had the medical knowledge and the access. Her calm 'usual dose' story was meant to explain her fingerprints on the pen." },
    { suspectId: "marcus", verdict: "Cleared", note: "Loud motive, but the rideshare receipt puts him in a car until 21:46, and the 21:25 call shows Edmund alive. He was a red herring." },
    { suspectId: "lena", verdict: "Cleared", note: "Fired and bitter, but the kitchen camera shows her the whole hour." },
    { suspectId: "tom", verdict: "Cleared", note: "The gate log backs his 21:15 to 22:05 trip exactly." },
    { suspectId: "iris", verdict: "Cleared", note: "Her ticket scan at 21:18 matches her story, and she was in Tom's car during the window." },
  ],
};
