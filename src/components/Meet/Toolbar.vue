<template>
  <div class="flex p-2">
    <div class="flex items-start">
      <NIcon
        size="40"
        class="cursor-pointer"
        @click="handleTurnVideo"
      >
        <Videocam v-if="video" />
        <VideocamOff v-else />
      </NIcon>
      <NPopover
        :show-arrow="false"
        trigger="click"
        placement="top"
      >
        <template #trigger>
          <NIcon
            size="10"
            class="ml-1 mt-1 cursor-pointer"
          >
            <ArrowDownOutline />
          </NIcon>
        </template>
        <div class="flex items-center mb-4">
          <NIcon size="24">
            <Videocam />
          </NIcon>
          摄像头
        </div>
        <div
          v-if="cameraList?.length"
          class="border-b-2 pb-4"
        >
          <NRadioGroup>
            <NSpace vertical>
              <NRadio
                v-for="camera in cameraList"
                :key="camera.deviceId"
              >
                {{ camera.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </div>
        <div class="pt-2">
          视频设置
        </div>
      </NPopover>
    </div>
    <div class="flex items-start ml-5">
      <NIcon
        size="40"
        class="cursor-pointer"
        @click="handleTurnAudio"
      >
        <Micphone v-if="audio" />
        <MicphoneOff v-else />
      </NIcon>
      <NPopover
        :show-arrow="false"
        trigger="click"
        placement="top"
      >
        <template #trigger>
          <NIcon
            size="10"
            class="ml-1 mt-1 cursor-pointer"
          >
            <ArrowDownOutline />
          </NIcon>
        </template>
        <div class="flex items-center mb-4">
          <NIcon size="20">
            <Micphone />
          </NIcon>
          麦克风
        </div>
        <div
          v-if="micphoneList?.length"
          class="border-b-2 pb-4"
        >
          <NRadioGroup>
            <NSpace vertical>
              <NRadio
                v-for="micphone in micphoneList"
                :key="micphone.deviceId"
              >
                {{ micphone.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </div>
        <div class="flex items-center mt-4">
          <NIcon size="24">
            <IosVolumeLow />
          </NIcon>
          扬声器
        </div>
        <div
          v-if="speakerList?.length"
          class="border-b-2 pb-4"
        >
          <NRadioGroup>
            <NSpace vertical>
              <NRadio
                v-for="speaker in speakerList"
                :key="speaker.deviceId"
              >
                {{ speaker.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </div>
        <div class="pt-2">
          音频设置
        </div>
      </NPopover>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineComponent, ref, inject, onMounted } from 'vue'
import { IosMore, IosVolumeLow } from '@vicons/ionicons4'
import { Mic as Micphone, MicOff as MicphoneOff, Videocam, VideocamOff, ArrowDownOutline } from '@vicons/ionicons5'
import { NIcon, NPopover, NRadioGroup, NRadio, NSpace } from 'naive-ui'

const video = ref(true)
const audio = ref(true)
const cameraList = inject<MediaDeviceInfo[]>('cameraList')
const micphoneList = inject<MediaDeviceInfo[]>('micphoneList')
const speakerList = inject<MediaDeviceInfo[]>('speakerList')

const handleTurnVideo = () => {
  video.value = !video.value
  // 通知父组件
}

const handleTurnAudio = () => {
  audio.value = !audio.value
  // 通知父组件
}

</script>
<style lang="">
  
</style>