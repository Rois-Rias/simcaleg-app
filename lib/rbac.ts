export type Role = "caleg" | "relawan";

const ROLE_KEY = "simcaleg_role";
const NAMA_KEY = "simcaleg_nama";

export function setSession(role: string, nama: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAMA_KEY, nama);
}

export function getRole(): Role {
  if (typeof window === "undefined") return "relawan";
  return localStorage.getItem(ROLE_KEY) === "caleg" ? "caleg" : "relawan";
}

export function getNama(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAMA_KEY) ?? "";
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAMA_KEY);
}

export function canWrite(role: Role): boolean {
  return role === "relawan"; // Caleg hanya read-only
}