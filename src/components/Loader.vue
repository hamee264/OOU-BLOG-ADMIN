<template>
    <div class="loader">
        <div class="dot" />
        <div class="dot" />
        <div class="dot" />
    </div>
</template>

<script setup>
</script>

<style scoped>
.loader {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
}

.dot {
    width: 0.6rem;
    height: 0.6rem;
    background: #2563eb;
    border-radius: 50%;
    animation: bounce 0.9s infinite ease-in-out;
}

.dot:nth-child(2) {
    animation-delay: 0.1s
}

.dot:nth-child(3) {
    animation-delay: 0.2s
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: translateY(0)
    }

    40% {
        transform: translateY(-8px)
    }
}
</style>
