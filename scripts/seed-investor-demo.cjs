
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DEMO_ENV = (process.env.DEMO_ENV || "dev").toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "BloodLine@2026!";
const FORCE_DEMO_SEED = process.env.FORCE_DEMO_SEED === "true";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ADMIN_USERS = [
  {
    email: "investor.admin@bloodline.app",
    role: "admin",
    full_name: "Investor Admin",
  },
];

const HOSPITAL_USERS = [
  {
    email: "apollo.hyderabad@bloodline.app",
    role: "hospital",
    name: "Apollo Care Hyderabad",
    city: "Hyderabad",
    address: "Banjara Hills, Hyderabad",
    contact_phone: "+91-40-6000-1001",
  },
  {
    email: "fortis.bengaluru@bloodline.app",
    role: "hospital",
    name: "Fortis Bengaluru Central",
    city: "Bengaluru",
    address: "MG Road, Bengaluru",
    contact_phone: "+91-80-6000-2002",
  },
  {
    email: "medanta.delhi@bloodline.app",
    role: "hospital",
    name: "Medanta Delhi North",
    city: "Delhi",
    address: "Rohini Sector 12, Delhi",
    contact_phone: "+91-11-6000-3003",
  },
  {
    email: "global.mumbai@bloodline.app",
    role: "hospital",
    name: "Global Lifeline Mumbai",
    city: "Mumbai",
    address: "Andheri East, Mumbai",
    contact_phone: "+91-22-6000-4004",
  },
];

const DONOR_USERS = [
  { email: "aisha.khan@bloodline.app", role: "donor", full_name: "Aisha Khan", blood_group: "O+", city: "Hyderabad", phone: "+91-90000-11101", days_ago: 104 },
  { email: "rahul.reddy@bloodline.app", role: "donor", full_name: "Rahul Reddy", blood_group: "B+", city: "Hyderabad", phone: "+91-90000-11102", days_ago: 49 },
  { email: "meera.jain@bloodline.app", role: "donor", full_name: "Meera Jain", blood_group: "A-", city: "Bengaluru", phone: "+91-90000-11103", days_ago: 92 },
  { email: "karthik.nair@bloodline.app", role: "donor", full_name: "Karthik Nair", blood_group: "AB+", city: "Bengaluru", phone: "+91-90000-11104", days_ago: 31 },
  { email: "fatima.shaikh@bloodline.app", role: "donor", full_name: "Fatima Shaikh", blood_group: "O-", city: "Mumbai", phone: "+91-90000-11105", days_ago: 98 },
  { email: "arjun.patel@bloodline.app", role: "donor", full_name: "Arjun Patel", blood_group: "A+", city: "Mumbai", phone: "+91-90000-11106", days_ago: 72 },
  { email: "neha.malhotra@bloodline.app", role: "donor", full_name: "Neha Malhotra", blood_group: "B-", city: "Delhi", phone: "+91-90000-11107", days_ago: 112 },
  { email: "vishal.singh@bloodline.app", role: "donor", full_name: "Vishal Singh", blood_group: "AB-", city: "Delhi", phone: "+91-90000-11108", days_ago: 28 },
  { email: "deepa.iyer@bloodline.app", role: "donor", full_name: "Deepa Iyer", blood_group: "O+", city: "Hyderabad", phone: "+91-90000-11109", days_ago: 85 },
  { email: "manoj.varma@bloodline.app", role: "donor", full_name: "Manoj Varma", blood_group: "A+", city: "Bengaluru", phone: "+91-90000-11110", days_ago: 54 },
  { email: "sonia.verma@bloodline.app", role: "donor", full_name: "Sonia Verma", blood_group: "B+", city: "Delhi", phone: "+91-90000-11111", days_ago: 95 },
  { email: "rohit.shah@bloodline.app", role: "donor", full_name: "Rohit Shah", blood_group: "O-", city: "Mumbai", phone: "+91-90000-11112", days_ago: 41 },
];

const REQUIRED_SCHEMA = {
  profiles: ["id", "email", "role", "is_suspended"],
  donors: ["id", "full_name", "blood_group", "city", "phone", "last_donated_at", "next_eligible_at", "is_available"],
  hospitals: ["id", "name", "city", "address", "contact_phone"],
  emergency_requests: ["id", "hospital_id", "blood_group", "units", "city", "urgency_level", "status", "notes"],
  donations: ["id", "donor_id", "hospital_id", "request_id", "donated_on", "units", "blood_group", "city"],
  blood_inventory: ["id", "hospital_id", "blood_group", "units"],
  activity_logs: ["id", "type", "summary", "created_at"],
};

function assertRequiredEnv() {
  if (!SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL).");
  }

  if (!SUPABASE_SERVICE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_KEY.");
  }

  if (!["dev", "staging", "prod"].includes(DEMO_ENV)) {
    throw new Error(`Invalid DEMO_ENV '${DEMO_ENV}'. Use dev, staging, or prod.`);
  }
}

async function fetchOpenApiSchema() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: "application/openapi+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI schema: HTTP ${response.status}`);
  }

  return response.json();
}

async function assertRequiredSchema() {
  const openApi = await fetchOpenApiSchema();
  const definitions = openApi.definitions || {};
  const issues = [];

  for (const [table, requiredColumns] of Object.entries(REQUIRED_SCHEMA)) {
    const tableDef = definitions[table];
    if (!tableDef || !tableDef.properties) {
      issues.push(`table '${table}' is missing`);
      continue;
    }

    const existing = new Set(Object.keys(tableDef.properties));
    for (const column of requiredColumns) {
      if (!existing.has(column)) {
        issues.push(`column '${table}.${column}' is missing`);
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(
      [
        "Supabase schema does not match the redesigned BloodLine contract.",
        ...issues.map((item) => `- ${item}`),
        "Apply migrations from db/README.md (or run db/supabase_setup.sql in SQL Editor), then rerun seed.",
      ].join("\n"),
    );
  }
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function dateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function findUserByEmail(supabase, email) {
  const target = email.toLowerCase();
  let page = 1;

  while (page < 30) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list users while searching ${email}: ${error.message}`);
    }

    const found = (data.users || []).find((user) => (user.email || "").toLowerCase() === target);
    if (found) {
      return found;
    }

    if (!data.users || data.users.length < 200) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function cleanupProfileEmailCollision(supabase, email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to inspect profile collision for ${email}: ${error.message}`);
  }

  if (!data) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", data.id);

  if (deleteError) {
    throw new Error(`Failed to clear profile collision for ${email}: ${deleteError.message}`);
  }
}

async function ensureAuthUser(supabase, email, metadata) {
  const existing = await findUserByEmail(supabase, email);
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        ...metadata,
      },
    });

    if (updateError) {
      throw new Error(`Failed to update user ${email}: ${updateError.message}`);
    }

    return { id: existing.id, email };
  }

  await cleanupProfileEmailCollision(supabase, email);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    throw new Error(`Failed to create user ${email}: ${error.message}`);
  }

  return { id: data.user.id, email };
}

async function ensureRuntimeSeedAllowed(supabase) {
  const { data, error } = await supabase
    .from("app_runtime_config")
    .select("environment,allow_investor_seed")
    .eq("environment", DEMO_ENV)
    .maybeSingle();

  if (error) {
    if (String(error.message || "").includes("schema cache") && DEMO_ENV !== "prod") {
      console.warn(
        `Runtime config table unavailable in schema cache for ${DEMO_ENV}; continuing seed for non-prod environment.`,
      );
      return;
    }
    throw new Error(`Failed to check runtime config: ${error.message}`);
  }

  if (!data) {
    if (DEMO_ENV === "prod" && !FORCE_DEMO_SEED) {
      throw new Error(
        "No app_runtime_config row found for prod. Create it first or run with FORCE_DEMO_SEED=true.",
      );
    }
    return;
  }

  const allowed = Boolean(data?.allow_investor_seed);
  if (!allowed && !FORCE_DEMO_SEED) {
    throw new Error(
      `Investor seed is disabled for ${DEMO_ENV}. Enable app_runtime_config.allow_investor_seed or run with FORCE_DEMO_SEED=true.`,
    );
  }
}

async function upsertProfiles(supabase, usersByEmail) {
  const profileRows = [...ADMIN_USERS, ...HOSPITAL_USERS, ...DONOR_USERS].map((user) => ({
    id: usersByEmail.get(user.email).id,
    email: user.email,
    role: user.role,
    is_suspended: false,
  }));

  const { error } = await supabase.from("profiles").upsert(profileRows, { onConflict: "id" });
  if (error) {
    throw new Error(`Failed to upsert profiles: ${error.message}`);
  }
}

async function upsertHospitals(supabase, usersByEmail) {
  const rows = HOSPITAL_USERS.map((hospital) => ({
    id: usersByEmail.get(hospital.email).id,
    name: hospital.name,
    city: hospital.city,
    address: hospital.address,
    contact_phone: hospital.contact_phone,
  }));

  const { error } = await supabase.from("hospitals").upsert(rows, { onConflict: "id" });
  if (error) {
    throw new Error(`Failed to upsert hospitals: ${error.message}`);
  }

  return rows;
}

async function upsertDonors(supabase, usersByEmail) {
  const rows = DONOR_USERS.map((donor) => {
    const lastDate = dateDaysAgo(donor.days_ago);
    const nextEligibleDays = Math.max(0, 90 - donor.days_ago);

    return {
      id: usersByEmail.get(donor.email).id,
      full_name: donor.full_name,
      blood_group: donor.blood_group,
      city: donor.city,
      phone: donor.phone,
      last_donated_at: lastDate,
      next_eligible_at: dateDaysFromNow(nextEligibleDays),
      is_available: true,
    };
  });

  const { error } = await supabase.from("donors").upsert(rows, { onConflict: "id" });
  if (error) {
    throw new Error(`Failed to upsert donors: ${error.message}`);
  }

  return rows;
}

async function cleanupDemoRows(supabase, donorIds, hospitalIds) {
  if (donorIds.length > 0) {
    const { error } = await supabase.from("donations").delete().in("donor_id", donorIds);
    if (error) {
      throw new Error(`Failed to clean donations: ${error.message}`);
    }
  }

  if (hospitalIds.length > 0) {
    const { error: requestsError } = await supabase.from("emergency_requests").delete().in("hospital_id", hospitalIds);
    if (requestsError) {
      throw new Error(`Failed to clean emergency requests: ${requestsError.message}`);
    }

    const { error: inventoryError } = await supabase.from("blood_inventory").delete().in("hospital_id", hospitalIds);
    if (inventoryError) {
      throw new Error(`Failed to clean blood inventory: ${inventoryError.message}`);
    }
  }

  const { error: activityError } = await supabase
    .from("activity_logs")
    .delete()
    .ilike("summary", "[INVESTOR_DEMO]%");

  if (activityError) {
    throw new Error(`Failed to clean activity logs: ${activityError.message}`);
  }
}

async function seedInventory(supabase, hospitals) {
  const inventoryRows = [];

  hospitals.forEach((hospital, hospitalIndex) => {
    BLOOD_GROUPS.forEach((group, groupIndex) => {
      inventoryRows.push({
        hospital_id: hospital.id,
        blood_group: group,
        units: 8 + ((hospitalIndex * 5 + groupIndex * 3) % 16),
      });
    });
  });

  const { error } = await supabase.from("blood_inventory").upsert(inventoryRows, {
    onConflict: "hospital_id,blood_group",
  });

  if (error) {
    throw new Error(`Failed to seed inventory: ${error.message}`);
  }

  return inventoryRows;
}

async function seedRequests(supabase, hospitals) {
  const hospitalByCity = new Map(hospitals.map((item) => [item.city, item]));

  const requestRows = [
    { city: "Hyderabad", blood_group: "O+", units: 4, urgency_level: "critical", status: "active" },
    { city: "Hyderabad", blood_group: "B+", units: 3, urgency_level: "medium", status: "active" },
    { city: "Bengaluru", blood_group: "A-", units: 2, urgency_level: "critical", status: "fulfilled" },
    { city: "Bengaluru", blood_group: "AB+", units: 1, urgency_level: "low", status: "cancelled" },
    { city: "Delhi", blood_group: "B-", units: 3, urgency_level: "critical", status: "active" },
    { city: "Delhi", blood_group: "AB-", units: 2, urgency_level: "medium", status: "fulfilled" },
    { city: "Mumbai", blood_group: "O-", units: 4, urgency_level: "critical", status: "active" },
    { city: "Mumbai", blood_group: "A+", units: 2, urgency_level: "medium", status: "fulfilled" },
  ].map((request) => ({
    hospital_id: hospitalByCity.get(request.city).id,
    blood_group: request.blood_group,
    units: request.units,
    city: request.city,
    urgency_level: request.urgency_level,
    status: request.status,
    notes: `[INVESTOR_DEMO] ${request.urgency_level.toUpperCase()} request generated for investor walkthrough`,
  }));

  const { data, error } = await supabase
    .from("emergency_requests")
    .insert(requestRows)
    .select("id,hospital_id,status,blood_group,city");

  if (error) {
    throw new Error(`Failed to seed emergency requests: ${error.message}`);
  }

  return data || [];
}

async function seedDonations(supabase, donors, hospitals, requests) {
  const fulfilledRequests = requests.filter((item) => item.status === "fulfilled");
  const donationRows = donors.map((donor, index) => {
    const hospital = hospitals[index % hospitals.length];
    const request = fulfilledRequests.length ? fulfilledRequests[index % fulfilledRequests.length] : null;

    return {
      donor_id: donor.id,
      hospital_id: hospital.id,
      request_id: request ? request.id : null,
      donated_on: dateDaysAgo(12 + index * 6),
      units: index % 4 === 0 ? 2 : 1,
      blood_group: donor.blood_group,
      city: donor.city,
    };
  });

  const { error } = await supabase.from("donations").insert(donationRows);
  if (error) {
    throw new Error(`Failed to seed donations: ${error.message}`);
  }

  return donationRows;
}

async function seedActivityLogs(supabase, requestsCount, donationsCount) {
  const rows = [
    {
      type: "seed",
      summary: `[INVESTOR_DEMO] Dataset refreshed in ${DEMO_ENV}`,
    },
    {
      type: "request",
      summary: `[INVESTOR_DEMO] ${requestsCount} emergency requests loaded for dashboard walkthrough`,
    },
    {
      type: "donation",
      summary: `[INVESTOR_DEMO] ${donationsCount} donation logs loaded for timeline view`,
    },
  ];

  const { error } = await supabase.from("activity_logs").insert(rows);
  if (error) {
    throw new Error(`Failed to seed activity logs: ${error.message}`);
  }
}

async function main() {
  assertRequiredEnv();
  await assertRequiredSchema();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  await ensureRuntimeSeedAllowed(supabase);

  const usersByEmail = new Map();
  const allUsers = [...ADMIN_USERS, ...HOSPITAL_USERS, ...DONOR_USERS];

  for (const user of allUsers) {
    const ensured = await ensureAuthUser(supabase, user.email, {
      role: user.role,
      source: "investor_seed",
    });
    usersByEmail.set(user.email, ensured);
  }

  await upsertProfiles(supabase, usersByEmail);

  const hospitals = await upsertHospitals(supabase, usersByEmail);
  const donors = await upsertDonors(supabase, usersByEmail);

  await cleanupDemoRows(
    supabase,
    donors.map((row) => row.id),
    hospitals.map((row) => row.id),
  );

  const inventory = await seedInventory(supabase, hospitals);
  const requests = await seedRequests(supabase, hospitals);
  const donations = await seedDonations(supabase, donors, hospitals, requests);
  await seedActivityLogs(supabase, requests.length, donations.length);

  console.log("Investor demo seed completed successfully.");
  console.log(`Environment: ${DEMO_ENV}`);
  console.log(`Admin users: ${ADMIN_USERS.length}`);
  console.log(`Hospital users: ${HOSPITAL_USERS.length}`);
  console.log(`Donor users: ${DONOR_USERS.length}`);
  console.log(`Inventory rows: ${inventory.length}`);
  console.log(`Emergency requests: ${requests.length}`);
  console.log(`Donation logs: ${donations.length}`);
  console.log("");
  console.log("Investor demo credentials:");
  for (const user of allUsers) {
    console.log(`- ${user.role.padEnd(8)} ${user.email} / ${DEMO_PASSWORD}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
