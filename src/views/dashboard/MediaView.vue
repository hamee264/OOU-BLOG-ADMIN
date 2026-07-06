<template>
    <div class="media-page">

        <div class="page-header">
            <div>
                <h1>Media Library</h1>
                <p>
                    Upload and manage images.
                    ({{ images.length }} image{{ images.length !== 1 ? 's' : '' }})
                </p>
            </div>
        </div>

        <div class="upload-box">
            <input type="file" accept="image/*" @change="handleFileSelect" />

            <button class="upload-btn" @click="uploadImage" :disabled="!selectedFile || uploading">
                {{ uploading ? 'Uploading...' : 'Upload Image' }}
            </button>
        </div>

        <div v-if="loadingImages" class="empty-state">
            Loading images...
        </div>

        <div v-else-if="images.length" class="images-grid">
            <div class="image-card" v-for="image in images" :key="image.name">
                <img :src="image.url" :alt="image.name" @click="openImage(image.url)" />

                <div class="image-info">
                    <p>{{ image.name }}</p>

                    <div class="actions">

                        <button class="copy-btn" @click="copyUrl(image.url)">
                            Copy URL
                        </button>

                        <button class="delete-btn" @click="deleteImage(image.name)">
                            Delete
                        </button>

                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            No images uploaded yet.
        </div>

    </div>
</template>

<script setup>
import {
    ref,
    onMounted
} from 'vue'
import { supabase } from '@/lib/supabase'

const selectedFile = ref(null)
const uploading = ref(false)
const loadingImages = ref(false)

const images = ref([])

function handleFileSelect(event) {
    selectedFile.value =
        event.target.files[0]
}

async function uploadImage() {
    if (!selectedFile.value) return

    uploading.value = true

    const file = selectedFile.value

    const fileName =
        `${Date.now()}-${file.name}`

    const { error } = await supabase
        .storage
        .from('post-images')
        .upload(
            fileName,
            file,
            {
                upsert: true
            }
        )

    uploading.value = false

    if (error) {
        alert(error.message)
        return
    }

    selectedFile.value = null

    alert('Image uploaded successfully')

    await fetchImages()
}

async function fetchImages() {
    loadingImages.value = true

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

    loadingImages.value = false

    if (error) {
        console.error(error)
        return
    }

    images.value = data.map(file => {
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

async function deleteImage(fileName) {
    const confirmed =
        confirm(
            'Delete this image?'
        )

    if (!confirmed) return

    const { error } =
        await supabase
            .storage
            .from('post-images')
            .remove([fileName])

    if (error) {
        alert(error.message)
        return
    }

    alert('Image deleted')

    await fetchImages()
}

async function copyUrl(url) {
    await navigator.clipboard
        .writeText(url)

    alert('URL copied')
}

function openImage(url) {
    window.open(url, '_blank')
}

onMounted(() => {
    fetchImages()
})
</script>

<style scoped>
.media-page {
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

.upload-box {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.upload-btn {
    border: none;
    background: #14532d;
    color: white;
    padding: .9rem 1.2rem;
    border-radius: 10px;
    cursor: pointer;
}

.upload-btn:hover {
    background: #166534;
}

.upload-btn:disabled {
    opacity: .7;
    cursor: not-allowed;
}

.images-grid {
    display: grid;
    grid-template-columns:
        repeat(auto-fill,
            minmax(250px, 1fr));
    gap: 1.5rem;
}

.image-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
}

.image-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    cursor: pointer;
}

.image-info {
    padding: 1rem;
}

.image-info p {
    margin: 0 0 1rem;
    word-break: break-word;
}

.actions {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
}

.copy-btn,
.delete-btn {
    border: none;
    color: white;
    padding: .6rem .8rem;
    border-radius: 8px;
    cursor: pointer;
}

.copy-btn {
    background: #2563eb;
}

.copy-btn:hover {
    background: #1d4ed8;
}

.delete-btn {
    background: #dc2626;
}

.delete-btn:hover {
    background: #b91c1c;
}

.empty-state {
    text-align: center;
    padding: 4rem;
    color: #6b7280;
}

@media (max-width: 768px) {
    .upload-box {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>