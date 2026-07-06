<template>
    <div class="settings-page">
        <div class="page-header">
            <h1>Settings</h1>
            <p>Manage your account and website settings.</p>
        </div>

        <!-- Admin Account -->
        <div class="card">
            <h2>Current Admin</h2>

            <div class="info-row">
                <span>Name</span>
                <strong>
                    {{
                        auth.user?.user_metadata?.full_name ||
                        'Admin User'
                    }}
                </strong>
            </div>

            <div class="info-row">
                <span>Email</span>
                <strong>
                    {{ auth.user?.email }}
                </strong>
            </div>

            <div class="info-row">
                <span>Role</span>
                <strong>
                    {{ auth.role || 'admin' }}
                </strong>
            </div>

            <button class="logout-btn" @click="logout">
                Logout
            </button>
        </div>

        <!-- Site Information -->
        <div class="card">
            <div class="card-header">
                <h2>Site Information</h2>

                <button class="edit-btn" @click="showForm = !showForm">
                    {{
                        showForm
                            ? 'Close'
                            : 'Edit Site Information'
                    }}
                </button>
            </div>

            <div v-if="!showForm">
                <div class="info-row">
                    <span>Site Name</span>
                    <strong>
                        {{ siteName || 'Not set' }}
                    </strong>
                </div>

                <div class="info-row">
                    <span>Description</span>
                    <strong>
                        {{ siteDescription || 'Not set' }}
                    </strong>
                </div>

                <div class="info-row">
                    <span>Logo URL</span>
                    <strong>
                        {{ logoUrl || 'Not set' }}
                    </strong>
                </div>

                <div class="info-row">
                    <span>Contact Email</span>
                    <strong>
                        {{ contactEmail || 'Not set' }}
                    </strong>
                </div>

                <div class="info-row">
                    <span>Footer Text</span>
                    <strong>
                        {{ footerText || 'Not set' }}
                    </strong>
                </div>
            </div>

            <form v-else class="settings-form" @submit.prevent="saveSettings">
                <div class="form-group">
                    <label>Site Name</label>
                    <input v-model="siteName" type="text" />
                </div>

                <div class="form-group">
                    <label>Site Description</label>
                    <textarea v-model="siteDescription" rows="3" />
                </div>

                <div class="form-group">
                    <label>Logo URL</label>
                    <input v-model="logoUrl" type="text" />
                </div>

                <div class="form-group">
                    <label>Contact Email</label>
                    <input v-model="contactEmail" type="email" />
                </div>

                <div class="form-group">
                    <label>Footer Text</label>
                    <input v-model="footerText" type="text" />
                </div>

                <button class="save-btn" :disabled="loading">
                    {{
                        loading
                            ? 'Saving...'
                            : 'Save Settings'
                    }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const showForm = ref(false)
const settingsId = ref(null)

const siteName = ref('')
const siteDescription = ref('')
const logoUrl = ref('')
const contactEmail = ref('')
const footerText = ref('')

async function fetchSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle()

    console.log('SETTINGS:', data)

    if (error) {
        console.error(error)
        return
    }

    if (!data) return

    settingsId.value = data.id

    siteName.value =
        data.site_name || ''

    siteDescription.value =
        data.site_description || ''

    logoUrl.value =
        data.logo_url || ''

    contactEmail.value =
        data.contact_email || ''

    footerText.value =
        data.footer_text || ''
}

async function saveSettings() {
    if (!settingsId.value) {
        alert('Settings record not found.')
        return
    }

    loading.value = true

    console.log('SETTINGS ID:', settingsId.value)

    const payload = {
        site_name: siteName.value,
        site_description: siteDescription.value,
        logo_url: logoUrl.value,
        contact_email: contactEmail.value,
        footer_text: footerText.value,
        updated_at: new Date().toISOString()
    }

    console.log('PAYLOAD:', payload)

    const { data, error } = await supabase
        .from('settings')
        .update(payload)
        .eq('id', settingsId.value)
        .select()

    console.log('UPDATE DATA:', data)
    console.log('UPDATE ERROR:', error)

    loading.value = false

    if (error) {
        alert(error.message)
        return
    }

    alert('Settings saved successfully')

    showForm.value = false

    await fetchSettings()
}

async function logout() {
    await auth.signOut()
    router.push('/login')
}

onMounted(() => {
    fetchSettings()
})
</script>

<style scoped>
.settings-page {
    max-width: 900px;
}

.page-header {
    margin-bottom: 2rem;
}

.card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.settings-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

input,
textarea {
    padding: .9rem;
    border: 1px solid #d1d5db;
    border-radius: 10px;
}

.save-btn,
.edit-btn,
.logout-btn {
    border: none;
    color: white;
    padding: .9rem 1.2rem;
    border-radius: 10px;
    cursor: pointer;
}

.save-btn {
    background: #14532d;
}

.edit-btn {
    background: #2563eb;
}

.logout-btn {
    background: #dc2626;
    margin-top: 1.5rem;
}

.save-btn:hover {
    background: #166534;
}

.edit-btn:hover {
    background: #1d4ed8;
}

.logout-btn:hover {
    background: #b91c1c;
}

@media (max-width: 768px) {

    .card-header,
    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: .5rem;
    }
}
</style>