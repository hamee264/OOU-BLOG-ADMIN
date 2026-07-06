<template>
    <div class="dashboard">

        <div class="page-header">
            <h1>Dashboard</h1>
            <p>Overview of OOU Chronicle CMS</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h3>Total Posts</h3>
                <span>{{ totalPosts }}</span>
            </div>

            <div class="stat-card">
                <h3>Published Posts</h3>
                <span>{{ publishedPosts }}</span>
            </div>

            <div class="stat-card">
                <h3>Draft Posts</h3>
                <span>{{ draftPosts }}</span>
            </div>

            <div class="stat-card">
                <h3>Categories</h3>
                <span>{{ totalCategories }}</span>
            </div>

            <div class="stat-card">
                <h3>Total Users</h3>
                <span>{{ totalUsers }}</span>
            </div>

        </div>

        <div class="quick-actions">

            <router-link to="/dashboard/posts/create" class="action-btn">
                + New Post
            </router-link>

            <router-link to="/dashboard/categories" class="action-btn">
                + Category
            </router-link>

            <router-link to="/dashboard/media" class="action-btn">
                + Upload Image
            </router-link>

        </div>

        <div class="recent-posts">

            <div class="section-header">
                <h2>Recent Posts</h2>
            </div>

            <table v-if="recentPosts.length">

                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>

                    <tr v-for="post in recentPosts" :key="post.id">
                        <td>{{ post.title }}</td>

                        <td>
                            <span class="status" :class="post.status">
                                {{ post.status }}
                            </span>
                        </td>

                        <td>
                            {{ formatDate(post.created_at) }}
                        </td>
                    </tr>

                </tbody>

            </table>

            <div v-else class="empty-state">
                No posts available.
            </div>

        </div>

    </div>
</template>

<script setup>
import {
    ref,
    onMounted
} from 'vue'
import { supabase } from '@/lib/supabase'

const totalPosts = ref(0)
const publishedPosts = ref(0)
const draftPosts = ref(0)
const totalCategories = ref(0)
const totalUsers = ref(0)

const recentPosts = ref([])

async function fetchDashboardData() {
    const [
        posts,
        published,
        drafts,
        categories,
        users,
        recent
    ] = await Promise.all([

        supabase
            .from('posts')
            .select('*', {
                count: 'exact',
                head: true
            }),

        supabase
            .from('posts')
            .select('*', {
                count: 'exact',
                head: true
            })
            .eq('status', 'published'),

        supabase
            .from('posts')
            .select('*', {
                count: 'exact',
                head: true
            })
            .eq('status', 'draft'),

        supabase
            .from('categories')
            .select('*', {
                count: 'exact',
                head: true
            }),

        supabase
            .from('profiles')
            .select('*', {
                count: 'exact',
                head: true
            }),

        supabase
            .from('posts')
            .select('*')
            .order('created_at', {
                ascending: false
            })
            .limit(5)
    ])

    totalPosts.value =
        posts.count || 0

    publishedPosts.value =
        published.count || 0

    draftPosts.value =
        drafts.count || 0

    totalCategories.value =
        categories.count || 0

    totalUsers.value =
        users.count || 0

    recentPosts.value =
        recent.data || []
}

function formatDate(date) {
    return new Date(date)
        .toLocaleDateString()
}

onMounted(() => {
    fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
    width: 100%;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    margin: 0;
    color: #111827;
}

.page-header p {
    color: #6b7280;
    margin-top: .5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns:
        repeat(auto-fit,
            minmax(220px, 1fr));

    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 14px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.stat-card h3 {
    margin: 0;
    color: #6b7280;
    font-size: .95rem;
}

.stat-card span {
    display: block;
    margin-top: .8rem;
    font-size: 2rem;
    font-weight: 700;
    color: #14532d;
}

.quick-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

.action-btn {
    background: #14532d;
    color: white;
    text-decoration: none;
    padding: .9rem 1.2rem;
    border-radius: 10px;
}

.action-btn:hover {
    background: #166534;
}

.recent-posts {
    background: white;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.section-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
    margin: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 1rem;
    text-align: left;
}

th {
    background: #f8fafc;
}

td {
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

.empty-state {
    padding: 3rem;
    text-align: center;
    color: #6b7280;
}

@media (max-width: 768px) {
    table {
        min-width: 600px;
    }

    .recent-posts {
        overflow-x: auto;
    }
}
</style>