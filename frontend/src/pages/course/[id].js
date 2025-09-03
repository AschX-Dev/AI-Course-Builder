import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
const RichEditor = dynamic(() => import("@/components/RichEditor"), {
  ssr: false,
});

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function CourseEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [chapterBusyId, setChapterBusyId] = useState(null);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiBase}/course/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load course");
        setCourse(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
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
    setError("");
    try {
      const res = await fetch(`${apiBase}/course/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, description, chapters: course.chapters }),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setCourse(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function generateChapter(chapterId) {
    setChapterBusyId(chapterId);
    setError("");
    try {
      const res = await fetch(
        `${apiBase}/course/${course._id}/chapter/${chapterId}/generate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      // update local chapter
      setCourse((prev) => {
        const copy = { ...prev };
        copy.chapters = copy.chapters.map((ch) =>
          ch._id === chapterId ? { ...ch, ...data } : ch
        );
        return copy;
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setChapterBusyId(null);
    }
  }

  function moveChapter(chapterId, direction) {
    setCourse((prev) => {
      const idx = prev.chapters.findIndex((c) => c._id === chapterId);
      if (idx === -1) return prev;
      const newIndex = direction === "up" ? idx - 1 : idx + 1;
      if (newIndex < 0 || newIndex >= prev.chapters.length) return prev;
      const chapters = [...prev.chapters];
      const [item] = chapters.splice(idx, 1);
      chapters.splice(newIndex, 0, item);
      return { ...prev, chapters };
    });
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course) return <div className="p-6">No course found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Course</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (!course) return;
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/export/${course._id}`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(title || "course").replace(
                /[^a-z0-9-_]+/gi,
                "_"
              )}.json`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
            className="text-sm underline"
          >
            Export JSON
          </button>
          <button
            onClick={async () => {
              if (!course) return;
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/export/${course._id}/pdf`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(title || "course").replace(
                /[^a-z0-9-_]+/gi,
                "_"
              )}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
            className="text-sm underline"
          >
            Export PDF
          </button>
          <button
            onClick={async () => {
              if (!course) return;
              const endpoint = course.isPublic ? "unpublish" : "publish";
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/${course._id}/${endpoint}`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              const data = await res.json();
              if (!res.ok) return alert(data.error || "Failed");
              setCourse((prev) => ({
                ...prev,
                isPublic: endpoint === "publish",
                shareId: data.shareId || null,
              }));
            }}
            className="text-sm underline"
          >
            {course?.isPublic ? "Unpublish" : "Publish"}
          </button>
          {course?.isPublic && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/share/${course.shareId}`;
                navigator.clipboard?.writeText(url);
                alert("Share link copied to clipboard");
              }}
              className="text-sm underline"
            >
              Copy Share Link
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title"
        />
        <textarea
          className="w-full border rounded p-2 h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button
          onClick={saveCourse}
          disabled={saving || !title}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Chapters</h2>
        {course.chapters?.length ? (
          <ul className="space-y-3">
            {course.chapters.map((ch) => (
              <li key={ch._id} className="border rounded p-3 space-y-2">
                <input
                  className="font-medium border-b focus:outline-none"
                  value={ch.title}
                  onChange={(e) =>
                    setCourse((prev) => ({
                      ...prev,
                      chapters: prev.chapters.map((c) =>
                        c._id === ch._id ? { ...c, title: e.target.value } : c
                      ),
                    }))
                  }
                />
                <div className="text-sm text-gray-600">{ch._id}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateChapter(ch._id)}
                    disabled={chapterBusyId === ch._id}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    {chapterBusyId === ch._id
                      ? "Generating..."
                      : "Generate content"}
                  </button>
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() => moveChapter(ch._id, "up")}
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() => moveChapter(ch._id, "down")}
                  >
                    Move Down
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="font-semibold">Content</div>
                    <RichEditor
                      value={ch.content || ""}
                      onChange={(html) =>
                        setCourse((prev) => ({
                          ...prev,
                          chapters: prev.chapters.map((c) =>
                            c._id === ch._id ? { ...c, content: html } : c
                          ),
                        }))
                      }
                      placeholder="Write chapter content..."
                    />
                  </div>
                  <div>
                    <div className="font-semibold">Explanation</div>
                    <RichEditor
                      value={ch.explanation || ""}
                      onChange={(html) =>
                        setCourse((prev) => ({
                          ...prev,
                          chapters: prev.chapters.map((c) =>
                            c._id === ch._id ? { ...c, explanation: html } : c
                          ),
                        }))
                      }
                      placeholder="Explain the concepts..."
                    />
                  </div>
                  <div>
                    <div className="font-semibold">Code Example</div>
                    <textarea
                      className="w-full border rounded p-2 font-mono text-sm"
                      value={ch.codeExample || ""}
                      onChange={(e) =>
                        setCourse((prev) => ({
                          ...prev,
                          chapters: prev.chapters.map((c) =>
                            c._id === ch._id
                              ? { ...c, codeExample: e.target.value }
                              : c
                          ),
                        }))
                      }
                      placeholder="Code sample..."
                    />
                  </div>
                </div>
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
