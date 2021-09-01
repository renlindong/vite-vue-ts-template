<template>
  <div class="flex">
    <div class="flex items-start">
      <NIcon size="40">
        <Videocam />
      </NIcon>
      <NPopover :show-arrow="false">
        <template #trigger>
          <NIcon
            size="10"
            class="ml-1 mt-1 cursor-pointer"
          >
            <ArrowDownOutline />
          </NIcon>
        </template>
        <div>1234</div>
      </NPopover>
    </div>
    <div class="flex items-start">
      <NIcon size="40">
        <Micphone />
      </NIcon>
      <NPopover :show-arrow="false">
        <template #trigger>
          <NIcon
            size="10"
            class="ml-1 mt-1 cursor-pointer"
          >
            <ArrowDownOutline />
          </NIcon>
        </template>
        <div>123</div>
      </NPopover>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { IosMore } from '@vicons/ionicons4'
import { Mic as Micphone, MicOff as MicphoneOff, Videocam, VideocamOff, ArrowDownOutline } from '@vicons/ionicons5'
import { NIcon, NPopover } from 'naive-ui'

export default defineComponent({
  components: {
    NPopover,
    NIcon,
    Micphone,
    Videocam,
    ArrowDownOutline
  },
  setup() {
    const cameraList = ref<MediaDeviceInfo[]>([])
    const micphoneList = ref<MediaDeviceInfo[]>([])
    const speakers = ref<MediaDeviceInfo[]>([])

    onMounted(() => {
      navigator.mediaDevices.enumerateDevices()
        .then(res => {
          cameraList.value = res.filter(item => item.kind === 'videoinput')
          micphoneList.value = res.filter(item => item.kind === 'audioinput')
          speakers.value = res.filter(item => item.kind === 'audiooutput')
        })
    })

    return {}
  }
})

</script>
<style lang="">
  
</style>