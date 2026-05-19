import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function FeedCard({ feed }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold leading-snug text-ink">{feed.title}</h2>
        <time className="shrink-0 text-sm font-medium text-slate-500">
          {dayjs(feed.createdAt).fromNow()}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{feed.description}</p>
    </article>
  );
}
