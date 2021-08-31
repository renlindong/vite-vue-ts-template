<template>
  <div class="header">
    <NInput
      class="room-name"
      :value="roomName"
      @input="() => setRoomName"
    />
    <NButton @click="handleJoin">
      加入房间
    </NButton>
    <NButton>离开房间</NButton>
    <NButton>打开摄像头</NButton>
    <NButton>关闭摄像头</NButton>
  </div>
  <div class="content">
    <VideoPlayer
      :title="`我：${socket.id}`"
      :media-stream="localMediaStream"
    />
    <VideoPlayer
      v-for="i in list"
      :key="i.key"
      :title="i.key"
      :media-stream="i.stream"
    />
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  computed
} from 'vue'
import { io } from 'socket.io-client'
import { NInput, NButton, useMessage } from 'naive-ui'
import { log } from '@/utils/index'
import VideoPlayer from '@/components/VideoPlayer.vue'

type RemotePeer = {
  rtc: RTCPeerConnection,
  ice: RTCIceCandidate[],
  stream?: MediaStream
}

const message = useMessage()
const roomName = ref('zed')
const localMediaStream = ref<MediaStream>()
const remotePeerMap = ref<Map<string, RemotePeer>>(new Map())
const socket = ref(io('https://10.12.180.213:3001'))

const setRoomName = (name: string) => {
  roomName.value = name
}

const list = computed(() => {
  const result: { key: string, stream?: MediaStream }[] = []
  remotePeerMap.value.forEach((item, key) => {
    result.push({
      key,
      stream: item.stream
    })
  })
  return result
})

const handleJoin = async () => {
  await getUserMedia()
  const name = roomName.value
  if (name === '') {
    message.warning('请输入房间名')
    return
  }
  socket.value.emit('join', roomName.value)
}

const getUserMedia = async () => {
  try {
    if (localMediaStream.value) {
      return
    }
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    localMediaStream.value = mediaStream
    // @ts-ignore
    window.testStream = mediaStream
  } catch (error) {
    message.warning('请打开摄像头一下权限')
  }
}

onMounted(async () => {
  try {
    await getUserMedia()
  } catch (error) {
    // message.warning("请打开一下权限")
  }
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})

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
    log(`ice信令状态：${rtcPeerConnection.signalingState}`)
  })

  rtcPeerConnection.addEventListener('iceconnectionstatechange', (event) => {
    // console.log(rtcPeerConnection.signalingState)
    // event.target.
    log(`ice连接状态变更：${rtcPeerConnection.iceConnectionState}`)
  })

  rtcPeerConnection.addEventListener('icegatheringstatechange', () => {
    // console.log(`当ICE代理收集候选对象的过程从一个状态切换到另一个状态`)
    log(`ice收集状态：${rtcPeerConnection.iceGatheringState}`)
  })

  rtcPeerConnection.addEventListener('negotiationneeded', async () => {
    // console.log(`需要重新进行媒体协商, ${dayjs().format('')}`)
    log('需要重新进行媒体协商')
    const offer = await rtcPeerConnection.createOffer()
    await rtcPeerConnection.setLocalDescription(offer)
    socket.value.emit('create-offer', { targetId: remoteUserId, sdp: rtcPeerConnection.localDescription })
  })

  rtcPeerConnection.addEventListener('track', event => {
    // console.log('有了啊')
    const stream = event.streams[0]
    const remotePeer = remotePeerMap.value.get(remoteUserId)!
    remotePeer.stream = stream
  })


  rtcPeerConnection.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
    console.log(event.candidate)
    if (event.candidate) {
      socket.value.emit('new-ice', {
        targetId: remoteUserId,
        ice: event.candidate
      })
    }
  })

  return rtcPeerConnection
}

socket.value.on('new-user', async (data) => {
  message.info(data.msg)
  const { user } = data
  if (user.id !== socket.value.id && localMediaStream.value && localMediaStream.value.active) {
    // 由已在房间内部的人员，发起邀请
    const rtcPeerConnection = createPeerConnection(user.id)
    // @ts-ignore
    window.testP = rtcPeerConnection
    remotePeerMap.value.set(user.id, {
      rtc: rtcPeerConnection,
      ice: []
    })
    if (localMediaStream.value) {
      localMediaStream.value.getTracks().forEach(track => {
        rtcPeerConnection.addTrack(track, localMediaStream.value!)
      })
    }
  }
})

socket.value.on('create-offer', async (data: { originId: string, sdp: string }) => {
  const { originId, sdp } = data
  if (remotePeerMap.value.has(originId)) {
    const { rtc } = remotePeerMap.value.get(originId)!
    // @ts-ignore
    await rtc.setRemoteDescription(sdp)
    const answer = await rtc.createAnswer()
    await rtc.setLocalDescription(answer)
    socket.value.emit('create-answer', { targetId: originId, sdp: rtc.localDescription })
  } else {
    const rtcPeerConnection = createPeerConnection(originId)
    remotePeerMap.value.set(originId, {
      rtc: rtcPeerConnection,
      ice: []
    })
    // @ts-ignore
    await rtcPeerConnection.setRemoteDescription(sdp)
    if (localMediaStream.value) {
      localMediaStream.value.getTracks().forEach(track => {
        rtcPeerConnection.addTrack(track, localMediaStream.value!)
      })
    }
    const answer = await rtcPeerConnection.createAnswer()
    await rtcPeerConnection.setLocalDescription(answer)
    socket.value.emit('create-answer', { targetId: originId, sdp: rtcPeerConnection.localDescription })
  }
})

socket.value.on('create-answer', async (data: { originId: string, sdp: string }) => {
  if (remotePeerMap.value.has(data.originId)) {
    const remotePeer = remotePeerMap.value.get(data.originId)!
    // @ts-ignore
    await remotePeer.rtc.setRemoteDescription(new RTCSessionDescription(data.sdp))
  }
})

socket.value.on('new-ice', async (data: { originId: string, ice: string }) => {
  if (remotePeerMap.value.has(data.originId)) {
    // console.log(`收到来自：${data.originId}的ice：${data.ice}`)
    const remotePeer = remotePeerMap.value.get(data.originId)!
    // @ts-ignore
    remotePeer.rtc.addIceCandidate(data.ice)
  } else {
    console.log('没有rtc对象啊')
  }
})
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
