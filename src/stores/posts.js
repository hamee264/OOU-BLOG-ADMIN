import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const loading = ref(false)

  async function fetchPosts() {
    loading.value = true
    try {
      const { data, error } = await supabase.from('posts').select('*')
      if (error) throw error
      posts.value = data || []
    } finally {
      loading.value = false
    }
  }

  return { posts, loading, fetchPosts }
})
