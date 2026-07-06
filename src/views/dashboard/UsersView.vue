<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()

const users = ref([])
const search = ref('')

const showAddUser = ref(false)

const fullName = ref('')
const email = ref('')
const password = ref('')

async function fetchUsers() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', {
            ascending: false
        })

    if (error) {
        alert(error.message)
        return
    }

    const { data: roles } = await supabase
        .from('roles')
        .select('*')

    users.value = (profiles || []).map(profile => {
        const role = roles?.find(
            r => r.user_id === profile.id
        )

        return {
            ...profile,
            role: role?.role || 'admin'
        }
    })
}

const filteredUsers = computed(() => {
    const term = search.value.toLowerCase()

    return users.value.filter(user =>
        (user.full_name || '')
            .toLowerCase()
            .includes(term) ||

        (user.email || '')
            .toLowerCase()
            .includes(term)
    )
})

async function createUser() {
    if (
        !fullName.value ||
        !email.value ||
        !password.value
    ) {
        alert('Please fill all fields.')
        return
    }

    const { error } = await supabase.functions.invoke(
        'create-user',
        {
            body: {
                full_name: fullName.value,
                email: email.value,
                password: password.value,
                role: 'admin'
            }
        }
    )

    if (error) {
        alert(error.message)
        return
    }

    alert('Admin created successfully.')

    showAddUser.value = false

    fullName.value = ''
    email.value = ''
    password.value = ''

    fetchUsers()
}

async function deleteUser(user) {
    if (user.role === 'super_admin') {
        alert('Super Admin cannot be deleted.')
        return
    }

    if (user.id === auth.user.id) {
        alert('You cannot delete your own account.')
        return
    }

    const confirmed = confirm(
        `Delete ${user.full_name}?`
    )

    if (!confirmed) return

    const { error } = await supabase.functions.invoke(
        'delete-user',
        {
            body: {
                user_id: user.id
            }
        }
    )

    if (error) {
        alert(error.message)
        return
    }

    users.value = users.value.filter(
        u => u.id !== user.id
    )

    alert('User deleted successfully.')
}

function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString()
}

onMounted(fetchUsers)
</script>
<template>
    <div class="users-page">
        <div class="page-header">
            <div>
                <h1>Users</h1>
                <p>
                    Manage CMS users and roles.
                </p>
            </div>

            <button class="add-btn" @click="
                showAddUser = true
                ">
                Add User
            </button>
        </div>

        <div class="search-box">
            <input v-model="search" type="text" placeholder="Search users..." />
        </div>

        <div class="users-card">
            <table v-if="
                filteredUsers.length
            ">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id">
                        <td>{{ user.full_name }}</td>

                        <td>
                            {{ user.email || 'No Email' }}
                        </td>

                        <td>
                            <span class="role" :class="user.role">
                                {{ user.role }}
                            </span>
                        </td>

                        <td>
                            {{ formatDate(user.created_at) }}
                        </td>

                        <td>
                            <button v-if="user.role !== 'super_admin'" class="delete-btn" @click="deleteUser(user)">
                                Delete
                            </button>

                            <span v-else>
                                Protected
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="empty-state">
                No users found.
            </div>
        </div>

        <div v-if="showAddUser" class="modal-overlay">
            <div class="modal">

                <h2>Add Admin</h2>

                <div class="form-group">
                    <label>Full Name</label>
                    <input v-model="fullName" type="text">
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input v-model="email" type="email">
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model="password" type="password">
                </div>

                <div class="modal-actions">
                    <button class="cancel-btn" @click="showAddUser = false">
                        Cancel
                    </button>

                    <button class="save-btn" @click="createUser">
                        Create Admin
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.users-page {
    width: 100%;
}

.page-header {
    display: flex;
    justify-content:
        space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.search-box {
    margin-bottom: 1rem;
}

.search-box input,
.modal input,
.modal select,
.role-select {
    width: 100%;
    padding: .85rem;
    border: 1px solid #d1d5db;
    border-radius: 10px;
}

.users-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 1rem;
    border-top:
        1px solid #e5e7eb;
    text-align: left;
}

th {
    background: #f8fafc;
}

.role {
    padding:
        .35rem .8rem;
    border-radius: 999px;
    font-size: .8rem;
}

.add-btn,
.save-btn,
.cancel-btn {
    border: none;
    color: white;
    padding:
        .85rem 1.2rem;
    border-radius: 10px;
    cursor: pointer;
}

.add-btn,
.save-btn {
    background: #14532d;
}

.cancel-btn {
    background: #6b7280;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background:
        rgba(0, 0, 0, .45);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    width: 100%;
    max-width: 500px;
    border-radius: 14px;
    padding: 2rem;
}

.form-group {
    margin-top: 1rem;
}

.modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.empty-state {
    padding: 3rem;
    text-align: center;
}

.delete-btn {
    border: none;
    background: #dc2626;
    color: white;
    padding: .7rem 1rem;
    border-radius: 8px;
    cursor: pointer;
}

.delete-btn:hover {
    background: #b91c1c;
}

.role.super_admin {
    background: #fee2e2;
    color: #991b1b;
    font-weight: 600;
}

.role.admin {
    background: #dcfce7;
    color: #166534;
    font-weight: 600;
}

@media (max-width:768px) {
    .users-card {
        overflow-x: auto;
    }

    table {
        min-width: 700px;
    }
}
</style>