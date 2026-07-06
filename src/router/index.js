import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  {
    path: "/login",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "Login",
        component: () => import("@/views/auth/LoginView.vue"),
      },
    ],
  },

  {
    path: "/dashboard",
    component: () => import("@/layouts/DashboardLayout.vue"),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard/DashboardView.vue"),
      },

      {
        path: "posts",
        name: "Posts",
        component: () => import("@/views/dashboard/PostsView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },

      {
        path: "posts/create",
        name: "CreatePost",
        component: () => import("@/views/dashboard/CreatePostView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },

      {
        path: "posts/:id/edit",
        name: "EditPost",
        component: () => import("@/views/dashboard/EditPostView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },

      {
        path: "categories",
        name: "Categories",
        component: () => import("@/views/dashboard/CategoriesView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },

      {
        path: "media",
        name: "Media",
        component: () => import("@/views/dashboard/MediaView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },

      {
        path: "users",
        name: "Users",
        component: () => import("@/views/dashboard/UsersView.vue"),
        meta: {
          roles: ["super_admin"],
        },
      },

      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/dashboard/SettingsView.vue"),
        meta: {
          roles: ["super_admin", "admin"],
        },
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.ready) {
    await auth.getCurrentUser();
  }

  // Not logged in
  if (to.path.startsWith("/dashboard") && !auth.isAuthenticated) {
    return { name: "Login" };
  }

  // Already logged in
  if (to.name === "Login" && auth.isAuthenticated) {
    return { name: "Dashboard" };
  }

  // Role protection
  if (to.meta.roles && !auth.isInRole(to.meta.roles)) {
    return { name: "Dashboard" };
  }
});

export default router;
