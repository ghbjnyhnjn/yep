// AI generation utilities. Supports two modes:
// 1) Local pseudo-AI (no external calls) for safe Netlify-only hosting.
// 2) OpenAI mode when the user provides an API key in Settings.
//    NOTE: Using an API key in the browser exposes it to users of that browser. 
//    For production, use a server-side proxy. This is a demo-only option.

const slangLex = [
  "yo", "wsg", "wassup", "fr", "bet", "ngl", "lowkey", "highkey",
  "sheesh", "bruh", "oomf", "tbf", "idk", "gtg", "ttyl", "ight",
  "say less", "no cap", "deadass", "bro", "fam"
];

const interjections = ["tbh", "ngl", "okok", "look", "real talk", "lowkey", "highkey"];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p=0.5) { return Math.random() < p; }

export function localPseudoAI({bot, topics=[], history=[], maxLen=2}) {
  // Simple heuristic response influenced by bot.persona, bot.subjects, and recent topics.
  const subject = topics.length ? rand(topics) : (bot.subject || "random vibes");
  const slang = Array.from({length: 1 + Math.floor(Math.random()*2)})
     .map(() => rand(slangLex)).join(" ");
  const interj = maybe(0.4) ? rand(interjections) + ", " : "";
  const tone = bot.persona?.toLowerCase().includes("hype") ? "LET'S GOO" :
               bot.persona?.toLowerCase().includes("chill") ? "chillin" :
               bot.persona?.toLowerCase().includes("nerd") ? "FYI" : "vibes";

  const lastUser = [...history].reverse().find(m => m.author === "You");
  const ref = lastUser ? (" re: " + lastUser.text.slice(0, 40)) : "";

  const sentences = [
    `${interj}${slang} ${tone} on ${subject}${maybe(0.5) ? " rn" : ""}${maybe(0.3) ? " no cap" : ""}${ref}`.trim(),
    maybe(0.5) ? `like ${subject} kinda wild${maybe(0.5) ? " fr" : ""}` : null,
    maybe(0.3) ? `gtg soon but ${subject} still on my mind lol` : null,
  ].filter(Boolean);
  const out = sentences.slice(0, Math.max(1, maxLen)).join(". ");
  return out;
}

export async function openAIResponse({ apiKey, model='gpt-4o-mini', bot, topics=[], history=[], maxLen=2 }) {
  const system = [
    `You are a casual Discord-style bot called ${bot.name}.`,
    `Persona: ${bot.persona}. Use modern slang appropriately (e.g., wsg, yo, gtg).`,
    `Stay concise: ${maxLen} sentences max. Avoid long paragraphs.`,
    `Preferred topics: ${[bot.subject, ...(bot.topics||[]), ...topics].filter(Boolean).join(', ') || 'general chatter'}.`,
    `If the user introduces a new topic, acknowledge and riff briefly.`
  ].join("\n");

  const convo = history.slice(-12).map(m => `${m.author}: ${m.text}`).join("\n");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Recent conversation:\n${convo}\nReply now in your style.` }
    ],
    temperature: 0.85,
    max_tokens: 120,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("OpenAI error: " + t);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || localPseudoAI({bot, topics, history, maxLen});
}

export async function generateAI({ settings, bot, topics, history }) {
  const maxLen = 2;
  if (settings.useOpenAI && settings.openaiKey) {
    try {
      return await openAIResponse({ apiKey: settings.openaiKey, model: settings.model || 'gpt-4o-mini', bot, topics, history, maxLen });
    } catch (e) {
      console.warn(e);
      return localPseudoAI({bot, topics, history, maxLen});
    }
  } else {
    return localPseudoAI({bot, topics, history, maxLen});
  }
}