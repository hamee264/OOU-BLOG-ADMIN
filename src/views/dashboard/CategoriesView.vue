<template>
    <div class="categories-page">

        <div class="page-header">
            <div>
                <h1>Categories</h1>
                <p>Manage article categories.</p>
            </div>

            <button class="create-btn" @click="openCreateModal">
                + New Category
            </button>
        </div>

        <div class="table-wrapper">

            <table v-if="categories.length">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    <tr v-for="category in categories" :key="category.id">
                        <td>{{ category.name }}</td>
                        <td>{{ category.slug }}</td>
                        <td>{{ formatDate(category.created_at) }}</td>

                        <td>
                            <div class="actions">

                                <button class="edit-btn" @click="editCategory(category)">
                                    Edit
                                </button>

                                <button class="delete-btn" @click="deleteCategory(category.id)">
                                    Delete
                                </button>

                            </div>
                        </td>
                    </tr>

                </tbody>

            </table>

            <div v-else class="empty-state">
                No categories found.
            </div>

        </div>

        <!-- Modal -->

        <div v-if="showModal" class="modal-overlay">
            <div class="modal">

                <h2>
                    {{ editing ? 'Edit Category' : 'Create Category' }}
                </h2>

                <input v-model="name" type="text" placeholder="Category name" />

                <input v-model="slug" type="text" placeholder="category-slug" />

                <div class="modal-actions">

                    <button class="cancel-btn" @click="closeModal">
                        Cancel
                    </button>

                    <button class="save-btn" @click="saveCategory">
                        Save
                    </button>

                </div>

            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'

const categories = ref([])

const showModal = ref(false)
const editing = ref(false)

const categoryId = ref(null)

const name = ref('')
const slug = ref('')

watch(name, (value) => {
    slug.value = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
})

async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', {
            ascending: false
        })

    if (error) {
        console.error(error)
        return
    }

    categories.value = data || []
}

function openCreateModal() {
    editing.value = false
    categoryId.value = null

    name.value = ''
    slug.value = ''

    showModal.value = true
}

function editCategory(category) {
    editing.value = true

    categoryId.value = category.id
    name.value = category.name
    slug.value = category.slug

    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

async function saveCategory() {

    if (!name.value) {
        alert('Category name required')
        return
    }

    let error

    if (editing.value) {

        const response = await supabase
            .from('categories')
            .update({
                name: name.value,
                slug: slug.value
            })
            .eq('id', categoryId.value)

        error = response.error

    } else {

        const response = await supabase
            .from('categories')
            .insert([
                {
                    name: name.value,
                    slug: slug.value
                }
            ])

        error = response.error
    }

    if (error) {
        alert(error.message)
        return
    }

    closeModal()
    fetchCategories()
}

async function deleteCategory(id) {

    const confirmed = confirm(
        'Delete this category?'
    )

    if (!confirmed) return

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        alert(error.message)
        return
    }

    fetchCategories()
}

function formatDate(date) {
    return new Date(date)
        .toLocaleDateString()
}

onMounted(() => {
    fetchCategories()
})
</script>

<style scoped>
.categories-page {
    width: 100%;
}

.page-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
}

.create-btn,
.save-btn {
    background: #14532d;
    color: white;
    border: none;
    padding: .85rem 1.2rem;
    border-radius: 10px;
    cursor: pointer;
}

.table-wrapper {
    background: white;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
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

.actions {
    display: flex;
    gap: .5rem;
}

.edit-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: .55rem .8rem;
    border-radius: 8px;
}

.delete-btn {
    background: #dc2626;
    color: white;
    border: none;
    padding: .55rem .8rem;
    border-radius: 8px;
}

.empty-state {
    padding: 3rem;
    text-align: center;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .4);

    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: white;
    width: 400px;
    padding: 1.5rem;
    border-radius: 14px;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal input {
    padding: .85rem;
    border: 1px solid #d1d5db;
    border-radius: 10px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: .5rem;
}

.cancel-btn {
    padding: .85rem 1rem;
}
</style>