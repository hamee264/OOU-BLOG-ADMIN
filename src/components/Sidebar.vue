<template>
    <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>

    <aside class="sidebar" :class="{ open: isOpen }">
        <div>
            <div class="brand">
                <h2>OOU Chronicle</h2>
                <span>Content Management</span>
            </div>

            <nav class="navigation">
                <router-link v-for="item in menuItems" :key="item.route" :to="item.route" class="nav-link"
                    @click="$emit('close')">
                    {{ item.label }}
                </router-link>
            </nav>
        </div>

        <div class="sidebar-footer">
            <small>{{ roleLabel }}</small>
            <small>Version 1.0</small>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

defineEmits(['close'])

const auth = useAuthStore()

const role = computed(() => auth.role)

const roleLabel = computed(() => {
    switch (role.value) {
        case 'super_admin':
            return 'Super Admin'

        case 'admin':
            return 'Administrator'

        default:
            return 'Unknown Role'
    }
})

const menuItems = computed(() => {
    const items = [
        {
            label: 'Dashboard',
            route: '/dashboard',
            roles: ['super_admin', 'admin']
        },
        {
            label: 'Articles',
            route: '/dashboard/posts',
            roles: ['super_admin', 'admin']
        },
        {
            label: 'Categories',
            route: '/dashboard/categories',
            roles: ['super_admin', 'admin']
        },
        {
            label: 'Media Library',
            route: '/dashboard/media',
            roles: ['super_admin', 'admin']
        },
        {
            label: 'Settings',
            route: '/dashboard/settings',
            roles: ['super_admin', 'admin']
        },
        {
            label: 'Users',
            route: '/dashboard/users',
            roles: ['super_admin']
        }
    ]

    return items.filter(item =>
        item.roles.includes(role.value)
    )
})
</script>

<style scoped>
.sidebar {
    width: 280px;
    min-height: 100vh;
    background: #14532d;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem 1rem;
    border-right: 1px solid rgba(255, 255, 255, .08);
}

.brand {
    margin-bottom: 2rem;
    padding: 0 .75rem;
}

.brand h2 {
    margin: 0;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 700;
}

.brand span {
    color: rgba(255, 255, 255, .7);
    font-size: .85rem;
}

.navigation {
    display: flex;
    flex-direction: column;
    gap: .4rem;
}

.nav-link {
    text-decoration: none;
    color: rgba(255, 255, 255, .85);
    padding: .95rem 1rem;
    border-radius: 10px;
    transition: .2s;
}

.nav-link:hover {
    background: rgba(255, 255, 255, .08);
    color: #fff;
}

.nav-link.router-link-exact-active {
    background: #fff;
    color: #14532d;
    font-weight: 600;
}

.sidebar-footer {
    border-top: 1px solid rgba(255, 255, 255, .08);
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: .25rem;
    color: rgba(255, 255, 255, .65);
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    z-index: 998;
    display: none;
}

@media (max-width: 768px) {
    .overlay {
        display: block;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: -100%;
        z-index: 999;
        transition: left .3s ease;
    }

    .sidebar.open {
        left: 0;
    }
}
</style>