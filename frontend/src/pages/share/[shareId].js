import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PublicCourse() {
  const router = useRouter();
  const { shareId } = router.query;
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/course/public/${shareId}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        setCourse(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [shareId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course) return <div className="p-6">No course found.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <div className="text-gray-600">Topic: {course.topic}</div>
      {course.description && (
        <p className="whitespace-pre-wrap">{course.description}</p>
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Chapters</h2>
        <ul className="space-y-3">
          {course.chapters?.map((ch) => (
            <li key={ch._id} className="border rounded p-3 space-y-2">
              <div className="font-semibold">{ch.title}</div>
              {ch.content && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: ch.content }}
                />
              )}
              {ch.explanation && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: ch.explanation }}
                />
              )}
              {ch.codeExample && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  <code>{ch.codeExample}</code>
                </pre>
              )}
              {!!(ch.references || []).length && (
                <div>
                  <div className="font-semibold">References</div>
                  <ul className="list-disc pl-5 text-sm">
                    {(ch.references || []).map((r, i) => (
                      <li key={i}>
                        <a
                          className="underline"
                          href={r}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {r}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
