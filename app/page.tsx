/*import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1>Welcome to Smart Bookmark App</h1>
      <p>Let’s build something amazing!</p>

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

type Bookmark = {
  id: string;
  url: string;
  title: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Error fetching bookmarks');
    } else {
      setBookmarks(data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('User not authenticated');
      return;
    }

    const { error: insertError } = await supabase.from('bookmarks').insert([
      {
        url,
        title,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      setError('Error saving bookmark');
    } else {
      setUrl('');
      setTitle('');
      fetchBookmarks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) {
      setError('Error deleting bookmark');
    } else {
      fetchBookmarks();
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Smart Bookmark App</h1>

      {!user ? (
        <>
          <p style={{ color: 'red' }}>User not authenticated</p>
          <button
          onClick={handleLogin}
          style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
>
  Login with Google
</button>
        </>
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Bookmark URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{ marginRight: '1rem' }}
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginRight: '1rem' }}
            />
            <button type="submit">Save Bookmark</button>
          </form>

          {loading ? (
            <p>Loading bookmarks...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : bookmarks.length === 0 ? (
            <p>No bookmarks found.</p>
          ) : (
            <ul>
              {bookmarks.map((bm) => (
                <li key={bm.id} style={{ marginBottom: '0.5rem' }}>
                  <a href={bm.url} target="_blank" rel="noopener noreferrer">
                    {bm.title || bm.url}
                  </a>
                  <button
                    onClick={() => handleDelete(bm.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}*/

'use client';

import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

type Bookmark = {
  id: string;
  url: string;
  title: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Error fetching bookmarks');
    } else {
      setBookmarks(data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('User not authenticated');
      return;
    }

    const { error: insertError } = await supabase.from('bookmarks').insert([
      {
        url,
        title,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      setError('Error saving bookmark: ' + insertError.message);
    } else {
      setUrl('');
      setTitle('');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) {
      setError('Error deleting bookmark');
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Smart Bookmark App</h1>

      {!user ? (
        <>
          <p style={{ color: 'red' }}>User not authenticated</p>
          <button
            onClick={handleLogin}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Login with Google
          </button>
        </>
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Bookmark URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{ marginRight: '1rem' }}
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginRight: '1rem' }}
            />
            <button type="submit">Save Bookmark</button>
          </form>

          {loading ? (
            <p>Loading bookmarks...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : bookmarks.length === 0 ? (
            <p>No bookmarks found.</p>
          ) : (
            <ul>
              {bookmarks.map((bm) => (
                <li key={bm.id} style={{ marginBottom: '0.5rem' }}>
                  <a href={bm.url} target="_blank" rel="noopener noreferrer">
                    {bm.title || bm.url}
                  </a>
                  <button
                    onClick={() => handleDelete(bm.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}