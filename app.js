const storeKey = "coachdesk-state-v1";
const authStoreKey = "the-fit-geek-auth-v1";
const sessionStoreKey = "the-fit-geek-session-active";
const rememberStoreKey = "the-fit-geek-remember-login";
const rememberCredentialsKey = "the-fit-geek-remember-credentials-v1";
const appVersion = "v3";

// Admin login is verified against this SHA-256 hash, so the real password is
// never written in the (public) source. Change it with the helper below or ask
// to have it regenerated.
const ADMIN_PASSWORD_SHA256 = "c7a8a1884b0128b00e8573f44044881a9b49d65ea98e1a4c71ea808f8b1c09d0";

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// A random, un-typeable value used as the admin profile's stored password, so
// nobody can reach the admin account through the normal email+password path —
// admin login only succeeds via the hashed check above.
function adminPlaceholderSecret() {
  const rnd = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
  return `locked-${rnd()}-${rnd()}`;
}
const asanas = [
  ["Tadasana", "Mountain Pose", "Standing", "Foundation for posture, balance, and breath awareness."],
  ["Urdhva Hastasana", "Upward Salute", "Standing", "Lengthens the front body and improves shoulder mobility."],
  ["Uttanasana", "Standing Forward Fold", "Standing", "Stretches hamstrings and calves; bend knees for comfort."],
  ["Ardha Uttanasana", "Half Standing Forward Fold", "Standing", "Builds spinal length and prepares for sun salutations."],
  ["Adho Mukha Svanasana", "Downward-Facing Dog", "Standing", "Strengthens shoulders and lengthens the posterior chain."],
  ["Utkatasana", "Chair Pose", "Standing", "Builds leg strength and trunk control."],
  ["Virabhadrasana I", "Warrior I", "Standing", "Strengthens legs and opens hip flexors and chest."],
  ["Virabhadrasana II", "Warrior II", "Standing", "Improves stamina, hip stability, and focus."],
  ["Virabhadrasana III", "Warrior III", "Balance", "Challenges balance, glutes, hamstrings, and core control."],
  ["Trikonasana", "Triangle Pose", "Standing", "Builds lateral mobility and hamstring flexibility."],
  ["Parivrtta Trikonasana", "Revolved Triangle Pose", "Twist", "Combines hamstring work with thoracic rotation."],
  ["Parsvakonasana", "Extended Side Angle", "Standing", "Strengthens legs and lengthens the side body."],
  ["Parivrtta Parsvakonasana", "Revolved Side Angle", "Twist", "Advanced rotational lunge for mobility and balance."],
  ["Prasarita Padottanasana", "Wide-Legged Forward Fold", "Standing", "Stretches inner thighs, hamstrings, and back."],
  ["Malasana", "Garland Pose", "Standing", "Deep squat for hips, ankles, and lower-back comfort."],
  ["Vrksasana", "Tree Pose", "Balance", "Simple balance pose for foot, ankle, and hip stability."],
  ["Garudasana", "Eagle Pose", "Balance", "Improves balance while opening upper back and outer hips."],
  ["Natarajasana", "Dancer Pose", "Balance", "Balance and backbend pose for hips, chest, and quads."],
  ["Ardha Chandrasana", "Half Moon Pose", "Balance", "Builds lateral hip strength and full-body coordination."],
  ["Padangusthasana", "Big Toe Pose", "Standing", "Forward fold variation focused on hamstrings."],
  ["Dandasana", "Staff Pose", "Seated", "Seated foundation for posture and hamstring awareness."],
  ["Sukhasana", "Easy Pose", "Seated", "Comfortable cross-legged posture for breathing and meditation."],
  ["Vajrasana", "Thunderbolt Pose", "Seated", "Kneeling seat often used after meals or for breathwork."],
  ["Baddha Konasana", "Bound Angle Pose", "Seated", "Opens inner thighs and hips."],
  ["Upavistha Konasana", "Wide-Angle Seated Forward Bend", "Seated", "Stretches adductors and hamstrings."],
  ["Paschimottanasana", "Seated Forward Bend", "Seated", "Classic posterior-chain stretch; keep spine long."],
  ["Janu Sirsasana", "Head-to-Knee Pose", "Seated", "Single-leg forward fold for hamstrings and hips."],
  ["Marichyasana", "Sage Twist", "Twist", "Seated twist for spinal rotation and hip mobility."],
  ["Ardha Matsyendrasana", "Half Lord of the Fishes", "Twist", "Deep seated twist for thoracic and hip mobility."],
  ["Gomukhasana", "Cow Face Pose", "Seated", "Targets outer hips and shoulders."],
  ["Hanumanasana", "Monkey Pose", "Seated", "Front split; advanced hamstring and hip-flexor pose."],
  ["Balasana", "Child's Pose", "Restorative", "Resting pose for back, hips, and nervous-system downshift."],
  ["Bhujangasana", "Cobra Pose", "Backbend", "Gentle backbend for spinal extension and chest opening."],
  ["Sphinx Pose", "Salamba Bhujangasana", "Backbend", "Low-intensity backbend suitable for many beginners."],
  ["Shalabhasana", "Locust Pose", "Backbend", "Strengthens posterior chain and spinal extensors."],
  ["Dhanurasana", "Bow Pose", "Backbend", "Stronger backbend for chest, quads, and hip flexors."],
  ["Ustrasana", "Camel Pose", "Backbend", "Kneeling backbend for front-body opening."],
  ["Setu Bandha Sarvangasana", "Bridge Pose", "Backbend", "Glute and back strength with gentle chest opening."],
  ["Urdhva Dhanurasana", "Wheel Pose", "Backbend", "Advanced full backbend requiring shoulder and spine readiness."],
  ["Anjaneyasana", "Low Lunge", "Standing", "Hip-flexor stretch and beginner-friendly lunge."],
  ["Phalakasana", "Plank Pose", "Core", "Builds shoulder, trunk, and full-body bracing strength."],
  ["Chaturanga Dandasana", "Four-Limbed Staff Pose", "Core", "Strength transition for arms, shoulders, and core."],
  ["Vasisthasana", "Side Plank", "Core", "Lateral core and shoulder stability pose."],
  ["Navasana", "Boat Pose", "Core", "Core and hip-flexor strength with posture control."],
  ["Makarasana", "Crocodile Pose", "Restorative", "Prone resting posture for back relaxation."],
  ["Apanasana", "Knees-to-Chest Pose", "Supine", "Gentle lower-back release and hip flexion."],
  ["Supta Padangusthasana", "Reclining Hand-to-Big-Toe", "Supine", "Hamstring stretch with back support."],
  ["Supta Baddha Konasana", "Reclining Bound Angle", "Restorative", "Supported hip opener and relaxation pose."],
  ["Jathara Parivartanasana", "Reclined Spinal Twist", "Supine", "Gentle twist for spine and outer hips."],
  ["Pavanamuktasana", "Wind-Relieving Pose", "Supine", "Gentle abdominal and lower-back release."],
  ["Matsyasana", "Fish Pose", "Backbend", "Chest-opening backbend often paired with shoulderstand practice."],
  ["Halasana", "Plow Pose", "Inversion", "Advanced inversion for posterior-chain stretch; use supervision."],
  ["Sarvangasana", "Shoulderstand", "Inversion", "Advanced inversion; avoid with neck issues unless supervised."],
  ["Sirsasana", "Headstand", "Inversion", "Advanced balance inversion requiring skilled instruction."],
  ["Pincha Mayurasana", "Forearm Stand", "Inversion", "Advanced shoulder, core, and balance pose."],
  ["Adho Mukha Vrksasana", "Handstand", "Inversion", "Advanced arm balance and inversion."],
  ["Bakasana", "Crow Pose", "Balance", "Arm balance for wrist, shoulder, and core strength."],
  ["Mayurasana", "Peacock Pose", "Balance", "Advanced arm balance requiring strong wrists and core."],
  ["Eka Pada Rajakapotasana", "Pigeon Pose", "Seated", "Deep hip opener; modify to protect knees."],
  ["Kapotasana", "King Pigeon Pose", "Backbend", "Advanced backbend and hip opener."],
  ["Kurmasana", "Tortoise Pose", "Seated", "Advanced forward fold for hips, back, and hamstrings."],
  ["Tittibhasana", "Firefly Pose", "Balance", "Advanced arm balance with hamstring flexibility."],
  ["Agnistambhasana", "Fire Log Pose", "Seated", "Outer-hip stretch; support knees if needed."],
  ["Simhasana", "Lion Pose", "Seated", "Expressive breath pose for face, jaw, and throat release."],
  ["Shavasana", "Corpse Pose", "Restorative", "Final relaxation pose for recovery and integration."]
].map(([sanskrit, english, category, note]) => ({ sanskrit, english, category, note }));

let activeAsanaCategory = "All";
const exercises = [
  ["Push-Up", "Chest", "Bodyweight", "Classic horizontal press for chest, shoulders, triceps, and core."],
  ["Incline Push-Up", "Chest", "Bodyweight", "Beginner-friendly push-up variation using an elevated surface."],
  ["Bench Press", "Chest", "Barbell", "Compound press for chest strength with shoulder and triceps support."],
  ["Incline Dumbbell Press", "Chest", "Dumbbell", "Targets upper chest while allowing independent arm movement."],
  ["Dumbbell Fly", "Chest", "Dumbbell", "Chest isolation movement focused on controlled stretch and squeeze."],
  ["Cable Crossover", "Chest", "Cable", "Chest isolation using constant cable tension."],
  ["Pull-Up", "Back", "Bodyweight", "Vertical pull for lats, upper back, biceps, and grip."],
  ["Lat Pulldown", "Back", "Machine", "Scalable vertical pull for lat development."],
  ["Barbell Row", "Back", "Barbell", "Horizontal pull for lats, mid-back, and posterior chain control."],
  ["Seated Cable Row", "Back", "Cable", "Controlled row for mid-back strength and posture."],
  ["Single-Arm Dumbbell Row", "Back", "Dumbbell", "Unilateral row for lats and trunk stability."],
  ["Face Pull", "Back", "Cable", "Rear-delt and upper-back exercise for shoulder health."],
  ["Overhead Press", "Shoulders", "Barbell", "Vertical press for shoulders, triceps, and core bracing."],
  ["Dumbbell Shoulder Press", "Shoulders", "Dumbbell", "Shoulder press with independent arm control."],
  ["Lateral Raise", "Shoulders", "Dumbbell", "Isolation exercise for side delts and shoulder width."],
  ["Front Raise", "Shoulders", "Dumbbell", "Anterior shoulder isolation movement."],
  ["Rear Delt Fly", "Shoulders", "Dumbbell", "Rear shoulder and upper-back isolation."],
  ["Barbell Curl", "Biceps", "Barbell", "Biceps strength movement using a fixed bar path."],
  ["Dumbbell Curl", "Biceps", "Dumbbell", "Basic biceps curl with independent arm movement."],
  ["Hammer Curl", "Biceps", "Dumbbell", "Targets brachialis, brachioradialis, and biceps."],
  ["Preacher Curl", "Biceps", "Machine", "Strict curl variation that limits momentum."],
  ["Triceps Pushdown", "Triceps", "Cable", "Cable isolation for triceps lockout strength."],
  ["Overhead Triceps Extension", "Triceps", "Dumbbell", "Long-head triceps exercise with overhead shoulder position."],
  ["Close-Grip Bench Press", "Triceps", "Barbell", "Compound press emphasizing triceps and chest."],
  ["Bench Dip", "Triceps", "Bodyweight", "Bodyweight triceps exercise; keep shoulders comfortable."],
  ["Squat", "Legs", "Barbell", "Compound lower-body lift for quads, glutes, and trunk strength."],
  ["Goblet Squat", "Legs", "Dumbbell", "Beginner-friendly squat pattern with front-loaded weight."],
  ["Leg Press", "Legs", "Machine", "Machine-based lower-body press for quads and glutes."],
  ["Walking Lunge", "Legs", "Dumbbell", "Single-leg exercise for quads, glutes, and balance."],
  ["Leg Extension", "Legs", "Machine", "Quad isolation exercise through knee extension."],
  ["Romanian Deadlift", "Hamstrings", "Barbell", "Hip hinge for hamstrings, glutes, and back control."],
  ["Leg Curl", "Hamstrings", "Machine", "Hamstring isolation through knee flexion."],
  ["Hip Thrust", "Glutes", "Barbell", "Glute-focused hip extension movement."],
  ["Glute Bridge", "Glutes", "Bodyweight", "Simple glute activation and hip extension exercise."],
  ["Cable Kickback", "Glutes", "Cable", "Glute isolation with controlled hip extension."],
  ["Standing Calf Raise", "Calves", "Machine", "Calf exercise emphasizing gastrocnemius strength."],
  ["Seated Calf Raise", "Calves", "Machine", "Calf exercise emphasizing soleus strength."],
  ["Plank", "Core", "Bodyweight", "Anti-extension core hold for trunk stability."],
  ["Side Plank", "Core", "Bodyweight", "Lateral core stability exercise."],
  ["Crunch", "Core", "Bodyweight", "Basic spinal flexion exercise for abdominal control."],
  ["Dead Bug", "Core", "Bodyweight", "Beginner-friendly core coordination and bracing drill."],
  ["Hanging Leg Raise", "Core", "Bodyweight", "Advanced core and hip-flexor exercise."],
  ["Russian Twist", "Core", "Bodyweight", "Rotational core exercise; control the spine and tempo."],
  ["Burpee", "Conditioning", "Bodyweight", "Full-body conditioning movement."],
  ["Mountain Climber", "Conditioning", "Bodyweight", "Core and cardio drill using a plank position."],
  ["Jumping Jack", "Conditioning", "Bodyweight", "Simple full-body warm-up and cardio movement."],
  ["Battle Rope Wave", "Conditioning", "Rope", "Upper-body conditioning and power endurance drill."]
].map(([name, category, equipment, note]) => ({ name, category, equipment, note }));

let activeExerciseCategory = "All";

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const starterState = {
  clients: [
    {
      id: createId(),
      name: "Riya Sharma",
      age: 31,
      goal: "Fat loss",
      weight: 78.4,
      target: 66,
      notes: "Desk job, vegetarian, prefers simple Indian meals. Sleeps 6 hours."
    },
    {
      id: createId(),
      name: "Kabir Mehta",
      age: 27,
      goal: "Muscle gain",
      weight: 68.2,
      target: 75,
      notes: "Trains 5 days/week. Needs high-protein lunch options for office."
    }
  ],
  diets: [],
  progress: []
};

let state = loadState();
let authState = loadAuthState();
console.debug("Loaded state:", state);
console.debug("Loaded authState:", authState);
ensureClientProfilesFromAuth();
if (
  authState.currentUserId &&
  localStorage.getItem(rememberStoreKey) !== "true" &&
  sessionStorage.getItem(sessionStoreKey) !== "true"
) {
  authState.currentUserId = "";
  saveAuthState();
}

const el = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0, 10);

function loadState() {
  const saved = localStorage.getItem(storeKey) || localStorage.getItem("the-fit-geek-state-v1");
  if (!saved) {
    return { clients: [], diets: [], progress: [], dietRequests: [] };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      clients: parsed.clients || [],
      diets: parsed.diets || [],
      progress: parsed.progress || [],
      dietRequests: parsed.dietRequests || []
    };
  } catch {
    return { clients: [], diets: [], progress: [], dietRequests: [] };
  }
}

function saveState() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save app state:", err);
  }
}

function loadAuthState() {
  let saved = localStorage.getItem(authStoreKey);
  if (!saved) {
    const legacyKey = localStorage.getItem("fit-geek-auth-v1") || localStorage.getItem("thefitgeek-auth-v1");
    if (legacyKey) {
      saved = legacyKey;
      localStorage.setItem(authStoreKey, saved);
    }
  }
  if (!saved) {
    return { users: [], currentUserId: "" };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      currentUserId: parsed.currentUserId || ""
    };
  } catch {
    return { users: [], currentUserId: "" };
  }
}

function saveAuthState() {
  try {
    localStorage.setItem(authStoreKey, JSON.stringify(authState));
  } catch (err) {
    console.warn("Failed to save auth state:", err);
  }
}

// ---------------------------------------------------------------------
//  Global cloud database (Supabase) — shared across all devices.
//  Config lives in supabase-config.js. If it is not filled in, the app
//  silently runs in local-only mode exactly as before.
// ---------------------------------------------------------------------
const SUPABASE_URL = String(window.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = String(window.SUPABASE_ANON_KEY || "");
const CLOUD_TABLE = "clients";
const CLOUD_SYNC_INTERVAL_MS = 5000;
let cloudClients = [];

function cloudEnabled() {
  return (
    Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes("PASTE_YOUR") &&
    !SUPABASE_ANON_KEY.includes("PASTE_YOUR")
  );
}

async function cloudRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Push (or update) one signed-up client into the global table.
async function cloudUpsertClient(user) {
  if (!cloudEnabled()) return;
  const row = {
    name: user.name || "",
    email: String(user.email || "").toLowerCase(),
    age: Number(user.age) || null,
    gender: user.gender || "",
    goal: user.goal || "",
    weight: Number(user.weight) || null,
    height: Number(user.height) || null,
    activity: user.activity || "",
    phone: user.phone || "",
    medical: user.medical || ""
  };
  try {
    await cloudRequest(`${CLOUD_TABLE}?on_conflict=email`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row)
    });
    await syncCloudClients();
  } catch (err) {
    console.warn("Cloud upsert failed:", err);
  }
}

// Permanently remove a client from the global table (by email, or by id).
async function cloudDeleteClient(identifier) {
  if (!cloudEnabled() || !identifier) return;
  const isEmail = String(identifier).includes("@");
  const filter = isEmail
    ? `email=eq.${encodeURIComponent(String(identifier).toLowerCase())}`
    : `id=eq.${encodeURIComponent(identifier)}`;
  try {
    await cloudRequest(`${CLOUD_TABLE}?${filter}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Cloud delete failed:", err);
  }
}

// Pull the full global client list and refresh the count + Clients section.
async function syncCloudClients() {
  if (!cloudEnabled()) return;
  try {
    const rows = await cloudRequest(`${CLOUD_TABLE}?select=*&order=created_at.desc`);
    cloudClients = Array.isArray(rows) ? rows : [];
    const newClientsAdded = ensureClientProfilesFromCloud();
    if (currentUser()) {
      renderRegisteredClientsList();
      renderDashboard();
      renderOwnerProfile();
      // Only rebuild the diet/progress client pickers when a new client
      // actually arrived, so we don't reset the admin's current selection.
      if (newClientsAdded) {
        renderClientOptions();
      }
    }
  } catch (err) {
    console.warn("Cloud sync failed:", err);
  }
}

let cloudSyncTimer = null;
function startCloudSync() {
  if (!cloudEnabled()) {
    console.info("Supabase not configured — running in local-only mode. Fill in supabase-config.js to sync globally.");
    return;
  }
  syncCloudClients();
  if (!cloudSyncTimer) {
    cloudSyncTimer = setInterval(syncCloudClients, CLOUD_SYNC_INTERVAL_MS);
  }
}

function getAllRegisteredClients() {
  const usersFromCloud = (cloudClients || []).map((row) => ({
    id: row.id != null ? String(row.id) : String(row.email || ""),
    name: row.name,
    email: String(row.email || "").toLowerCase(),
    phone: row.phone || "",
    role: "client",
    createdAt: String(row.created_at || "").slice(0, 10)
  }));

  const usersFromAuth = (authState.users || [])
    .filter((user) => user.role !== "admin")
    .map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone || "", role: user.role || "client", createdAt: user.createdAt || "" }));

  const normEmail = (value) => String(value || "").trim().toLowerCase();
  const normName = (value) => String(value || "").trim().toLowerCase();

  // Only real registered ACCOUNTS are listed: synced cloud signups and local
  // auth users. Local-only "profile clients" (state.clients) are intentionally
  // NOT added here — they are used solely to backfill details (e.g. phone) for
  // an account that already exists.
  const merged = [];
  [...usersFromCloud, ...usersFromAuth].forEach((item) => {
    const email = normEmail(item.email);
    const name = normName(item.name);
    const existing = merged.find((entry) => {
      const entryEmail = normEmail(entry.email);
      if (email && entryEmail && entryEmail === email) return true;
      if (item.id && entry.id && entry.id === item.id) return true;
      // Same name collapses duplicates unless BOTH sides have distinct real
      // emails (i.e. they are genuinely different accounts).
      if (name && normName(entry.name) === name && !(email && entryEmail)) return true;
      return false;
    });
    if (existing) {
      existing.name = existing.name || item.name;
      existing.email = existing.email || item.email;
      existing.phone = existing.phone || item.phone;
      existing.createdAt = existing.createdAt || item.createdAt;
      existing.role = existing.role || item.role;
    } else {
      merged.push({ ...item });
    }
  });

  // Backfill from the local profile that mirrors each account. We also adopt
  // the profile's id so that diet.clientId / progress.clientId (which resolve
  // via clientById() against state.clients) keep pointing at a real profile.
  // We never add a new entry from state — only enrich an existing account.
  (state.clients || []).forEach((client) => {
    const email = normEmail(client.email);
    const match = merged.find((entry) => {
      if (email && normEmail(entry.email) === email) return true;
      if (!email && client.id && entry.id === client.id) return true;
      return false;
    });
    if (match) {
      if (client.id) match.id = client.id;
      match.phone = match.phone || client.phone || "";
      match.name = match.name || client.name;
      match.createdAt = match.createdAt || client.createdAt;
    }
  });

  return merged.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function ensureClientProfilesFromAuth() {
  let changed = false;
  (authState.users || [])
    .filter((user) => user.role !== "admin" && user.email)
    .forEach((user) => {
      const existingClient = state.clients.find((client) => client.email?.toLowerCase() === user.email?.toLowerCase());
      if (!existingClient) {
        state.clients.push({
          id: user.id || createId(),
          name: user.name || user.email.split("@")[0],
          age: Number(user.age) || 0,
          goal: user.goal || "General wellness",
          weight: Number(user.weight) || 0,
          target: Number(user.weight) || 0,
          notes: `Signup profile · ${user.gender || "Unspecified"} · ${user.height ? `${user.height} cm` : "Height unknown"} · ${user.activity || "Activity unknown"}.`,
          createdAt: user.createdAt || today,
          email: user.email,
          phone: user.phone || ""
        });
        changed = true;
      }
    });

  if (changed) {
    console.debug("Saved missing client profiles from auth to state.clients", state.clients);
    saveState();
  }
}

// Create a local client profile for anyone who signed up on another device
// (pulled from the global Supabase table) so the admin can build/edit their
// diet plan and progress check-ins. Returns true if anything new was added.
function ensureClientProfilesFromCloud() {
  let changed = false;
  (cloudClients || []).forEach((row) => {
    const email = String(row.email || "").toLowerCase();
    if (!email) return;
    const cloudId = row.id != null ? String(row.id) : "";
    const existing = state.clients.find(
      (client) => client.email?.toLowerCase() === email || (cloudId && client.id === cloudId)
    );
    if (!existing) {
      state.clients.push({
        id: cloudId || createId(),
        name: row.name || email.split("@")[0],
        age: Number(row.age) || 0,
        goal: row.goal || "General wellness",
        weight: Number(row.weight) || 0,
        target: Number(row.weight) || 0,
        notes: `Signup profile · ${row.gender || "Unspecified"} · ${row.height ? `${row.height} cm` : "Height unknown"} · ${row.activity || "Activity unknown"}.`,
        createdAt: String(row.created_at || "").slice(0, 10) || today,
        email,
        phone: row.phone || ""
      });
      changed = true;
    }
  });

  if (changed) {
    saveState();
  }
  return changed;
}

function saveRememberedCredentials(email, password) {
  try {
    const payload = { email: String(email || ""), password: String(password || "") };
    localStorage.setItem(rememberCredentialsKey, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

function loadRememberedCredentials() {
  try {
    const raw = localStorage.getItem(rememberCredentialsKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email) {
      el("loginEmail").value = parsed.email;
      el("loginPassword").value = parsed.password || "";
      el("rememberMe").checked = true;
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function removeRememberedCredentials() {
  localStorage.removeItem(rememberCredentialsKey);
}

function currentUser() {
  return authState.users.find((user) => user.id === authState.currentUserId);
}

function currentUserRole() {
  return currentUser()?.role || "client";
}

function isClientMode() {
  return currentUserRole() === "client";
}

function ensureAdminAccount() {
  let admin = authState.users.find((user) => user.username === "Admin" || user.email === "admin@thefitgeek.local");
  if (!admin) {
    admin = {
      id: createId(),
      username: "Admin",
      name: "Admin",
      age: "",
      gender: "",
      goal: "Owner dashboard",
      weight: "",
      height: "",
      activity: "",
      phone: "",
      medical: "",
      email: "admin@thefitgeek.local",
      password: adminPlaceholderSecret(),
      provider: "Admin",
      role: "admin",
      createdAt: today
    };
    authState.users.push(admin);
  } else {
    admin.username = "Admin";
    // Migrate away from the old hard-coded password and never store a usable one.
    if (!admin.password || admin.password === "123456") {
      admin.password = adminPlaceholderSecret();
    }
    admin.role = "admin";
    admin.provider = "Admin";
  }
  return admin;
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function clientById(id) {
  return state.clients.find((client) => client.id === id);
}

function latestProgress(clientId) {
  return state.progress
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

function clientForCurrentUser() {
  const user = currentUser();
  if (!user) return null;
  return state.clients.find((client) => client.email === user.email || client.name === user.name);
}

function setSection(sectionId) {
  if (isClientMode() && ["clients", "progress"].includes(sectionId)) {
    sectionId = "dashboard";
  }

  document.querySelectorAll(".section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });
}

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function renderClientOptions() {
  // Use the same source as the Clients tab so the diet/progress pickers only
  // ever list clients that are actually visible under "Registered clients".
  const options = getAllRegisteredClients()
    .map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(client.name || client.email || "Client")}</option>`)
    .join("");
  el("dietClient").innerHTML = options || `<option value="">Add a client first</option>`;
  el("progressClient").innerHTML = options || `<option value="">Add a client first</option>`;
}

function renderClients() {
  const query = el("clientSearch").value.trim().toLowerCase();
  const clients = state.clients.filter((client) => {
    return [client.name, client.goal, client.notes].join(" ").toLowerCase().includes(query);
  });

  el("clientList").innerHTML =
    clients
      .map((client) => {
        const latest = latestProgress(client.id);
        const currentWeight = latest?.weight ?? client.weight;
        return `
          <article class="client-card">
            <div class="avatar">${escapeHtml(initials(client.name))}</div>
            <div>
              <p class="card-title">${escapeHtml(client.name)}</p>
              <p class="card-meta">${client.age} yrs · ${escapeHtml(client.goal)} · ${currentWeight} kg now · target ${client.target} kg</p>
              <p class="card-meta">${escapeHtml(client.notes || "No lifestyle notes yet.")}</p>
            </div>
            <div class="card-actions">
              <button class="icon-button" type="button" title="Edit client" data-edit-client="${escapeHtml(client.id)}">Edit</button>
              <button class="icon-button" type="button" title="Delete client" data-delete-client="${escapeHtml(client.id)}">Del</button>
            </div>
          </article>
        `;
      })
      .join("") || emptyState("No clients found. Add your first client profile.");
}

function renderDiets() {
  const activeClient = clientForCurrentUser();
  const visibleDiets = isClientMode() && activeClient
    ? state.diets.filter((diet) => diet.clientId === activeClient.id)
    : state.diets;
  const requests = state.dietRequests || [];

  el("dietListTitle").textContent = isClientMode() ? "My diet chart" : "Saved charts";
  el("adminDietRequests").innerHTML =
    requests.length
      ? requests
          .map((request) => {
            const client = clientById(request.clientId);
            return `
              <article class="attention-row">
                <div>
                  <p class="card-title">${escapeHtml(client?.name || request.clientName || "Client")}</p>
                  <p class="card-meta">${escapeHtml(request.note)} · Sent ${escapeHtml(request.createdAt)}</p>
                </div>
                <button class="danger-button" type="button" data-delete-diet-request="${escapeHtml(request.id)}">Clear</button>
              </article>
            `;
          })
          .join("")
      : emptyState("No client meal plan requests yet.");

  if (isClientMode()) {
    el("dietList").innerHTML =
      visibleDiets.length
        ? `
          <div class="diet-table-wrap">
            <table class="diet-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Meals</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                ${visibleDiets
                  .map(
                    (diet) => `
                      <tr>
                        <td><strong>${escapeHtml(diet.type)}</strong></td>
                        <td>${diet.calories} kcal</td>
                        <td>${diet.protein}g</td>
                        <td>${diet.carbs}g</td>
                        <td>${diet.fat}g</td>
                        <td>${escapeHtml(diet.meals).replaceAll("\n", "<br>")}</td>
                        <td>${escapeHtml(diet.createdAt)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : emptyState("No meal plan has been assigned by Admin yet. Send a request from the form.");
    return;
  }

  el("dietList").innerHTML =
    (visibleDiets
      .map((diet) => {
        const client = clientById(diet.clientId);
        return `
          <article class="diet-card">
            <p class="card-title">${escapeHtml(client?.name || "Deleted client")} · ${escapeHtml(diet.type)}</p>
            <p class="card-meta">${diet.calories} kcal · P ${diet.protein}g · C ${diet.carbs}g · F ${diet.fat}g</p>
            <pre>${escapeHtml(diet.meals)}</pre>
            <div class="tag-row">
              <span class="tag">Saved ${escapeHtml(diet.createdAt)}</span>
              <button class="danger-button" type="button" data-delete-diet="${escapeHtml(diet.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("") || emptyState("Diet charts will appear here after you save a plan."));
}

function renderProgress() {
  const entries = [...state.progress].sort((a, b) => b.date.localeCompare(a.date));
  el("progressList").innerHTML =
    entries
      .map((entry) => {
        const client = clientById(entry.clientId);
        return `
          <article class="progress-card">
            <p class="card-title">${escapeHtml(client?.name || "Deleted client")} · ${escapeHtml(entry.date)}</p>
            <p class="card-meta">${entry.weight} kg · Waist ${entry.waist || "-"} cm · ${entry.adherence}% adherence</p>
            <p class="card-meta">${escapeHtml(entry.notes || "No notes added.")}</p>
            <div class="tag-row">
              <button class="danger-button" type="button" data-delete-progress="${escapeHtml(entry.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("") || emptyState("Record weekly check-ins to build a progress timeline.");
}

function renderDashboard() {
  const user = currentUser();
  const activeClient = clientForCurrentUser();
  const clientDiets = activeClient ? state.diets.filter((diet) => diet.clientId === activeClient.id) : [];
  const clientLatestProgress = activeClient ? latestProgress(activeClient.id) : null;
  const registeredClients = getAllRegisteredClients();

  el("activeClients").textContent = registeredClients.length;
  el("dietChartCount").textContent = isClientMode() ? clientDiets.length : state.diets.length;
  const recent = state.progress.filter((entry) => {
    const ageMs = new Date(today) - new Date(entry.date);
    return ageMs <= 7 * 24 * 60 * 60 * 1000;
  });
  const avgChange =
    state.clients.length === 0
      ? 0
      : state.clients.reduce((sum, client) => {
          const latest = latestProgress(client.id);
          return sum + (latest ? Number(latest.weight) - Number(client.weight) : 0);
        }, 0) / state.clients.length;
  el("avgChange").textContent = `${avgChange.toFixed(1)} kg`;
  el("followupsDue").textContent = Math.max(0, registeredClients.length - recent.length);

  if (isClientMode()) {
    const currentWeight = clientLatestProgress?.weight ?? activeClient?.weight ?? user?.weight ?? "-";
    const fields = [
      ["Goal", user?.goal || activeClient?.goal || "-"],
      ["Current weight", currentWeight === "-" ? "-" : `${currentWeight} kg`],
      ["Height", user?.height ? `${user.height} cm` : "-"],
      ["Activity", user?.activity || "-"],
      ["Latest check-in", clientLatestProgress?.date || "Not recorded"],
      ["Medical notes", user?.medical || "None added"]
    ];

    el("clientDashboardName").textContent = user?.name ? `${user.name}'s overview` : "My overview";
    el("clientProfileCards").innerHTML = fields
      .map(
        ([label, value]) => `
          <div class="owner-field">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `
      )
      .join("");
  }

  const averages = state.diets.reduce(
    (sum, diet) => {
      sum.calories += Number(diet.calories);
      sum.protein += Number(diet.protein);
      sum.carbs += Number(diet.carbs);
      sum.fat += Number(diet.fat);
      return sum;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const count = state.diets.length || 1;
  const macroData = [
    ["Protein", Math.round(averages.protein / count), "var(--green)"],
    ["Carbs", Math.round(averages.carbs / count), "var(--coral)"],
    ["Fat", Math.round(averages.fat / count), "var(--blue)"]
  ];
  const maxMacro = Math.max(1, ...macroData.map((item) => item[1]));
  el("macroCalories").textContent = Math.round(averages.calories / count);
  el("macroBars").innerHTML = macroData
    .map(
      ([label, value, color]) => `
        <div class="macro-bar">
          <span><b>${label}</b><b>${value}g</b></span>
          <div class="bar-track"><div class="bar-fill" style="width:${(value / maxMacro) * 100}%; background:${color}"></div></div>
        </div>
      `
    )
    .join("");
}

function renderOwnerProfile() {
  const user = currentUser();
  if (!user) {
    el("ownerProfile").innerHTML = emptyState("No signup profile is active.");
    return;
  }

  // If admin, show a compact summary only. The full client list (with the
  // Delete action) lives in the Clients tab — see renderRegisteredClientsList().
  if (currentUserRole() === "admin") {
    const registered = getAllRegisteredClients();
    el("ownerProfile").innerHTML = `
      <div class="owner-field"><span>Admin</span><strong>${escapeHtml(user.name || user.username || "Admin")}</strong></div>
      <div class="owner-field"><span>Registered accounts</span><strong>${registered.length}</strong></div>
    `;
    return;
  }

  const fields = [
    ["Name", user.name],
    ["Email", user.email]
  ];

  el("ownerProfile").innerHTML = fields
    .map(
      ([label, value]) => `
        <div class="owner-field">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value || "-")}</strong>
        </div>
      `
    )
    .join("");
}

function renderYoga() {
  const search = el("asanaSearch")?.value.trim().toLowerCase() || "";
  const categories = ["All", ...new Set(asanas.map((asana) => asana.category))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });

  el("asanaFilters").innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip ${category === activeAsanaCategory ? "active" : ""}" type="button" data-asana-category="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");

  const filtered = asanas.filter((asana) => {
    const categoryMatch = activeAsanaCategory === "All" || asana.category === activeAsanaCategory;
    const searchMatch = [asana.sanskrit, asana.english, asana.category, asana.note]
      .join(" ")
      .toLowerCase()
      .includes(search);
    return categoryMatch && searchMatch;
  });

  el("asanaGrid").innerHTML =
    filtered
      .map(
        (asana) => `
          <button class="asana-card" type="button" data-video-asana="${escapeHtml(asana.sanskrit)}">
            <div>
              <h3>${escapeHtml(asana.english)}</h3>
              <p class="asana-name">${escapeHtml(asana.sanskrit)}</p>
            </div>
            <p>${escapeHtml(asana.note)}</p>
            <div class="asana-meta">
              <span class="tag">${escapeHtml(asana.category)}</span>
              <span class="tag">Watch video</span>
            </div>
          </button>
        `
      )
      .join("") || emptyState("No asanas match that search.");
}

function asanaVideoSlug(asana) {
  return asana.sanskrit
    .toLowerCase()
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function textSlug(value) {
  return value
    .toLowerCase()
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function openAsanaVideo(sanskritName) {
  const asana = asanas.find((item) => item.sanskrit === sanskritName);
  if (!asana) return;

  openLocalVideo({
    title: asana.english,
    subtitle: `${asana.sanskrit} · ${asana.category}`,
    eyebrow: "Yoga tutorial",
    videoPath: `videos/${asanaVideoSlug(asana)}.mp4`
  });
}

function openExerciseVideo(exerciseName) {
  const exercise = exercises.find((item) => item.name === exerciseName);
  if (!exercise) return;

  openLocalVideo({
    title: exercise.name,
    subtitle: `${exercise.category} · ${exercise.equipment}`,
    eyebrow: "Muscle exercise tutorial",
    videoPath: `exercise-videos/${textSlug(exercise.name)}.mp4`
  });
}

function openLocalVideo({ title, subtitle, eyebrow, videoPath }) {
  const video = el("asanaVideo");

  el("videoEyebrow").textContent = eyebrow;
  el("videoTitle").textContent = title;
  el("videoSubtitle").textContent = subtitle;
  el("videoFileName").textContent = `Expected file: ${videoPath}`;
  el("videoMissing").classList.remove("active");
  video.src = videoPath;
  video.load();
  el("videoModal").classList.add("active");
  el("videoModal").setAttribute("aria-hidden", "false");
}

function renderExercises() {
  const search = el("exerciseSearch")?.value.trim().toLowerCase() || "";
  const categories = ["All", ...new Set(exercises.map((exercise) => exercise.category))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });

  el("exerciseFilters").innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip ${category === activeExerciseCategory ? "active" : ""}" type="button" data-exercise-category="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");

  const filtered = exercises.filter((exercise) => {
    const categoryMatch = activeExerciseCategory === "All" || exercise.category === activeExerciseCategory;
    const searchMatch = [exercise.name, exercise.category, exercise.equipment, exercise.note]
      .join(" ")
      .toLowerCase()
      .includes(search);
    return categoryMatch && searchMatch;
  });

  el("exerciseGrid").innerHTML =
    filtered
      .map(
        (exercise) => `
          <button class="asana-card" type="button" data-video-exercise="${escapeHtml(exercise.name)}">
            <div>
              <h3>${escapeHtml(exercise.name)}</h3>
              <p class="asana-name">${escapeHtml(exercise.equipment)}</p>
            </div>
            <p>${escapeHtml(exercise.note)}</p>
            <div class="asana-meta">
              <span class="tag">${escapeHtml(exercise.category)}</span>
              <span class="tag">Watch video</span>
            </div>
          </button>
        `
      )
      .join("") || emptyState("No exercises match that search.");
}

function closeAsanaVideo() {
  const video = el("asanaVideo");
  el("videoModal").classList.remove("active");
  el("videoModal").setAttribute("aria-hidden", "true");
  video.pause();
  video.removeAttribute("src");
  video.load();
  el("videoMissing").classList.remove("active");
}

function renderAll() {
  renderClientOptions();
  renderRegisteredClientsList();
  renderDiets();
  renderProgress();
  renderDashboard();
  renderOwnerProfile();
  renderYoga();
  renderExercises();
  updateDebugBanner();
}

function updateDebugBanner() {
  const banner = el("debugBanner");
  if (!banner) return;
  banner.textContent = `App ${appVersion}`;
}

function setAuthView(view) {
  document.querySelectorAll(".auth-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.authView === view);
  });
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === `${view}Form`);
  });
}

function setAuthMessage(targetId, message, isError = false) {
  const target = el(targetId);
  target.textContent = message;
  target.style.color = isError ? "#9b2d1d" : "var(--green-dark)";
}

function showAppForCurrentUser() {
  const isLoggedIn = Boolean(currentUser());
  el("authShell").classList.toggle("hidden", isLoggedIn);
  el("appShell").classList.toggle("locked", !isLoggedIn);
  el("appShell").classList.toggle("client-mode", isLoggedIn && isClientMode());
  if (isLoggedIn) {
    el("accountName").textContent = currentUser()?.name || currentUser()?.username || "Account";
    el("modePill").textContent = isClientMode() ? "Client Mode" : "Admin Portal";
  }
  if (isLoggedIn) {
    if (!isClientMode()) {
      ensureClientProfilesFromAuth();
    }
    if (isClientMode() && (document.querySelector(".section.active")?.id === "clients" || document.querySelector(".section.active")?.id === "progress")) {
      setSection("dashboard");
    }
    renderAll();
  }
}

function addSignupClient(user) {
  const alreadyClient = state.clients.some((client) => client.email === user.email);
  if (alreadyClient) return;

  state.clients.push({
    id: createId(),
    name: user.name,
    age: Number(user.age),
    goal: user.goal,
    weight: Number(user.weight),
    target: Number(user.weight),
    notes: `Signup profile · ${user.gender} · ${user.height} cm · ${user.activity}. Medical: ${user.medical || "None added"}`,
    createdAt: today,
    email: user.email,
    phone: user.phone || ""
  });
  saveState();
  console.debug("Saved client via signup, state.clients:", state.clients);
  console.debug("Current authState.users:", authState.users);
}

function resetClientForm() {
  el("clientForm").reset();
  el("clientId").value = "";
}

function renderRegisteredClientsList() {
  const sorted = getAllRegisteredClients();

  el("registeredClientsList").innerHTML =
    sorted.length
      ? sorted
          .map(
            (client) => {
              const deleteKey = client.email || client.id;
              const label = client.name || client.email || "client";
              const phone = client.phone || "";
              const phoneLine = phone
                ? `<p class="card-meta">📞 <a href="tel:${escapeHtml(phone.replace(/[^+\d]/g, ""))}">${escapeHtml(phone)}</a></p>`
                : `<p class="card-meta">📞 No phone on file</p>`;
              return `
              <article class="client-card">
                <div class="avatar">${escapeHtml((client.name || client.email || "?").charAt(0).toUpperCase())}</div>
                <div>
                  <p class="card-title">${escapeHtml(client.name || client.email || "-")}</p>
                  <p class="card-meta">${escapeHtml(client.email || "-")} · ${escapeHtml(client.createdAt || "-")}</p>
                  ${phoneLine}
                </div>
                <div class="card-actions">
                  <button class="icon-button" type="button" style="width:auto;padding:0 14px;color:#9b2d1d;border-color:#e3b7af" title="Permanently delete this client" data-delete-registered-account="${escapeHtml(deleteKey)}" data-client-name="${escapeHtml(label)}">Delete</button>
                </div>
              </article>
            `;
            }
          )
          .join("")
      : emptyState("No registered clients yet.");
}

function seedSampleData() {
  const clients = starterState.clients.map((client) => ({ ...client, id: createId() }));
  state = {
    clients,
    diets: [
      {
        id: createId(),
        clientId: clients[0].id,
        calories: 1650,
        type: "Vegetarian",
        protein: 120,
        carbs: 175,
        fat: 48,
        meals: "Breakfast: Paneer bhurji, 2 rotis, salad\nLunch: Dal, rice, curd, vegetables\nSnack: Whey or Greek yogurt with fruit\nDinner: Tofu stir fry with millet roti",
        createdAt: today
      },
      {
        id: createId(),
        clientId: clients[1].id,
        calories: 2850,
        type: "High protein",
        protein: 155,
        carbs: 360,
        fat: 75,
        meals: "Breakfast: Oats, whey, banana, peanut butter\nLunch: Chicken rice bowl with vegetables\nSnack: Eggs and fruit\nDinner: Fish curry, rice, salad",
        createdAt: today
      }
    ],
    progress: [
      {
        id: createId(),
        clientId: clients[0].id,
        date: today,
        weight: 77.6,
        waist: 88,
        adherence: 86,
        notes: "Good consistency. Add 20 minute walks after dinner."
      },
      {
        id: createId(),
        clientId: clients[1].id,
        date: today,
        weight: 69.1,
        waist: 79,
        adherence: 78,
        notes: "Strength rising. Increase lunch carbs on training days."
      }
    ]
  };
  saveState();
  renderAll();
}

document.querySelectorAll("[data-section], [data-section-target]").forEach((button) => {
  button.addEventListener("click", () => setSection(button.dataset.section || button.dataset.sectionTarget));
});

document.querySelectorAll("[data-auth-view]").forEach((button) => {
  button.addEventListener("click", () => setAuthView(button.dataset.authView));
});

el("seedDataBtn")?.addEventListener("click", seedSampleData);
el("logoutBtn").addEventListener("click", () => {
  authState.currentUserId = "";
  sessionStorage.removeItem(sessionStoreKey);
  localStorage.removeItem(rememberStoreKey);
  saveAuthState();
  showAppForCurrentUser();
});
el("clearClientBtn")?.addEventListener("click", resetClientForm);
el("asanaSearch").addEventListener("input", renderYoga);
el("exerciseSearch").addEventListener("input", renderExercises);
el("closeVideoBtn").addEventListener("click", closeAsanaVideo);
el("asanaVideo").addEventListener("error", () => {
  el("videoMissing").classList.add("active");
});
el("videoModal").addEventListener("click", (event) => {
  if (event.target.id === "videoModal") {
    closeAsanaVideo();
  }
});
el("progressDate").value = today;

el("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginId = el("loginEmail").value.trim();
  const email = loginId.toLowerCase();
  const password = el("loginPassword").value;
  const isAdminId = email === "admin" || email === "admin@thefitgeek.local";
  const adminLogin = isAdminId && (await sha256Hex(password)) === ADMIN_PASSWORD_SHA256;
  const user = adminLogin
    ? ensureAdminAccount()
    : authState.users.find((item) => item.email === email && item.password === password);

  if (!user) {
    const emailExists = authState.users.some((item) => item.email === email);
    if (emailExists) {
      setAuthMessage("loginMessage", "Password does not match. Please try again.", true);
    } else {
      setAuthMessage("loginMessage", "Invalid user ID/email or password. Create an account first if you are new.", true);
    }
    return;
  }

  authState.currentUserId = user.id;
  sessionStorage.setItem(sessionStoreKey, "true");
  if (el("rememberMe").checked) {
    localStorage.setItem(rememberStoreKey, "true");
    saveRememberedCredentials(email, password);
  } else {
    localStorage.removeItem(rememberStoreKey);
    removeRememberedCredentials();
  }
  saveAuthState();
  setAuthMessage("loginMessage", "");
  showAppForCurrentUser();
  syncCloudClients();
});

function exportAppData() {
  const payload = {
    auth: authState,
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fit-geek-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importAppData(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.auth) {
        const existing = loadAuthState();
        existing.users = existing.users || [];
        (imported.auth.users || []).forEach((user) => {
          if (!existing.users.some((u) => u.email === user.email)) {
            existing.users.push(user);
          }
        });
        authState = existing;
        saveAuthState();
      }
      if (imported.state) {
        const existingState = loadState();
        existingState.clients = existingState.clients || [];
        existingState.diets = existingState.diets || [];
        existingState.progress = existingState.progress || [];
        existingState.dietRequests = existingState.dietRequests || [];

        (imported.state.clients || []).forEach((client) => {
          if (!existingState.clients.some((c) => c.email && c.email === client.email)) {
            existingState.clients.push(client);
          }
        });
        (imported.state.diets || []).forEach((diet) => {
          if (!existingState.diets.some((d) => d.id === diet.id)) {
            existingState.diets.push(diet);
          }
        });
        (imported.state.progress || []).forEach((entry) => {
          if (!existingState.progress.some((p) => p.id === entry.id)) {
            existingState.progress.push(entry);
          }
        });
        existingState.dietRequests = existingState.dietRequests || [];
        (imported.state.dietRequests || []).forEach((request) => {
          if (!existingState.dietRequests.some((r) => r.id === request.id)) {
            existingState.dietRequests.push(request);
          }
        });
        state = existingState;
        saveState();
      }
      showAppForCurrentUser();
      setAuthMessage("loginMessage", "Data imported successfully. Please login again.");
    } catch (error) {
      setAuthMessage("loginMessage", "Import failed. Please use a valid JSON export.", true);
      console.error("Import error", error);
    }
  };
  reader.readAsText(file);
}

el("signupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = el("signupEmail").value.trim().toLowerCase();
  // Keep digits only, then require exactly 10 (no country code / spaces / symbols).
  const phone = el("signupPhone").value.replace(/\D/g, "");

  if (!phone) {
    setAuthMessage("signupMessage", "Phone number is required so your coach can reach you.", true);
    try {
      el("signupPhone").focus();
    } catch {}
    return;
  }

  if (phone.length !== 10) {
    setAuthMessage("signupMessage", "Please enter a valid phone number — exactly 10 digits.", true);
    try {
      el("signupPhone").focus();
    } catch {}
    return;
  }

  const existing = authState.users.some((user) => user.email === email);

  if (existing) {
    setAuthMessage("signupMessage", "This email is already registered. Please login to continue.", true);
    // Switch to login view and prefill the email so the user can login
    setAuthView("login");
    el("loginEmail").value = email;
    el("loginPassword").value = "";
    setAuthMessage("loginMessage", "Email already registered — please login.", true);
    try {
      el("loginPassword").focus();
    } catch {}
    return;
  }

  const user = {
    id: createId(),
    name: el("signupName").value.trim(),
    age: Number(el("signupAge").value),
    gender: el("signupGender").value,
    goal: el("signupGoal").value,
    weight: Number(el("signupWeight").value),
    height: Number(el("signupHeight").value),
    activity: el("signupActivity").value,
    phone,
    medical: el("signupMedical").value.trim(),
    email,
    password: el("signupPassword").value,
    provider: "Email",
    role: "client",
    createdAt: today
  };

  authState.users.push(user);
  authState.currentUserId = user.id;
  // Log in for THIS session only. Never silently persist the password or
  // auto-remember on signup — credentials are saved only when the user later
  // ticks "Remember me" at login, and only on that device.
  sessionStorage.setItem(sessionStoreKey, "true");
  localStorage.removeItem(rememberStoreKey);
  removeRememberedCredentials();
  saveAuthState();
  addSignupClient(user);
  cloudUpsertClient(user);
  setAuthMessage("signupMessage", "");
  showAppForCurrentUser();
});

el("dietForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.clients.length) return;
  state.diets.unshift({
    id: createId(),
    clientId: el("dietClient").value,
    calories: Number(el("dietCalories").value),
    type: el("dietType").value,
    protein: Number(el("dietProtein").value),
    carbs: Number(el("dietCarbs").value),
    fat: Number(el("dietFat").value),
    meals: el("dietMeals").value.trim(),
    createdAt: today
  });
  el("dietForm").reset();
  saveState();
  renderAll();
});

el("dietRequestForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const activeClient = clientForCurrentUser();
  const user = currentUser();
  const note = el("dietRequestNote").value.trim();

  if (!activeClient || !note) {
    setAuthMessage("dietRequestMessage", "Please add a request note before sending.", true);
    return;
  }

  state.dietRequests.unshift({
    id: createId(),
    clientId: activeClient.id,
    clientName: user?.name || activeClient.name,
    note,
    createdAt: today
  });
  saveState();
  el("dietRequestForm").reset();
  renderAll();
  setAuthMessage("dietRequestMessage", "Request sent to Admin.");
});

el("progressForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.clients.length) return;
  state.progress.unshift({
    id: createId(),
    clientId: el("progressClient").value,
    date: el("progressDate").value,
    weight: Number(el("progressWeight").value),
    waist: el("progressWaist").value ? Number(el("progressWaist").value) : "",
    adherence: Number(el("progressAdherence").value),
    notes: el("progressNotes").value.trim()
  });
  el("progressForm").reset();
  el("progressDate").value = today;
  el("progressAdherence").value = 80;
  saveState();
  renderAll();
});

document.addEventListener("click", (event) => {
  const editId = event.target.dataset.editClient;
  const deleteClientId = event.target.dataset.deleteClient;
  const deleteDietId = event.target.dataset.deleteDiet;
  const deleteDietRequestId = event.target.dataset.deleteDietRequest;
  const deleteProgressId = event.target.dataset.deleteProgress;
  const asanaCategory = event.target.dataset.asanaCategory;
  const exerciseCategory = event.target.dataset.exerciseCategory;
  const videoAsana = event.target.closest("[data-video-asana]")?.dataset.videoAsana;
  const videoExercise = event.target.closest("[data-video-exercise]")?.dataset.videoExercise;

  if (editId) {
    const client = clientById(editId);
    if (!client) return;
    el("clientId").value = client.id;
    el("clientName").value = client.name;
    el("clientAge").value = client.age;
    el("clientGoal").value = client.goal;
    el("clientWeight").value = client.weight;
    el("clientTarget").value = client.target;
    el("clientNotes").value = client.notes;
    setSection("clients");
  }

  if (deleteClientId) {
    state.clients = state.clients.filter((client) => client.id !== deleteClientId);
    state.diets = state.diets.filter((diet) => diet.clientId !== deleteClientId);
    state.progress = state.progress.filter((entry) => entry.clientId !== deleteClientId);
    saveState();
    renderAll();
  }

  if (deleteDietId) {
    state.diets = state.diets.filter((diet) => diet.id !== deleteDietId);
    saveState();
    renderAll();
  }

  if (deleteDietRequestId) {
    state.dietRequests = (state.dietRequests || []).filter((request) => request.id !== deleteDietRequestId);
    saveState();
    renderAll();
  }

  if (deleteProgressId) {
    state.progress = state.progress.filter((entry) => entry.id !== deleteProgressId);
    saveState();
    renderAll();
  }

  if (event.target.dataset.deleteRegisteredAccount) {
    const identifier = event.target.dataset.deleteRegisteredAccount;
    const label = event.target.dataset.clientName || identifier;
    const ok = window.confirm(
      `Permanently delete "${label}" from The Fit Geek?\n\nThis removes the client from the global database for everyone and cannot be undone.`
    );
    if (!ok) return;

    authState.users = authState.users.filter((user) => user.email !== identifier && user.id !== identifier);
    state.clients = state.clients.filter((client) => client.email !== identifier && client.id !== identifier);
    saveAuthState();
    saveState();
    renderAll();
    // Remove from the global database too, then re-sync so it stays gone.
    cloudDeleteClient(identifier).then(() => syncCloudClients());
    return;
  }

  if (asanaCategory) {
    activeAsanaCategory = asanaCategory;
    renderYoga();
  }

  if (exerciseCategory) {
    activeExerciseCategory = exerciseCategory;
    renderExercises();
  }

  if (videoAsana) {
    openAsanaVideo(videoAsana);
  }

  if (videoExercise) {
    openExerciseVideo(videoExercise);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && el("videoModal").classList.contains("active")) {
    closeAsanaVideo();
  }
});

// Prefill login form if credentials were remembered
loadRememberedCredentials();

console.debug("Fit Geek app loaded", {
  authUsers: authState.users.length,
  stateClients: state.clients.length,
  currentUserId: authState.currentUserId
});

showAppForCurrentUser();
startCloudSync();
