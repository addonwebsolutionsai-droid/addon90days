import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  emailType: z.enum(["cold-outreach", "follow-up", "proposal", "support-reply", "announcement", "apology", "negotiation"]),
  senderName: z.string(),
  senderRole: z.string(),
  recipientName: z.string(),
  recipientCompany: z.string().optional(),
  context: z.string(),
  tone: z.enum(["formal", "friendly", "direct", "persuasive"]).default("friendly"),
  callToAction: z.string().optional(),
  maxWords: z.number().positive().default(200),
});

const OutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  alternativeSubjects: z.array(z.string()),
  wordCount: z.number(),
  toneAnalysis: z.string(),
});

export const emailDrafter: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "email-drafter",
    name: "Email Drafter",
    description: "Write professional emails for any situation — cold outreach, proposals, follow-ups, support replies. Adapts tone from formal to direct.",
    version: "1.0.0",
    category: "business",
    tags: ["email", "communication", "outreach", "sales", "support"],
    priceUsd: 5,
    model: "claude-haiku-4-5-20251001",
    estimatedTokens: 800,
  },
  input: {
    schema: InputSchema,
    example: {
      emailType: "cold-outreach",
      senderName: "Rohan Shah",
      senderRole: "Founder, AddonWeb",
      recipientName: "Anand Mehta",
      recipientCompany: "Precision Auto Parts",
      context: "They have 15 CNC machines and complained about 3 unplanned breakdowns last quarter on LinkedIn.",
      tone: "direct",
      callToAction: "15-minute call this week",
      maxWords: 150,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You write emails that get read and replied to. Rules:
- Subject lines: specific, not clickbait. Max 60 chars.
- First sentence: about them, not you.
- One idea per email. One CTA max.
- No filler phrases ("I hope this email finds you well").
- Match tone exactly: formal=business letter style, friendly=conversational, direct=no fluff, persuasive=problem-then-solution.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Write a ${input.emailType} email:
From: ${input.senderName} (${input.senderRole})
To: ${input.recipientName}${input.recipientCompany ? ` at ${input.recipientCompany}` : ""}
Context: ${input.context}
Tone: ${input.tone}
${input.callToAction ? `CTA: ${input.callToAction}` : ""}
Max words: ${input.maxWords}`,
};
