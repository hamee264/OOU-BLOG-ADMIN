<template>
    <div class="create-post-page">
        <div class="page-header">
            <h1>Edit Post</h1>
            <p>Update an existing article.</p>
        </div>

        <form class="post-form" @submit.prevent="updatePost">

            <div class="form-group">
                <label>Title</label>
                <input v-model="title" type="text" placeholder="Enter article title" required />
            </div>

            <div class="form-group">
                <label>Slug</label>
                <input v-model="slug" type="text" placeholder="post-url-slug" required />
            </div>

            <div class="form-group">
                <label>Excerpt</label>
                <textarea v-model="excerpt" rows="3" placeholder="Short summary..." />
            </div>

            <div class="form-group">
                <label>Content</label>
                <textarea v-model="content" rows="12" placeholder="Write article content..." />
            </div>

            <div class="form-group">
                <label>Featured Image</label>

                <input type="file" accept="image/*" :disabled="uploadingImage" @change="uploadFeaturedImage" />

                <p v-if="uploadingImage" class="upload-text">
                    Uploading image...
                </p>

                <button type="button" class="media-btn" @click="loadMediaImages">
                    Choose from Media Library
                </button>

                <div v-if="mediaImages.length" class="media-grid">
                    <img v-for="image in mediaImages" :key="image.name" :src="image.url" class="media-image"
                        @click="selectImage(image.url)" />
                </div>

                <img v-if="featuredImage" :src="featuredImage" alt="Preview" class="image-preview" />
            </div>

            <div class="form-group">
                <label>Category</label>

                <select v-model="categoryId">
                    <option value="">
                        Select Category
                    </option>

                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Status</label>

                <select v-model="status">
                    <option value="draft">
                        Draft
                    </option>

                    <option value="published">
                        Published
                    </option>
                </select>
            </div>

            <button type="submit" class="submit-btn" :disabled="!canUpdate">
                {{
                    loading
                        ? 'Updating...'
                        : 'Update Post'
                }}
            </button>

        </form>
    </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    computed
} from 'vue'
import {
    useRouter,
    useRoute
} from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const uploadingImage = ref(false)
const loadingMedia = ref(false)

const title = ref('')
const slug = ref('')
const excerpt = ref('')
const content = ref('')
const featuredImage = ref('')
const categoryId = ref('')
const status = ref('draft')
const publishedAt = ref(null)

const categories = ref([])
const mediaImages = ref([])

const canUpdate = computed(() => {
    return (
        title.value.trim() &&
        slug.value.trim() &&
        excerpt.value.trim() &&
        content.value.trim() &&
        featuredImage.value &&
        categoryId.value &&
        !loading.value &&
        !uploadingImage.value
    )
})
async function fetchCategories() {
    const { data, error } =
        await supabase
            .from('categories')
            .select('*')
            .order('name')

    if (error) {
        console.error(error)
        return
    }

    categories.value = data || []
}

async function fetchPost() {
    const { data, error } =
        await supabase
            .from('posts')
            .select('*')
            .eq('id', route.params.id)
            .single()

    if (error) {
        alert(error.message)
        return
    }

    title.value = data.title
    slug.value = data.slug
    excerpt.value = data.excerpt
    content.value = data.content
    featuredImage.value = data.featured_image
    categoryId.value = data.category_id
    status.value = data.status
    publishedAt.value = data.published_at
}

async function uploadFeaturedImage(event) {
    const file = event.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
        alert('Please select an image.')
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB.')
        return
    }

    uploadingImage.value = true

    const fileName =
        `${Date.now()}-${file.name}`

    const { error } =
        await supabase
            .storage
            .from('post-images')
            .upload(fileName, file, {
                upsert: true
            })

    if (error) {
        uploadingImage.value = false
        alert(error.message)
        return
    }

    const {
        data: publicUrlData
    } = supabase
        .storage
        .from('post-images')
        .getPublicUrl(fileName)

    featuredImage.value =
        publicUrlData.publicUrl

    uploadingImage.value = false
}

async function loadMediaImages() {
    loadingMedia.value = true

    const { data, error } =
        await supabase
            .storage
            .from('post-images')
            .list('', {
                sortBy: {
                    column: 'created_at',
                    order: 'desc'
                }
            })

    loadingMedia.value = false

    if (error) {
        alert(error.message)
        return
    }

    mediaImages.value = data
        .filter(file => file.id)
        .map(file => {
            const {
                data: publicUrlData
            } = supabase
                .storage
                .from('post-images')
                .getPublicUrl(file.name)

            return {
                ...file,
                url:
                    publicUrlData.publicUrl
            }
        })
}

function selectImage(url) {
    featuredImage.value = url
    mediaImages.value = []
}

async function updatePost() {
    if (
        !title.value.trim() ||
        !slug.value.trim() ||
        !excerpt.value.trim() ||
        !content.value.trim() ||
        !featuredImage.value ||
        !categoryId.value
    ) {
        alert(
            'Please fill all fields before updating.'
        )
        return
    }
    loading.value = true

    const { error } =
        await supabase
            .from('posts')
            .update({
                title: title.value,
                slug: slug.value,
                excerpt: excerpt.value,
                content: content.value,
                featured_image:
                    featuredImage.value,
                category_id:
                    categoryId.value || null,
                status: status.value,
                published_at:
                    status.value === 'published'
                        ? publishedAt.value ||
                        new Date().toISOString()
                        : null
            })
            .eq('id', route.params.id)

    loading.value = false

    if (error) {
        alert(error.message)
        return
    }

    alert('Post updated successfully')

    router.push('/dashboard/posts')
}

onMounted(async () => {
    await fetchCategories()
    await fetchPost()
})
</script>

<style scoped>
.create-post-page {
    max-width: 900px;
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

.post-form {
    background: white;
    padding: 2rem;
    border-radius: 14px;
    border: 1px solid #e5e7eb;

    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

label {
    font-weight: 600;
    color: #374151;
}

input,
textarea,
select {
    width: 100%;
    padding: .9rem;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: .95rem;
}

textarea {
    resize: vertical;
}

.media-btn {
    border: none;
    background: #14532d;
    color: white;
    padding: .8rem 1rem;
    border-radius: 10px;
    cursor: pointer;
}

.media-btn:hover {

    background: #166534;

}

.media-grid {
    display: grid;
    grid-template-columns:
        repeat(auto-fill,
            minmax(100px, 1fr));

    gap: 1rem;
    margin-top: 1rem;
}

.media-image {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    cursor: pointer;
    border: 2px solid transparent;
}

.media-image:hover {
    border-color: #14532d;
}

.image-preview {
    width: 100%;
    max-width: 300px;
    border-radius: 10px;
    margin-top: 1rem;
    border: 1px solid #e5e7eb;
}

.submit-btn {
    background: #14532d;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 10px;
    cursor: pointer;
}

.submit-btn:hover {
    background: #166534;
}

@media (max-width: 768px) {
    .post-form {
        padding: 1rem;
    }
}

.submit-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: .8;
}

.upload-text {
    color: #6b7280;
    font-size: .9rem;
}
</style>