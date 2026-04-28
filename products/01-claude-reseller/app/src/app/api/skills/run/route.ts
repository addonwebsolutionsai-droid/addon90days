import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  runSkill,
  invoiceGenerator,
  gstCalculator,
  emailDrafter,
  codeReviewer,
  prDescription,
  sqlQueryBuilder,
  testGenerator,
  iotFirmwareScaffold,
  iotDeviceSchema,
  iotOtaPipeline,
} from "@/lib/toolkit";
import type { SkillDefinition } from "@/lib/toolkit";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SKILL_MAP: Record<string, SkillDefinition<any, any>> = {
  "invoice-generator": invoiceGenerator,
  "gst-calculator": gstCalculator,
  "email-drafter": emailDrafter,
  "code-reviewer": codeReviewer,
  "pr-description": prDescription,
  "sql-query-builder": sqlQueryBuilder,
  "test-generator": testGenerator,
  "iot-firmware-scaffold": iotFirmwareScaffold,
  "iot-device-registry-schema": iotDeviceSchema,
  "iot-ota-pipeline": iotOtaPipeline,
};

// Free skills (no purchase required)
const FREE_SKILLS = new Set(["invoice-generator", "gst-calculator", "email-drafter", "pr-description"]);

// Pack → skills mapping for access check
const PACK_SKILLS: Record<string, string[]> = {
  "iot-developer-pack": ["iot-firmware-scaffold", "iot-device-registry-schema", "iot-ota-pipeline"],
  "developer-productivity-pack": ["code-reviewer", "sql-query-builder", "test-generator"],
  "smb-operations-pack": ["invoice-generator", "gst-calculator", "email-drafter"],
  "all-access-monthly": Object.keys(SKILL_MAP),
};

const RequestSchema = z.object({
  skillId: z.string(),
  input: z.record(z.unknown()),
});

function userHasAccess(purchasedPacks: string[], skillId: string): boolean {
  if (FREE_SKILLS.has(skillId)) return true;
  return purchasedPacks.some((pack) =>
    PACK_SKILLS[pack]?.includes(skillId) ?? false
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as unknown;
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { skillId, input } = parsed.data;
  const skill = SKILL_MAP[skillId];
  if (!skill) {
    return NextResponse.json({ error: `Unknown skill: ${skillId}` }, { status: 404 });
  }

  // Check purchase access
  const user = await currentUser();
  const purchasedPacks = (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];

  if (!userHasAccess(purchasedPacks, skillId)) {
    return NextResponse.json(
      { error: "Not purchased. Buy the pack that includes this skill." },
      { status: 403 }
    );
  }

  const result = await runSkill(skill, input);

  if (!result.success) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: 422 });
  }

  return NextResponse.json({
    data: result.data,
    meta: { tokensUsed: result.tokensUsed, durationMs: result.durationMs },
  });
}
