<template>
    <div class="spinner" aria-label="Loading"></div>
</template>

<script>
export default {
    name: 'LoadingSpinner'
}
</script>

<style scoped>
.spinner {
    width: 3rem;
    height: 3rem;
    border: 0.5rem solid rgba(148, 163, 184, 0.4);
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: auto;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
