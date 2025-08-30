import { useEffect, useState } from "react";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isFormValid = title.trim().length > 0 && topic.trim().length > 0;

  function getToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  }

  async function fetchCourses() {
    setError("");
    try {
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
    fetchCourses();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-sm underline"
        >
          Logout
        </button>
      </div>
      <form onSubmit={generateCourse} className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border rounded p-2 flex-1"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 rounded"
          type="submit"
          disabled={loading || !isFormValid}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <ul className="space-y-2">
        {courses.map((c) => (
          <li key={c._id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-2">
              <a href={`/course/${c._id}`} className="block flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-gray-600">Topic: {c.topic}</div>
                <div className="text-sm">
                  Chapters: {c.chapters?.length || 0}
                </div>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteCourse(c._id);
                }}
                className="text-sm text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
