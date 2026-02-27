import { formatDistanceToNowStrict } from 'date-fns';

export function TimeAgo({ date }: { date: string }) {
  const d = formatDistanceToNowStrict(new Date(date), { addSuffix: true });
  return <span title={new Date(date).toLocaleString()}>{d}</span>;
}
