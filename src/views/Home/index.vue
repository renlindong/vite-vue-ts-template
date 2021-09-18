<template>
  <div class="w-full h-full">
    <InfoQuestion
      v-if="!hasBaseInfo"
      :room-name="roomName"
      :user-name="userName"
      @ok="handleConfirm"
    />
    <Meet
      v-if="hasBaseInfo"
      type="preview"
      :room-name="roomName"
      :user-name="userName"
    />
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  watch,
  computed,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InfoQuestion from '@/components/InfoQuestion/index.vue'
import Meet from '@/components/Meet/index.vue'

// 基本信息
const route = useRoute()
const router = useRouter()
const defaultRoomName = route.query.roomName || ''
const defaultUsername = localStorage.getItem('username') || ''

const roomName = ref<string>(defaultRoomName as string)
watch(roomName, (newVal) => {
  router.push({ name: 'home', query: { ...route.query, roomName: newVal }})
})

const userName = ref(defaultUsername)
watch(userName, (newVal) => {
  localStorage.setItem('username', newVal)
})

const hasBaseInfo = computed(() => {
  return roomName.value && userName.value
})

const handleConfirm = (data: { roomName: string, userName: string }) => {
  userName.value = data.userName
  roomName.value = data.roomName
}

</script>

<style lang="less">
.header {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  .room-name {
    width: 200px;
  }
  button {
    margin-left: 20px;
  }
}

.content {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  .player {
    margin-left: 20px;
  }
}
</style>
