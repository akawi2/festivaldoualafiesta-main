import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mpjnfyppuaurbffhtocw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wam5meXBwdWF1cmJmZmh0b2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzM4MTQsImV4cCI6MjA3MTQ0OTgxNH0.ZelBmEatb9H7DoH4Ky7WCNoWyzPLop8HzfLxzmaKPxk";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // 1. Reset counters to baseline
  console.log("Resetting candidate counters...");
  await supabase.rpc("admin_reset_miss_votes");

  const { data: candidates } = await supabase
    .from("miss_candidates").select("id, name").eq("is_active", true);
  if (!candidates) throw new Error("No candidates");
  console.log(`Found ${candidates.length} active candidates`);

  // Weighted preference (favorites get more)
  const weights = candidates.map((_, i) => i === 0 ? 25 : i === 1 ? 18 : i === 2 ? 14 : i === 3 ? 10 : 5 + Math.random() * 4);
  const total = weights.reduce((a, b) => a + b, 0);
  const pick = () => {
    let r = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) return candidates[i]; }
    return candidates[candidates.length - 1];
  };

  const VOTERS = 500;
  const DAYS = 3;
  const today = new Date(); today.setUTCHours(12, 0, 0, 0);

  // Distribute 500 voters across 3 days (40% / 35% / 25%)
  const distribution = [0.40, 0.35, 0.25];
  const runId = Math.random().toString(36).slice(2, 8);

  const votes: any[] = [];
  let voterIdx = 0;
  for (let d = 0; d < DAYS; d++) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - (DAYS - 1 - d));
    const voteDay = day.toISOString().slice(0, 10);
    const count = Math.round(VOTERS * distribution[d]);
    for (let k = 0; k < count; k++) {
      const i = voterIdx++;
      const fp = `sim-${runId}-${i}-${Math.random().toString(36).slice(2, 12)}`;
      const ip = `10.${(i >> 16) & 255}.${(i >> 8) & 255}.${i & 255}`;
      const ua = `Mozilla/5.0 SimVoter-${i}`;
      const created = new Date(day);
      created.setUTCHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      const cand = pick();
      votes.push({
        candidate_id: cand.id,
        voter_ip: ip,
        voter_fingerprint: fp,
        session_id: `${fp}-${day.getTime()}`,
        user_agent: ua,
        vote_day: voteDay,
        created_at: created.toISOString(),
        _candName: cand.name,
      });
    }
  }
  console.log(`Total votes to insert: ${votes.length}`);

  // Insert one by one to track success accurately
  const successByCandidate: Record<string, number> = {};
  let inserted = 0, failed = 0;
  for (const v of votes) {
    const { _candName, ...row } = v;
    const { error } = await supabase.from("miss_votes").insert(row);
    if (error) { failed++; }
    else {
      inserted++;
      successByCandidate[v.candidate_id] = (successByCandidate[v.candidate_id] || 0) + 1;
    }
  }
  console.log(`Inserted: ${inserted}, Failed: ${failed}`);

  // Increment counters
  console.log("Incrementing candidate counters...");
  for (const [cid, n] of Object.entries(successByCandidate)) {
    for (let i = 0; i < n; i++) {
      await supabase.rpc("increment_candidate_votes", { candidate_uuid: cid });
    }
  }

  // Final report
  const { data: final } = await supabase
    .from("miss_candidates").select("name, votes_count")
    .eq("is_active", true).order("votes_count", { ascending: false });
  console.log("\n=== CLASSEMENT FINAL ===");
  final?.forEach((c, i) => console.log(`${(i+1).toString().padStart(2)}. ${c.name.padEnd(60)} ${c.votes_count} votes`));

  // Per-day breakdown for this simulation only
  const { data: byDay } = await supabase
    .from("miss_votes").select("vote_day, voter_fingerprint")
    .like("voter_fingerprint", `sim-${runId}-%`);
  const dayCount: Record<string, number> = {};
  byDay?.forEach((v: any) => { dayCount[v.vote_day] = (dayCount[v.vote_day] || 0) + 1; });
  console.log("\n=== VOTES PAR JOUR (cette simulation) ===");
  Object.entries(dayCount).sort().forEach(([d, c]) => console.log(`  ${d}: ${c} votes`));
  console.log(`\nTotal votants uniques cette simulation: ${byDay?.length || 0}`);
}
main().catch(console.error);
