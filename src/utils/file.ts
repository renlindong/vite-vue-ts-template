export const downloadFromUrl = (url: string, filename = '') => {
  // const url = URL.createObjectURL(record.data)
  // const filename = `${formatDate(record.startTime)} - ${formatDate(record.endTime)}.mp4`
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
