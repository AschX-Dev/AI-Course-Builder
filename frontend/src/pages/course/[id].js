import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export default function CourseEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [chapterBusyId, setChapterBusyId] = useState(null);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${apiBase}/course/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load course');
        setCourse(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, apiBase]);

  async function saveCourse() {
    if (!course) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/course/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, description, chapters: course.chapters })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setCourse(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function generateChapter(chapterId) {
    setChapterBusyId(chapterId);
    setError('');
    try {
      const res = await fetch(`${apiBase}/course/${course._id}/chapter/${chapterId}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      // update local chapter
      setCourse((prev) => {
        const copy = { ...prev };
        copy.chapters = copy.chapters.map((ch) => (ch._id === chapterId ? { ...ch, ...data } : ch));
        return copy;
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setChapterBusyId(null);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course) return <div className="p-6">No course found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Course</h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm underline">Back to Dashboard</button>
      </div>

      <div className="space-y-3">
        <input className="w-full border rounded p-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Course title" />
        <textarea className="w-full border rounded p-2 h-28" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" />
        <button onClick={saveCourse} disabled={saving || !title} className="bg-black text-white px-4 py-2 rounded">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Chapters</h2>
        {course.chapters?.length ? (
          <ul className="space-y-3">
            {course.chapters.map((ch) => (
              <li key={ch._id} className="border rounded p-3 space-y-2">
                <div className="font-medium">{ch.title}</div>
                <div className="text-sm text-gray-600">{ch._id}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateChapter(ch._id)}
                    disabled={chapterBusyId === ch._id}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    {chapterBusyId === ch._id ? 'Generating...' : 'Generate content'}
                  </button>
                </div>
                {ch.content && (
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold">Content</div>
                      <div className="whitespace-pre-wrap text-sm">{ch.content}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Explanation</div>
                      <div className="whitespace-pre-wrap text-sm">{ch.explanation}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Code Example</div>
                      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto"><code>{ch.codeExample}</code></pre>
                    </div>
                    {!!(ch.references || []).length && (
                      <div>
                        <div className="font-semibold">References</div>
                        <ul className="list-disc pl-5 text-sm">
                          {(ch.references || []).map((r, i) => (
                            <li key={i}><a className="underline" href={r} target="_blank" rel="noreferrer">{r}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-600">No chapters yet.</div>
        )}
      </div>
    </div>
  );
}


