import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fpPromise = FingerprintJS.load();

/**
 * Real client-facing IP, fetched from a third-party echo service since the
 * browser has no API for its own public IP. Falls back to "unknown" if the
 * request fails (offline, blocked, etc.) — DB rate-limit triggers skip that
 * value rather than blocking a legitimate submission outright.
 *
 * Shared across voting, Miss registration, and stand reservation — anywhere
 * we need a best-effort per-visitor identity for anti-spam checks.
 */
export const getVisitorIp = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return "unknown";
    const data = await response.json();
    return typeof data.ip === "string" ? data.ip : "unknown";
  } catch {
    return "unknown";
  }
};

/**
 * Stable per-browser identifier from FingerprintJS (canvas/WebGL/audio/fonts
 * signals combined), far harder to spoof by just switching incognito windows
 * than a hand-rolled canvas-only fingerprint.
 */
export const getVisitorFingerprint = async (): Promise<string> => {
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
};
