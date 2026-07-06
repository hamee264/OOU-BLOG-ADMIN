<template>
    <div class="auth-layout">
        <router-view />
    </div>
</template>

<script>
export default {
    name: 'AuthLayout'
}
</script>

<style scoped>
.auth-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f3f4f6;
}
</style>
