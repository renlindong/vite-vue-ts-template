import dayjs from 'dayjs'
import { formatDate } from './time'

export const log = (content: string) => {
  console.log(`${formatDate(dayjs())}：${content}`)
}
