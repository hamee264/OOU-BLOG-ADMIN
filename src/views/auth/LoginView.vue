<template>
    <div class="login-page">
        <div class="login-card">
            <div class="brand">
                <h1>OOU Chronicle CMS</h1>
                <p>
                    Sign in to manage articles, categories, media and users.
                </p>
            </div>

            <form @submit.prevent="onLogin">
                <div class="form-group">
                    <label>Email Address</label>
                    <input v-model="email" type="email" placeholder="Enter your email" required />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model="password" type="password" placeholder="Enter your password" required />
                </div>

                <button type="submit" :disabled="loading">
                    {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>
            </form>

            <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const auth = useAuthStore()

async function onLogin() {
    try {
        loading.value = true
        errorMessage.value = ''

        await auth.login(
            email.value,
            password.value
        )

        router.push('/dashboard')
    } catch (error) {
        errorMessage.value =
            error.message || 'Failed to sign in'
    } finally {
        loading.value = false
    }
    console.log('USER:', user)
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f8fafc;
}

.login-card {
    width: 100%;
    max-width: 460px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 3rem;
}

.brand {
    margin-bottom: 2rem;
}

.brand h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
}

.brand p {
    color: #6b7280;
    line-height: 1.6;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.25rem;
}

.form-group label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
}

.form-group input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
    transition: 0.2s ease;
}

.form-group input:focus {
    border-color: #14532d;
}

button {
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 0.5rem;
    background: #14532d;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease;
}

button:hover {
    background: #166534;
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error-message {
    margin-top: 1rem;
    color: #dc2626;
    font-size: 0.9rem;
}
</style>