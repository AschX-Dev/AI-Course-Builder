import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function CourseLayout() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/course/${id}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setCourse(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course) return <div className="p-6">Not found</div>;

  const stats = [
    { label: "Skill Level", value: course.difficulty || "Beginner" },
    { label: "Duration", value: course.duration || "1 hour" },
    {
      label: "No Of Chapters",
      value: (
        course.desiredChapters ||
        course.chapters?.length ||
        0
      ).toString(),
    },
    { label: "Video Included?", value: course.addVideo ? "Yes" : "No" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-purple-700">
        Course Layout
      </h1>

      <div className="border rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm bg-white">
        <div className="md:col-span-2 space-y-3">
          <div className="text-3xl font-bold flex items-start gap-2">
            <span>{course.title}</span>
          </div>
          {course.description && (
            <p className="text-gray-700 whitespace-pre-wrap">
              {course.description}
            </p>
          )}
          <div className="pt-2">
            <span className="text-purple-700 underline">{course.topic}</span>
          </div>
        </div>
        <div className="bg-gray-100 rounded aspect-video flex items-center justify-center text-gray-500">
          <span>Cover</span>
        </div>
      </div>

      <div className="border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white shadow-sm">
        {stats.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="text-xs text-gray-600">{s.label}</div>
            <div className="font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="text-xl font-semibold">Chapters</div>
        <ul className="space-y-3">
          {(course.chapters || []).map((ch, idx) => {
            const open = !!openIds[ch._id];
            return (
              <li key={ch._id} className="border rounded-lg bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIds((p) => ({ ...p, [ch._id]: !open }))}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{ch.title}</div>
                  </div>
                  <div
                    className={`transition-transform ${
                      open ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </div>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-0 text-sm text-gray-700 border-t">
                    {ch.content ? (
                      <>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: ch.content }}
                        />
                        {ch.explanation && (
                          <div
                            className="prose max-w-none mt-3"
                            dangerouslySetInnerHTML={{ __html: ch.explanation }}
                          />
                        )}
                        {ch.codeExample && (
                          <pre className="bg-gray-100 p-2 rounded mt-3 overflow-auto">
                            <code>{ch.codeExample}</code>
                          </pre>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-600">
                        No content yet. Use "Open Editor" to generate chapter
                        details.
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <a href="/dashboard" className="px-4 py-2 rounded border">
          Back
        </a>
        <a
          href={`/course/${course._id}`}
          className="px-4 py-2 rounded bg-purple-600 text-white"
        >
          Open Editor
        </a>
      </div>
    </div>
  );
}
