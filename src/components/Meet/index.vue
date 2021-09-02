<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div :style="{ width: '90vw', maxWidth: '500px', border: '1px solid #ccc' }">
      <Peer
        username="rld"
        :media-stream="mediaStream"
      />
      <Toolbar />
    </div>
    <NButton
      type="primary"
      class="mt-5"
      @click="handleJoin"
    >
      加入会议
    </NButton>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, watchEffect, provide, onMounted, onUnmounted } from 'vue'
import { NButton, useMessage, useNotification } from 'naive-ui'
import { io } from 'socket.io-client'
import Toolbar from './Toolbar.vue'
import Peer from './Peer.vue'
import useSocket from './useSocket'
import { getUserMedia } from '@/utils/index'

type RemotePeer = {
  rtcPeerConnection: RTCPeerConnection,
  username?: string,
  stream?: MediaStream
}

type MeetStatus = 'preview' | 'meeting'

const props = defineProps<{
  type?: 'preview' | 'meeting',
  roomName?: string,
  userName?: string
}>()

const message = useMessage()
const notification = useNotification()
const status = ref<MeetStatus>('preview')
// 本地媒体流
const mediaStreamConstraints = ref<MediaStreamConstraints>({
  video: false,
  audio: true
})
const mediaStream = ref<MediaStream>()

// 远程RTC连接管理
const remotePeerMap = ref(new Map<string, RemotePeer>())
const createPeerConnection = (remoteUserId: string) => {
  const rtcPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'turn:' + 'webrtc-from-chat.glitch.me',  // A TURN server
        username: 'webrtc',
        credential: 'turnserver'
      }
    ]
  })

  rtcPeerConnection.addEventListener('signalingstatechange', () => {
    // console.log('当信令进程的状态更改时')
    // log(`ice信令状态：${rtcPeerConnection.signalingState}`)
  })

  rtcPeerConnection.addEventListener('iceconnectionstatechange', (event) => {
    // console.log(rtcPeerConnection.signalingState)
    // event.target.
    // log(`ice连接状态变更：${rtcPeerConnection.iceConnectionState}`)
  })

  rtcPeerConnection.addEventListener('icegatheringstatechange', () => {
    // console.log(`当ICE代理收集候选对象的过程从一个状态切换到另一个状态`)
    // log(`ice收集状态：${rtcPeerConnection.iceGatheringState}`)
  })

  rtcPeerConnection.addEventListener('negotiationneeded', async () => {
    // console.log(`需要重新进行媒体协商, ${dayjs().format('')}`)
    const offer = await rtcPeerConnection.createOffer()
    await rtcPeerConnection.setLocalDescription(offer)
    socket.emit('create-offer', remoteUserId, { sendId: socket.id, sendUserName: props.userName, sdp: rtcPeerConnection.localDescription })
  })

  rtcPeerConnection.addEventListener('track', event => {
    const stream = event.streams[0]
    const remotePeer = remotePeerMap.value.get(remoteUserId)!
    remotePeer.stream = stream
  })


  rtcPeerConnection.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
    console.log(event.candidate)
    if (event.candidate) {
      socket.emit('new-ice', {
        targetId: remoteUserId,
        ice: event.candidate
      })
    }
  })

  return rtcPeerConnection
}

const handleNewUser = (data: { userName: string, id: string }) => {
  if (data.id !== socket.id) {
    notification.info({
      content: '新用户',
      meta: `欢迎${data.userName}加入会议`,
      duration: 2000
    })
    // 与对等端建立
    const rtcPeerConnection = createPeerConnection(data.id)
    remotePeerMap.value.set(data.id, {
      rtcPeerConnection,
      username: data.userName
    })
    // 添加媒体源
    if (mediaStream.value && mediaStream.value.active) {
      mediaStream.value.getTracks().forEach(track => {
        rtcPeerConnection.addTrack(track, mediaStream.value!)
      })
    }
  }
}
const handleOffer = async (data: { sendId: string, sendUserName: string, sdp: RTCSessionDescriptionInit }) => {
  const { sendId, sendUserName, sdp } = data
  if (remotePeerMap.value.has(sendId)) {
    const { rtcPeerConnection } = remotePeerMap.value.get(sendId)!
    await rtcPeerConnection.setRemoteDescription(sdp)
    const answer = await rtcPeerConnection.createAnswer()
    await rtcPeerConnection.setLocalDescription(answer)
    socket.emit('create-answer', sendId, { sendId: socket.id, sendUserName: props.userName,  sdp: rtcPeerConnection.localDescription })
  } else {
    const rtcPeerConnection = createPeerConnection(sendId)
    remotePeerMap.value.set(sendId, {
      rtcPeerConnection: rtcPeerConnection,
      username: sendUserName
    })
    await rtcPeerConnection.setRemoteDescription(sdp)
    if (mediaStream.value && mediaStream.value.active) {
      mediaStream.value.getTracks().forEach(track => {
        rtcPeerConnection.addTrack(track, mediaStream.value!)
      })
    }
    const answer = await rtcPeerConnection.createAnswer()
    await rtcPeerConnection.setLocalDescription(answer)
    socket.emit('create-answer', sendId, { sendId: socket.id, sendUserName: props.userName, sdp: rtcPeerConnection.localDescription })
  }
}
const handleAnswer = async (data: { sendId: string, sendUserName: string, sdp: RTCSessionDescription }) => {
  if (remotePeerMap.value.has(data.sendId)) {
    const remotePeer = remotePeerMap.value.get(data.sendId)
    await remotePeer?.rtcPeerConnection.setRemoteDescription(data.sdp)
  }
}
const handleIceCandidate = (data: { sendId: string, sendUserName: string, ice: RTCIceCandidate }) => {
    if (remotePeerMap.value.has(data.sendId)) {
    const remotePeer = remotePeerMap.value.get(data.sendId)!
    remotePeer.rtcPeerConnection.addIceCandidate(data.ice)
  } else {
    console.log('没有rtc对象啊')
  }
}
const socket = useSocket({
  socketUrl: 'https://10.12.180.213:3001',
  on: {
    'new-user': handleNewUser,
    'create-offer': handleOffer,
    'create-answer': handleAnswer,
    'new-ice-candidate': handleIceCandidate
  }
})

// 媒体设备列表
const mediaDeviceList = ref<MediaDeviceInfo[]>([])

const cameraList = computed(() => {
  return mediaDeviceList.value.filter(item => item.kind === 'videoinput')
})
provide('cameraList', cameraList)

const micphoneList = computed(() => {
  return mediaDeviceList.value.filter(item => item.kind === 'audioinput')
})
provide('micphoneList', micphoneList)


const speakerList = computed(() => {
  return mediaDeviceList.value.filter(item => item.kind === 'audiooutput')
})
provide('speakerList', speakerList)

const handleJoin = () => {
  status.value = 'meeting'
  socket.emit('join', {
    userName: props.userName,
    roomName: props.roomName,
    id: socket.id
  })
}

onMounted(async () => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints.value)
    navigator.mediaDevices.enumerateDevices()
      .then(res => {
        mediaDeviceList.value = res.filter(item => item.deviceId)
        console.log(res)
      })
  } catch (error) {
  }
})

</script>
<style lang="">
  
</style>