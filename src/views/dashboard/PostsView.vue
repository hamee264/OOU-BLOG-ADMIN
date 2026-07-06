<template>
    <div class="posts-page">

        <div class="page-header">
            <div>
                <h1>Posts</h1>
                <p>Manage all published and draft articles.</p>
            </div>

            <router-link to="/dashboard/posts/create" class="create-btn">
                + New Post
            </router-link>
        </div>

        <div class="search-box">
            <input v-model="search" type="text" placeholder="Search posts..." />
        </div>

        <div class="table-wrapper">

            <table v-if="filteredPosts.length">

                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    <tr v-for="post in filteredPosts" :key="post.id">
                        <td>{{ post.title }}</td>

                        <td>
                            {{ post.categories?.name || 'Uncategorized' }}
                        </td>

                        <td>
                            <span class="status" :class="post.status">
                                {{ post.status }}
                            </span>
                        </td>

                        <td>
                            {{ formatDate(post.created_at) }}
                        </td>

                        <td>
                            <div class="actions">

                                <button class="edit-btn" @click="goToEdit(post.id)">
                                    Edit
                                </button>

                                <button class="delete-btn" @click="deletePost(post.id)">
                                    Delete
                                </button>

                            </div>
                        </td>

                    </tr>

                </tbody>

            </table>

            <div v-else class="empty-state">
                No posts found.
            </div>

        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const posts = ref([])
const search = ref('')

async function fetchPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            categories (
                name
            )
        `)
        .order('created_at', {
            ascending: false
        })

    if (error) {
        console.error(error)
        return
    }

    posts.value = data || []
}

const filteredPosts = computed(() => {
    return posts.value.filter(post =>
        post.title
            .toLowerCase()
            .includes(search.value.toLowerCase())
    )
})

async function deletePost(id) {
    const confirmed = confirm('Delete this post?')

    if (!confirmed) return

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

    if (error) {
        alert(error.message)
        return
    }

    alert('Post deleted successfully')

    await fetchPosts()
}

function goToEdit(id) {
    router.push(`/dashboard/posts/${id}/edit`)
}

function formatDate(date) {
    return new Date(date).toLocaleDateString()
}

onMounted(() => {
    fetchPosts()
})
</script>
<style scoped>
.posts-page {
    width: 100%;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
}

.page-header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #111827;
}

.page-header p {
    margin-top: .3rem;
    color: #6b7280;
}

.create-btn {
    background: #14532d;
    color: white;
    text-decoration: none;

    border-radius: 10px;

    padding: .9rem 1.3rem;

    transition: .2s ease;
}

.create-btn:hover {
    background: #166534;
}

.search-box {
    margin-bottom: 1rem;
}

.search-box input {
    width: 100%;
    max-width: 350px;

    padding: .9rem 1rem;

    border: 1px solid #d1d5db;
    border-radius: 10px;

    font-size: .95rem;
}

.table-wrapper {
    background: white;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    text-align: left;
    background: #f8fafc;
    padding: 1rem;
    font-size: .9rem;
    color: #374151;
}

td {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
}

.status {
    padding: .4rem .8rem;
    border-radius: 999px;
    font-size: .8rem;
    font-weight: 600;
}

.status.published {
    background: #dcfce7;
    color: #166534;
}

.status.draft {
    background: #fef3c7;
    color: #92400e;
}

.actions {
    display: flex;
    gap: .5rem;
}

.edit-btn {
    border: none;
    background: #2563eb;
    color: white;

    padding: .55rem .8rem;
    border-radius: 8px;

    cursor: pointer;
}

.edit-btn:hover {
    background: #1d4ed8;
}

.delete-btn {
    border: none;
    background: #dc2626;
    color: white;

    padding: .55rem .8rem;
    border-radius: 8px;

    cursor: pointer;
}

.delete-btn:hover {
    background: #b91c1c;
}

.empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
}

@media (max-width: 768px) {

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .search-box input {
        max-width: 100%;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        min-width: 800px;
    }
}
</style>