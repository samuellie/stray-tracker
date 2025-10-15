import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatRelativeDate(date: string | Date | number): string {
  return dayjs(date).fromNow()
}
