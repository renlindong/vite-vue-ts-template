<template>
  <div class="w-full h-full">
    <InfoQuestion
      v-if="!hasBaseInfo"
      :room-name="roomName"
      :user-name="userName"
      :on-ok="handleConfirm"
    />
    <Meet />
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

// 音频、视频配置


// type RemotePeer = {
//   rtc: RTCPeerConnection,
//   ice: RTCIceCandidate[],
//   stream?: MediaStream
// }

// const message = useMessage()
// const roomName = ref('zed')
// const localMediaStream = ref<MediaStream>()
// const remotePeerMap = ref<Map<string, RemotePeer>>(new Map())
// const socket = ref(io('https://10.12.180.213:3001'))

// const setRoomName = (name: string) => {
//   roomName.value = name
// }

// const list = computed(() => {
//   const result: { key: string, stream?: MediaStream }[] = []
//   remotePeerMap.value.forEach((item, key) => {
//     result.push({
//       key,
//       stream: item.stream
//     })
//   })
//   return result
// })

// const handleJoin = async () => {
//   await getUserMedia()
//   const name = roomName.value
//   if (name === '') {
//     message.warning('请输入房间名')
//     return
//   }
//   socket.value.emit('join', roomName.value)
// }

// const getUserMedia = async () => {
//   try {
//     if (localMediaStream.value) {
//       return
//     }
//     const mediaStream = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: true
//     })
//     localMediaStream.value = mediaStream
//     // @ts-ignore
//     window.testStream = mediaStream
//     return mediaStream
//   } catch (error) {
//     message.warning('请打开摄像头一下权限')
//   }
// }

// onMounted(async () => {
//   try {
//     await getUserMedia()
//     const audioContext = new AudioContext()
//     const mediaStreamSource = audioContext.createMediaStreamSource(localMediaStream.value!)
//     const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1)
//     scriptProcessor.addEventListener('audioprocess', (event) => {
//       const input = event.inputBuffer.getChannelData(0)
//       let sum = 0.0
//       for (let i = 0; i < input.length; i++) {
//         sum += input[i] * input[i]
//       }
//       const volume = Math.round(Math.sqrt(sum / input.length) * 100)
//       // console.log(volume)
//     })
//     scriptProcessor.connect(audioContext.destination)
//     mediaStreamSource.connect(scriptProcessor)
//   } catch (error) {
//     // message.warning("请打开一下权限")
//   }
// })

// onUnmounted(() => {
//   if (socket.value) {
//     socket.value.disconnect()
//   }
// })

// const createPeerConnection = (remoteUserId: string) => {
//   const rtcPeerConnection = new RTCPeerConnection({
//     iceServers: [
//       {
//         urls: 'turn:' + 'webrtc-from-chat.glitch.me',  // A TURN server
//         username: 'webrtc',
//         credential: 'turnserver'
//       }
//     ]
//   })

//   rtcPeerConnection.addEventListener('signalingstatechange', () => {
//     // console.log('当信令进程的状态更改时')
//     log(`ice信令状态：${rtcPeerConnection.signalingState}`)
//   })

//   rtcPeerConnection.addEventListener('iceconnectionstatechange', (event) => {
//     // console.log(rtcPeerConnection.signalingState)
//     // event.target.
//     log(`ice连接状态变更：${rtcPeerConnection.iceConnectionState}`)
//   })

//   rtcPeerConnection.addEventListener('icegatheringstatechange', () => {
//     // console.log(`当ICE代理收集候选对象的过程从一个状态切换到另一个状态`)
//     log(`ice收集状态：${rtcPeerConnection.iceGatheringState}`)
//   })

//   rtcPeerConnection.addEventListener('negotiationneeded', async () => {
//     // console.log(`需要重新进行媒体协商, ${dayjs().format('')}`)
//     log('需要重新进行媒体协商')
//     const offer = await rtcPeerConnection.createOffer()
//     await rtcPeerConnection.setLocalDescription(offer)
//     socket.value.emit('create-offer', { targetId: remoteUserId, sdp: rtcPeerConnection.localDescription })
//   })

//   rtcPeerConnection.addEventListener('track', event => {
//     // console.log('有了啊')
//     const stream = event.streams[0]
//     const remotePeer = remotePeerMap.value.get(remoteUserId)!
//     remotePeer.stream = stream
//   })


//   rtcPeerConnection.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
//     console.log(event.candidate)
//     if (event.candidate) {
//       socket.value.emit('new-ice', {
//         targetId: remoteUserId,
//         ice: event.candidate
//       })
//     }
//   })

//   return rtcPeerConnection
// }

// socket.value.on('new-user', async (data) => {
//   message.info(data.msg)
//   const { user } = data
//   if (user.id !== socket.value.id && localMediaStream.value && localMediaStream.value.active) {
//     // 由已在房间内部的人员，发起邀请
//     const rtcPeerConnection = createPeerConnection(user.id)
//     // @ts-ignore
//     window.testP = rtcPeerConnection
//     remotePeerMap.value.set(user.id, {
//       rtc: rtcPeerConnection,
//       ice: []
//     })
//     if (localMediaStream.value) {
//       localMediaStream.value.getTracks().forEach(track => {
//         rtcPeerConnection.addTrack(track, localMediaStream.value!)
//       })
//     }
//   }
// })

// socket.value.on('create-offer', async (data: { originId: string, sdp: string }) => {
//   const { originId, sdp } = data
//   if (remotePeerMap.value.has(originId)) {
//     const { rtc } = remotePeerMap.value.get(originId)!
//     // @ts-ignore
//     await rtc.setRemoteDescription(sdp)
//     const answer = await rtc.createAnswer()
//     await rtc.setLocalDescription(answer)
//     socket.value.emit('create-answer', { targetId: originId, sdp: rtc.localDescription })
//   } else {
//     const rtcPeerConnection = createPeerConnection(originId)
//     remotePeerMap.value.set(originId, {
//       rtc: rtcPeerConnection,
//       ice: []
//     })
//     // @ts-ignore
//     await rtcPeerConnection.setRemoteDescription(sdp)
//     if (localMediaStream.value) {
//       localMediaStream.value.getTracks().forEach(track => {
//         rtcPeerConnection.addTrack(track, localMediaStream.value!)
//       })
//     }
//     const answer = await rtcPeerConnection.createAnswer()
//     await rtcPeerConnection.setLocalDescription(answer)
//     socket.value.emit('create-answer', { targetId: originId, sdp: rtcPeerConnection.localDescription })
//   }
// })

// socket.value.on('create-answer', async (data: { originId: string, sdp: string }) => {
//   if (remotePeerMap.value.has(data.originId)) {
//     const remotePeer = remotePeerMap.value.get(data.originId)!
//     // @ts-ignore
//     await remotePeer.rtc.setRemoteDescription(new RTCSessionDescription(data.sdp))
//   }
// })

// socket.value.on('new-ice', async (data: { originId: string, ice: string }) => {
//   if (remotePeerMap.value.has(data.originId)) {
//     // console.log(`收到来自：${data.originId}的ice：${data.ice}`)
//     const remotePeer = remotePeerMap.value.get(data.originId)!
//     // @ts-ignore
//     remotePeer.rtc.addIceCandidate(data.ice)
//   } else {
//     console.log('没有rtc对象啊')
//   }
// })
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
