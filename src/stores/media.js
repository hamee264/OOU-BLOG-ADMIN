import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMediaStore = defineStore('media', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchMedia() {
    loading.value = true
    try {
      const { data, error } = await supabase.from('media').select('*')
      if (error) throw error
      items.value = data || []
    } finally {
      loading.value = false
    }
  }

  return { items, loading, fetchMedia }
})
