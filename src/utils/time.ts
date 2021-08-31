import dayjs from 'dayjs'

export const formatDate = (time: any, formatType = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(time).format(formatType)
}

export const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, delay)
  })
}
