<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NMessageProvider, NNotificationProvider } from 'naive-ui'
</script>

<template>
  <NMessageProvider>
    <NNotificationProvider>
      <RouterView />
    </NNotificationProvider>
  </NMessageProvider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
}

html, body {
  width: 100%;
  height: 100%;
}
</style>
