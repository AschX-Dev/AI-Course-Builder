import { useState } from "react";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("1 Hour");
  const [addVideo, setAddVideo] = useState("Yes");
  const [desiredChapters, setDesiredChapters] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (typeof window !== "undefined" && !getToken()) {
    window.location.href = "/login";
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/course/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            title,
            topic,
            options: {
              difficulty,
              duration,
              addVideo: addVideo === "Yes",
              desiredChapters: Number(desiredChapters),
            },
          }),
        }
      );
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
      if (!res.ok) throw new Error(data?.error || "Failed to generate course");
      window.location.href = `/create-course/${data._id}`;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-purple-700">
        Create Course
      </h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white inline-flex items-center justify-center">
            ①
          </div>
          <div className="mt-2 text-sm">Category</div>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white inline-flex items-center justify-center">
            ②
          </div>
          <div className="mt-2 text-sm">Topic & Desc</div>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white inline-flex items-center justify-center">
            ③
          </div>
          <div className="mt-2 text-sm">Options</div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-gray-600">Course Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Advanced React Native"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Topic</label>
          <input
            className="w-full border rounded p-2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. React Native"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Difficulty Level</label>
          <select
            className="w-full border rounded p-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advance</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Course Duration</label>
          <select
            className="w-full border rounded p-2"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option>1 Hour</option>
            <option>2 Hours</option>
            <option>3 Hours</option>
            <option>4 Hours</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Add Video</label>
          <select
            className="w-full border rounded p-2"
            value={addVideo}
            onChange={(e) => setAddVideo(e.target.value)}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">No of Chapters</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded p-2"
            value={desiredChapters}
            onChange={(e) => setDesiredChapters(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded border">
            Previous
          </a>
          <button
            disabled={loading || !title || !topic}
            className="px-4 py-2 rounded bg-purple-600 text-white"
          >
            {loading ? "Generating..." : "Generate Course Layout"}
          </button>
        </div>
      </form>
    </div>
  );
}
