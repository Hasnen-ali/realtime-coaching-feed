'use client';

import { Check, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import FeedCard from '../../components/FeedCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { createFeed } from '../../lib/api.js';

const createTempFeed = ({ title, description, clientRequestId }) => ({
  _id: clientRequestId,
  title,
  description,
  createdAt: new Date().toISOString(),
  optimistic: true
});

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pendingFeeds, setPendingFeeds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValid = useMemo(
    () => title.trim().length >= 3 && description.trim().length >= 5,
    [description, title]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid || submitting) return;

    const clientRequestId = crypto.randomUUID();
    const payload = {
      title: title.trim(),
      description: description.trim(),
      clientRequestId
    };
    const optimisticFeed = createTempFeed(payload);

    setPendingFeeds((current) => [optimisticFeed, ...current]);
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const savedFeed = await createFeed(payload);
      setPendingFeeds((current) =>
        current.map((feed) => (feed._id === clientRequestId ? savedFeed : feed))
      );
      setTitle('');
      setDescription('');
      setSuccess('Feed published to all connected clients.');
    } catch (submitError) {
      setPendingFeeds((current) => current.filter((feed) => feed._id !== clientRequestId));
      setError(submitError.response?.data?.message ?? 'Unable to publish this feed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase text-coral">Admin Console</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal text-ink sm:text-3xl">
              Publish a coaching update
            </h1>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                className="rounded-md border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Quarterback footwork reset"
                value={title}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                className="min-h-40 resize-y rounded-md border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
                maxLength={1200}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write the coaching note clients should see instantly."
                value={description}
              />
            </label>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <Check size={16} />
                <span>{success}</span>
              </div>
            ) : null}

            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || submitting}
              type="submit"
            >
              {submitting ? (
                <LoadingSpinner className="text-white" label="Publishing" />
              ) : (
                <Send size={17} />
              )}
              {!submitting ? 'Publish update' : null}
            </button>
          </form>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Recent admin submissions</h2>
          <div className="mt-4 grid gap-4">
            {pendingFeeds.length ? (
              pendingFeeds.map((feed) => (
                <div className={feed.optimistic ? 'opacity-70' : ''} key={feed._id}>
                  <FeedCard feed={feed} />
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                New submissions will appear here immediately while they publish.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
