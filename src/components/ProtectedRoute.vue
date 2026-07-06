<script setup>
import { useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
    if (!auth.ready) return
    if (!auth.isAuthenticated) {
        router.replace({ name: 'Login' })
    }
})

watch(
    () => auth.isAuthenticated,
    (val) => {
        if (!val) router.replace({ name: 'Login' })
    }
)
</script>

<template>
    <slot />
</template>
