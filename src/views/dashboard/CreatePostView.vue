<template>
    <div class="create-post-page">

        <div class="page-header">
            <h1>Create Post</h1>
            <p>Publish a new article to OOU Chronicle.</p>
        </div>

        <form class="post-form" @submit.prevent="createPost">

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

                <button type="button" class="media-btn" @click="toggleMediaLibrary">
                    {{
                        mediaImages.length
                            ? 'Close Media Library'
                            : 'Choose from Media Library'
                    }}
                </button>

                <div v-if="mediaImages.length" class="media-grid">
                    <img v-for="image in mediaImages" :key="image.name" :src="image.url" class="media-image" :class="{
                        active:
                            featuredImage === image.url
                    }" @click="selectImage(image.url)" />
                </div>

                <img v-if="featuredImage" :src="featuredImage" class="image-preview" />
                <button v-if="featuredImage" type="button" class="remove-btn" @click="featuredImage = ''">
                    Remove Image
                </button>
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
            <button type="submit" class="submit-btn" :disabled="!canPublish">
                {{
                    loading
                        ? 'Publishing...'
                        : 'Publish Post'
                }}
            </button>
        </form>

    </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    watch,
    computed
} from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

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

const categories = ref([])
const mediaImages = ref([])

watch(title, value => {
    slug.value = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
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

async function uploadFeaturedImage(event) {
    const file =
        event.target.files[0]

    if (!file) return

    if (
        !file.type.startsWith(
            'image/'
        )
    ) {
        alert(
            'Please select an image.'
        )
        return
    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {
        alert(
            'Image must be less than 5MB.'
        )
        return
    }

    uploadingImage.value = true

    const fileName =
        `${Date.now()}-${file.name}`

    const { error } =
        await supabase
            .storage
            .from('post-images')
            .upload(
                fileName,
                file,
                {
                    upsert: true
                }
            )

    if (error) {
        uploadingImage.value =
            false

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
async function toggleMediaLibrary() {
    if (
        mediaImages.value.length
    ) {
        mediaImages.value = []
        return
    }

    await loadMediaImages()
}
async function loadMediaImages() {
    loadingMedia.value = true

    const { data, error } =
        await supabase
            .storage
            .from('post-images')
            .list('', {
                sortBy: {
                    column:
                        'created_at',
                    order: 'desc'
                }
            })

    loadingMedia.value = false

    if (error) {
        alert(error.message)
        return
    }

    mediaImages.value =
        data
            .filter(
                file => file.id
            )
            .map(file => {
                const {
                    data:
                    publicUrlData
                } = supabase
                    .storage
                    .from(
                        'post-images'
                    )
                    .getPublicUrl(
                        file.name
                    )

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

async function createPost() {
    loading.value = true

    const { error } =
        await supabase
            .from('posts')
            .insert([
                {
                    title: title.value,
                    slug: slug.value,
                    excerpt: excerpt.value,
                    content: content.value,
                    featured_image:
                        featuredImage.value,
                    status: status.value,
                    category_id:
                        categoryId.value || null,
                    author_id:
                        auth.user?.id || null,
                    published_at:
                        status.value ===
                            'published'
                            ? new Date()
                                .toISOString()
                            : null
                }
            ])

    loading.value = false

    if (error) {
        alert(error.message)
        return
    }

    alert('Post created successfully')

    router.push('/dashboard/posts')
    if (
        auth.role === 'author' &&
        status.value === 'published'
    ) {
        alert(
            'Authors cannot publish articles.'
        )
        return
    }
}
const canPublish = computed(() => {
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
onMounted(() => {
    fetchCategories()
})
// const { data, error } =
//     await supabase.functions.invoke(
//         "create-user",
//         {
//             body: {
//                 email,
//                 password,
//                 full_name,
//                 role,
//             },
//         }
//     );
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
}

textarea {
    resize: vertical;
}

.media-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: .8rem 1rem;
    border-radius: 10px;
    cursor: pointer;
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

.upload-text {
    color: #6b7280;
    font-size: .9rem;
}

.media-btn {
    background: #14532d;
    color: white;
    border: none;
    padding: .8rem 1rem;
    border-radius: 10px;
    cursor: pointer;
}

.media-btn:hover {
    background: #166534;
}

.media-image.active {
    border-color: #14532d;
}

.remove-btn {
    margin-top: 1rem;
    background: #dc2626;
    color: white;
    border: none;
    padding: .8rem 1rem;
    border-radius: 10px;
    cursor: pointer;
}

.remove-btn:hover {
    background: #b91c1c;
}

.submit-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: .8;
}
</style>