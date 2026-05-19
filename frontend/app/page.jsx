'use client';

import { Activity, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FeedCard from '../components/FeedCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ReconnectBanner from '../components/ReconnectBanner.jsx';
import { fetchFeeds } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';

const mergeNewestFirst = (incoming, current) => {
  const map = new Map();

  [...incoming, ...current].forEach((feed) => {
    if (feed?._id) map.set(feed._id, feed);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export default function HomePage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const loadFeeds = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchFeeds();
      setFeeds((current) => mergeNewestFirst(data, current));
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.message ?? 'Unable to load the coaching feed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFeeds();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeeds]);

  useEffect(() => {
    const socket = getSocket();

    const handleCreated = (feed) => {
      setFeeds((current) => mergeNewestFirst([feed], current));
    };

    const handleConnect = () => {
      setConnectionStatus('connected');
      loadFeeds({ silent: true });
    };

    const handleDisconnect = () => {
      setConnectionStatus('reconnecting');
    };

    socket.on('connect', handleConnect);
    socket.on('reconnect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('feed:created', handleCreated);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('feed:created', handleCreated);
    };
  }, [loadFeeds]);

  const hasFeeds = useMemo(() => feeds.length > 0, [feeds.length]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-mint">
              <Activity size={17} />
              Live Coaching Feed
            </div>
            <h1 className="text-2xl font-bold tracking-normal text-ink sm:text-3xl">
              Latest coaching updates
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <ReconnectBanner status={connectionStatus} />
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link
                className="inline-flex items-center justify-center rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                href="/admin"
              >
                Admin Page
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={refreshing}
                onClick={() => loadFeeds({ silent: true })}
                type="button"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <LoadingSpinner label="Loading feed" />
          </section>
        ) : hasFeeds ? (
          <section className="grid gap-4">
            {feeds.map((feed) => (
              <FeedCard key={feed._id} feed={feed} />
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No coaching updates yet.
          </section>
        )}
      </div>
    </main>
  );
}
