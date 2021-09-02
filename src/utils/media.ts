export const getUserMedia = async(constraints?: MediaStreamConstraints) => {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints || { video: true, audio: true })
  } catch (error) {
    console.log(error)
  }
}