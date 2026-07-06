<template>
    <div class="empty-state">
        <slot>
            <p>No data to display.</p>
        </slot>
    </div>
</template>

<script>
export default {
    name: 'EmptyState'
}
</script>

<style scoped>
.empty-state {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
}
</style>
