<template>
  <div class="player">
    <div class="player-title">
      {{ title }}
    </div>
    <div class="player-content">
      <video
        ref="videoRef"
        autoplay
        playsinline
        :srcObject="mediaStream"
      />
    </div>
    <div class="player-footer">
      <NButton @click="handleCapture">
        截图
      </NButton>
      <NButton @click="handleStartRecord">
        录制
      </NButton>
      <NButton @click="handleStopRecord">
        停止录制
      </NButton>
      <NButton @click="handlePlay">
        播放
      </NButton>
    </div>
    <div class="player-record-list">
      <div>录制状态：{{ startRecordTime === 0 ? '闲置中' : '录制中' }}</div>
      <!--       
      this.recordList.map(record => (
      <div
        key="{record.startTime}"
        class="player-record-list__item"
      >
        <span>{formatDate(record.startTime)} - {formatDate(record.endTime)}</span>
        <NButton>
          this.handleDownload(record)}>下载
        </NButton>
      </div>
      ))-->
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { NButton } from 'naive-ui'

import { formatDate, downloadFromUrl } from '@/utils/index'

type Record = {
  startTime: number,
  endTime: number,
  data: Blob
}

defineProps<{
  title: string,
  mediaStream?: MediaStream
}>()

const stream = ref<MediaStream>()
const startRecordTime = ref(0)
const mediaRecorder = ref<MediaRecorder>()
const recordList = ref<Record[]>([])
const videoRef = ref<HTMLVideoElement | null>(null)
// const mediaStream = ref(props.mediaStream)
// watchEffect(() => {
//   stream.value = props.mediaStream
// })

const handleCapture = () => { }

const handleRecordData = (event: BlobEvent) => {
  const now = new Date().getTime()
  const { data } = event
  recordList.value.push({
    data,
    startTime: startRecordTime.value,
    endTime: now
  })
  startRecordTime.value = 0
}
const handleStartRecord = () => {
  if (stream.value && stream.value.active) {
    if (!mediaRecorder.value) {
      mediaRecorder.value = new MediaRecorder(stream.value)
      mediaRecorder.value.addEventListener('dataavailable', handleRecordData)
    }
    if (mediaRecorder.value.state !== 'recording') {
      mediaRecorder.value.start()
      startRecordTime.value = new Date().getTime()
    }
  }
}
const handleStopRecord = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
  }
}

const handlePlay = () => {
  videoRef.value?.play()
}

const handleDownload = (record: Record) => {
  const url = URL.createObjectURL(record.data)
  const filename = `${formatDate(record.startTime)} - ${formatDate(record.endTime)}.mp4`
  downloadFromUrl(url, filename)
}

</script>
<style lang="less">
.player {
  width: 400px;
  border: 1px solid #ccc;
  &-title {
    padding: 10px 0;
    text-align: center;
    border-bottom: 1px solid #ccc;
  }
  &-content {
    padding: 5px 10px;
    video {
      width: 100%;
      height: 300px;
    }
  }
  &-footer {
    display: flex;
    justify-content: center;
    padding: 10px 0;
    border-top: 1px solid;
    button {
      margin-left: 10px;
    }
  }
  &-record-list {
    border-top: 1px solid #ccc;
    padding: 5px 10px;
    &__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
    }
  }
}
</style>