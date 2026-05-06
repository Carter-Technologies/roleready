import { supabase } from "./supabase";

type SupabaseTestResult = {
  success: boolean;
  message: string;
};

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";

    return { success: false, message };
  }
}
