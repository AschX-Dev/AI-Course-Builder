import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isFormValid = title.trim().length > 0 && topic.trim().length > 0;
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [query, setQuery] = useState("");

  function getToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  }

  async function fetchCourses() {
    setError("");
    try {
      setListLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  async function deleteCourse(id) {
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/course/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (res.ok || res.status === 404) {
        setCourses((prev) => prev.filter((c) => c._id !== id));
        return;
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Delete failed");
    } catch (err) {
      setError(err.message);
    }
  }

  async function generateCourse(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/course/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, topic }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setTitle("");
      setTopic("");
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(u.name || u.email || "Creator");
    } catch {}
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div className="text-lg font-semibold">AlphaWave</div>
        <nav className="space-y-2">
          <a className="block px-3 py-2 rounded bg-gray-100" href="#">
            Home
          </a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">
            Explore
          </a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">
            Upgrade
          </a>
          <Link
            href="/create-course"
            className="block px-3 py-2 rounded hover:bg-gray-50"
          >
            Create Course
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Hello,</div>
            <h1 className="text-2xl font-bold">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border rounded px-3 py-2 w-56"
              placeholder="Search courses..."
            />
            <Link
              href="/create-course"
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              + Create AI Course
            </Link>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {listLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border rounded overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          (() => {
            const q = query.trim().toLowerCase();
            const filtered = courses.filter(
              (c) =>
                !q ||
                (c.title || "").toLowerCase().includes(q) ||
                (c.topic || "").toLowerCase().includes(q)
            );
            if (!filtered.length) {
              return (
                <div className="text-center py-16 border rounded">
                  <div className="text-lg font-medium">No courses found</div>
                  <div className="text-sm text-gray-600">
                    Try a different search, or create a new course.
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      + Create AI Course
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c) => (
                  <a
                    key={c._id}
                    href={`/course/${c._id}`}
                    className="border rounded overflow-hidden hover:shadow transition"
                  >
                    <div className="aspect-[16/9] bg-gradient-to-br from-indigo-600 to-purple-600" />
                    <div className="p-3 space-y-1">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-sm text-gray-600">{c.topic}</div>
                      <div className="text-xs">
                        {c.chapters?.length || 0} Chapters
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            deleteCourse(c._id);
                          }}
                          className="text-xs text-red-600 underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            );
          })()
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded w-full max-w-md p-4 space-y-3">
              <div className="text-lg font-semibold">Create AI Course</div>
              <form
                onSubmit={(e) => {
                  generateCourse(e);
                  if (isFormValid) {
                    setShowModal(false);
                  }
                }}
                className="space-y-3"
              >
                <input
                  className="w-full border rounded p-2"
                  placeholder="Course title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  className="w-full border rounded p-2"
                  placeholder="Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || !isFormValid}
                    className="px-3 py-2 rounded bg-purple-600 text-white"
                  >
                    {loading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
