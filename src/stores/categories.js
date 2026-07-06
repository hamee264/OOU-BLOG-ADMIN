import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) throw error
      categories.value = data || []
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, fetchCategories }
})
