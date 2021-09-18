<template>
  <div class="w-full h-full flex justify-center items-center">
    <NCard
      title="填点信息呗"
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <NInput
        v-model:value="question.roomName"
        placeholder="房间名"
      />
      <NInput
        v-model:value="question.userName"
        placeholder="用户名"
        class="mt-5"
      />
      <NButton
        type="primary"
        size="large"
        class="w-full mt-5"
        :disabled="!question.roomName || !question.userName"
        @click="handleConfirm"
      >
        确定
      </NButton>
    </NCard>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { NCard, NInput, NButton } from 'naive-ui'

type Question = {
  roomName: string,
  userName: string
}

const props = defineProps<{
  roomName: string,
  userName: string
}>()

const emits = defineEmits<{
  (event: 'ok', data: Question): unknown
}>()



const question = ref({
  roomName: props.roomName || '',
  userName: props.userName || ''
})

const handleConfirm = () => {
  emits('ok', question.value)
}

</script>
<style lang="">
  
</style>