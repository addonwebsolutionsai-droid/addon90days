/**
 * GitHub commit / read / list helper for /api/agents/* endpoints.
 *
 * Uses Octokit with a PAT held in Vercel env (GITHUB_TOKEN). The PAT
 * needs `repo` scope on addonwebsolutionsai-droid/addon90days.
 *
 * All operations target the `main` branch by default; the agent prompt
 * can override via `branch` parameter.
 */

import { Octokit } from "@octokit/rest";

const OWNER  = process.env["GITHUB_OWNER"]  ?? "addonwebsolutionsai-droid";
const REPO   = process.env["GITHUB_REPO"]   ?? "addon90days";
const BRANCH = process.env["GITHUB_BRANCH"] ?? "main";

let _client: Octokit | null = null;
function getClient(): Octokit {
  if (_client !== null) return _client;
  const token = process.env["GITHUB_TOKEN"];
  if (!token) throw new Error("GITHUB_TOKEN env var not set");
  _client = new Octokit({ auth: token });
  return _client;
}

export interface DirEntry {
  name: string;
  type: "file" | "dir";
  size?: number;
}

/**
 * Read a file from the repo. Returns the decoded text and current SHA
 * (needed for commits). Returns null if the file doesn't exist.
 */
export async function readFile(path: string, branch: string = BRANCH): Promise<{ content: string; sha: string } | null> {
  const client = getClient();
  try {
    const res = await client.repos.getContent({ owner: OWNER, repo: REPO, path, ref: branch });
    if (Array.isArray(res.data) || res.data.type !== "file") return null;
    const content = Buffer.from(res.data.content, "base64").toString("utf8");
    return { content, sha: res.data.sha };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/**
 * List entries in a directory. Returns empty array if the directory
 * doesn't exist (rather than throwing).
 */
export async function listDir(path: string, branch: string = BRANCH): Promise<DirEntry[]> {
  const client = getClient();
  try {
    const res = await client.repos.getContent({ owner: OWNER, repo: REPO, path, ref: branch });
    if (!Array.isArray(res.data)) return [];
    return res.data.map((e) => ({
      name: e.name,
      type: e.type === "dir" ? "dir" : "file",
      ...(e.type === "file" && typeof e.size === "number" ? { size: e.size } : {}),
    }));
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

/**
 * Create or update a file. Idempotent — pulls current SHA if the file
 * already exists. Returns the new commit SHA.
 */
export async function commitFile(
  path: string,
  content: string,
  message: string,
  options: {
    branch?: string;
    authorName?: string;
    authorEmail?: string;
  } = {},
): Promise<{ commit: string; path: string; created: boolean }> {
  const branch = options.branch ?? BRANCH;
  const client = getClient();
  const existing = await readFile(path, branch);

  const res = await client.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    branch,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    ...(existing ? { sha: existing.sha } : {}),
    ...(options.authorName && options.authorEmail
      ? {
          committer: { name: options.authorName, email: options.authorEmail },
          author:    { name: options.authorName, email: options.authorEmail },
        }
      : {}),
  });

  return {
    commit: res.data.commit.sha ?? "",
    path,
    created: !existing,
  };
}

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 404;
}
