<template>
    <div class="dashboard-layout">
        <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

        <div class="main-wrapper">
            <Topbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

            <main class="page-content">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.dashboard-layout {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
}

.main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.page-content {
    flex: 1;
    padding: 2rem;
    overflow-x: auto;
}

@media (max-width: 768px) {
    .page-content {
        padding: 1rem;
    }
}
</style>