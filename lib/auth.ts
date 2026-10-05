export const SESSION_COOKIE = "jj_session";
export const ADMIN_COOKIE = "jj_admin";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

export async function sessionToken(): Promise<string> {
  return sha256(`${process.env.CHAPTER_PASSWORD ?? ""}|${secret()}|member`);
}

export async function adminToken(): Promise<string> {
  return sha256(`${process.env.ADMIN_PASSWORD ?? ""}|${secret()}|admin`);
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value || !process.env.CHAPTER_PASSWORD) return false;
  return value === (await sessionToken());
}

export async function isValidAdmin(value: string | undefined): Promise<boolean> {
  if (!value || !process.env.ADMIN_PASSWORD) return false;
  return value === (await adminToken());
}
