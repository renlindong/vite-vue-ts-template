<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div :style="{ width: '90vw', maxWidth: '500px', border: '1px solid #ccc' }">
      <Toolbar />
    </div>
    <NButton
      type="primary"
      class="mt-5"
    >
      加入会议
    </NButton>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton } from 'naive-ui'
import Toolbar from './Toolbar.vue'

const props = defineProps<{
  type?: 'preview' | 'meeting'
}>()

</script>
<style lang="">
  
</style>