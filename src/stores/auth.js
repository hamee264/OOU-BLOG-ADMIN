import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const profile = ref(null);
  const role = ref(null);
  const ready = ref(false);

  // Authentication
  const isAuthenticated = computed(() => !!user.value);

  // Roles
  const isAdmin = computed(() => role.value === "admin");
  const isSuperAdmin = computed(() => role.value === "super_admin");

  async function getCurrentUser() {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(error);

        user.value = null;
        profile.value = null;
        role.value = null;
        ready.value = true;

        return null;
      }

      user.value = currentUser || null;

      if (user.value) {
        // Fetch role
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("role")
          .eq("user_id", user.value.id)
          .maybeSingle();

        if (roleError) {
          console.error("Role fetch error:", roleError);
          role.value = null;
        } else {
          role.value = roleData?.role ?? null;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.value.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          profile.value = null;
        } else {
          profile.value = profileData;
        }
      } else {
        profile.value = null;
        role.value = null;
      }

      ready.value = true;

      console.log("USER:", user.value);
      console.log("PROFILE:", profile.value);
      console.log("ROLE:", role.value);

      return user.value;
    } catch (err) {
      console.error(err);

      user.value = null;
      profile.value = null;
      role.value = null;
      ready.value = true;

      return null;
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    user.value = data.user;

    await getCurrentUser();

    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    user.value = null;
    profile.value = null;
    role.value = null;
    ready.value = false;
  }

  function isInRole(roles) {
    if (!role.value) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return allowedRoles.includes(role.value);
  }

  function init() {
    getCurrentUser();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null;

      if (user.value) {
        await getCurrentUser();
      } else {
        profile.value = null;
        role.value = null;
        ready.value = true;
      }
    });
  }

  return {
    user,
    profile,
    role,
    ready,

    isAuthenticated,
    isAdmin,
    isSuperAdmin,

    init,
    getCurrentUser,
    login,
    signOut,
    isInRole,
  };
});
