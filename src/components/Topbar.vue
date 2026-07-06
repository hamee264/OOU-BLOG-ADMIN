<template>
    <header class="topbar">
        <div class="topbar-left">
            <button class="menu-btn" @click="$emit('toggle-sidebar')">
                ☰
            </button>

            <div>
                <h1>Content Overview</h1>
                <p>Manage articles, media and newsroom content</p>
            </div>
        </div>

        <div class="topbar-right">
            <div class="user-info">
                <span class="user-name">
                    {{ auth.profile?.full_name }}
                </span>

                <span class="user-role">
                    {{ roleLabel }}
                </span>
            </div>

            <button class="logout-btn" @click="signOut">
                Logout
            </button>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const auth = useAuthStore()

const displayName = computed(() => {
    return (
        auth.user?.user_metadata?.full_name ||
        auth.user?.email ||
        'User'
    )
})

const roleLabel = computed(() => {
    switch (auth.role) {
        case 'super_admin':
            return 'Super Admin'

        case 'admin':
            return 'Administrator'

        default:
            return 'User'
    }
})

async function signOut() {
    await auth.signOut()
    router.push('/login')
}
</script>

<style scoped>
.topbar {
    min-height: 80px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    gap: 1rem;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.topbar-left h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
}

.topbar-left p {
    margin: .25rem 0 0;
    color: #6b7280;
    font-size: .9rem;
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    text-align: right;
}

.user-name {
    font-size: .95rem;
    font-weight: 700;
    color: #111827;
}

.user-email {
    font-size: .8rem;
    color: #6b7280;
}

.user-role {
    font-size: .8rem;
    color: #14532d;
    font-weight: 600;
}

.logout-btn {
    border: none;
    background: #14532d;
    color: white;
    padding: .75rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.logout-btn:hover {
    background: #166534;
}

.menu-btn {
    display: none;
    border: none;
    background: transparent;
    font-size: 1.4rem;
    cursor: pointer;
}

@media (max-width: 768px) {
    .topbar {
        padding: 1rem;
    }

    .menu-btn {
        display: block;
    }

    .topbar-left h1 {
        font-size: 1.2rem;
    }

    .topbar-left p {
        font-size: .8rem;
    }

    .user-info {
        display: none;
    }
}

@media (max-width: 500px) {
    .topbar-left p {
        display: none;
    }
}
</style>