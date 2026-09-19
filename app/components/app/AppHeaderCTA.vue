<script setup lang="ts">
const loading = ref(false)
const toast = useToast()

async function downloadPdf() {
  if (loading.value) {
    return
  }

  loading.value = true
  try {
    const response = await fetch('/api/documentation.pdf')
    if (!response.ok) {
      throw new Error('PDF request failed')
    }
    const pdf = await response.blob()
    const url = URL.createObjectURL(pdf)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nimble-construction-accounting-documentation.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
  catch {
    toast.add({
      title: 'Could not download PDF',
      description: 'Generate the file from the current documentation and try again.',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UButton
    icon="i-lucide-download"
    color="primary"
    variant="soft"
    size="sm"
    :loading="loading"
    class="hidden sm:inline-flex"
    @click="downloadPdf"
  >
    Download PDF
  </UButton>
  <UButton
    icon="i-lucide-download"
    color="primary"
    variant="ghost"
    square
    :loading="loading"
    class="sm:hidden"
    aria-label="Download PDF"
    @click="downloadPdf"
  />
</template>
