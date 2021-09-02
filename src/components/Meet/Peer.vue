<template>
  <div
    :style="{ width: '500px', height: '375px' }"
    class="peer-container"
  >
    <video
      autoplay
      playsinline
      :srcObject="mediaStream"
    />
    <div class="text-white text-center text-3xl">
      {{ username }}
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  username?: string,
  mediaStream?: MediaStream
}>()

</script>
<style lang="less">
.peer-container {
  background-color: rgb(31, 45, 61);
}
</style>