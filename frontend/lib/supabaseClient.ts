import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingMsg =
  "Missing Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
  "Set them and restart the dev server.";

function makeMissingFrom() {
  const chain: any = {
    eq() {
      return chain;
    },
    single() {
      return Promise.reject(new Error(missingMsg));
    },
    select() {
      return chain;
    },
    update() {
      return chain;
    },
    insert() {
      return chain;
    },
  };
  return () => chain;
}

let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  if (process.env.NODE_ENV === "development") console.log("Supabase client initialized");
} else {
  // Provide a safe stub: property access is allowed, methods will throw when actually used.
  const fromFactory = makeMissingFrom();
  supabase = {
    // auth methods used by the app
    auth: {
      // throws when called
      getSession: async () => {
        throw new Error(missingMsg);
      },
      signUp: async () => {
        throw new Error(missingMsg);
      },
      signInWithPassword: async () => {
        throw new Error(missingMsg);
      },
      signOut: async () => {
        throw new Error(missingMsg);
      },
      // return a harmless subscription object so unsubscribe can be called safely
      onAuthStateChange: (_cb: any) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                /* noop */
              },
            },
          },
        };
      },
    },
    // database from() chainable stub
    from: fromFactory(),
  };
  if (process.env.NODE_ENV === "development") console.warn(missingMsg);
}

export { supabase };
