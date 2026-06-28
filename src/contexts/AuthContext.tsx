import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { syncSubscription } from "../lib/billingClient";
import { authCallbackUrl } from "../lib/appUrl";
import { supabase } from "../lib/supabase";
import { isPro, normalizeProfile } from "../lib/plan";
import type { Profile } from "../lib/types";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  resetPasswordForEmail: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const billingSyncedRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error.message);
      return;
    }

    setProfile(normalizeProfile(data as Record<string, unknown> | null));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [loadProfile, user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      void loadProfile(user.id);
    } else {
      setProfile(null);
      billingSyncedRef.current = null;
    }
  }, [user, loadProfile]);

  useEffect(() => {
    if (!user || !profile || isPro(profile)) return;
    if (billingSyncedRef.current === user.id) return;
    if (!profile.stripe_customer_id && !profile.email) return;

    billingSyncedRef.current = user.id;
    void (async () => {
      try {
        await syncSubscription();
        await loadProfile(user.id);
      } catch (err) {
        console.warn("Billing sync failed:", err);
        billingSyncedRef.current = null;
      }
    })();
  }, [user, profile, loadProfile]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authCallbackUrl("/app?welcome=1"),
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      return error?.message ?? null;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl("/reset-password"),
    });
    return error?.message ?? null;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      resetPasswordForEmail,
      updatePassword,
      signOut,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      resetPasswordForEmail,
      updatePassword,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
