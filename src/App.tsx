import { useState } from "react";
import { generateCV } from "./lib/generateCV";
import { supabase } from "./lib/supabase";

function App() {
  const [cv, setCv] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputCV, setOutputCV] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const splitAIResult = (result: string) => {
    const cvMatch = result.match(/TAILORED CV:\s*([\s\S]*?)COVER LETTER:/i);
    const coverLetterMatch = result.match(/COVER LETTER:\s*([\s\S]*)/i);

    return {
      tailoredCV: cvMatch?.[1]?.trim() || result,
      coverLetter: coverLetterMatch?.[1]?.trim() || "",
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (error) {
      console.error(error);
      alert("Copy failed");
    }
  };

  const downloadTextFile = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!cv || !jobDesc) {
      alert("Please fill in both fields");
      return;
    }

    setLoading(true);
    setOutputCV("");
    setCoverLetter("");

    try {
      const result = await generateCV(cv, jobDesc);
      const splitResult = splitAIResult(result || "");

      setOutputCV(splitResult.tailoredCV);
      setCoverLetter(splitResult.coverLetter);

      const { error } = await supabase.from("cv_requests").insert([
        {
          original_cv: cv,
          job_description: jobDesc,
          tailored_cv: splitResult.tailoredCV,
          cover_letter: splitResult.coverLetter,
        },
      ]);

      if (error) {
        console.error("Save error:", error.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong generating your CV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">RoleReady</h1>

          <p className="mt-2 text-lg text-gray-600">
            Tailor your CV and cover letter to any job in seconds.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl shadow">
            <label className="block font-medium">Paste your CV</label>
            <textarea
              className="mt-2 w-full h-64 border rounded p-3"
              placeholder="Paste your CV here..."
              value={cv}
              onChange={(e) => setCv(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <label className="block font-medium">Job Description</label>
            <textarea
              className="mt-2 w-full h-64 border rounded p-3"
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 bg-black text-white px-6 py-3 rounded disabled:opacity-50"
        >
          {loading ? "Generating..." : "Tailor My CV"}
        </button>

        {(outputCV || coverLetter) && (
          <div className="mt-8 grid gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">Tailored CV</h2>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(outputCV)}
                    className="bg-gray-900 text-white px-4 py-2 rounded"
                  >
                    Copy CV
                  </button>

                  <button
                    onClick={() =>
                      downloadTextFile("roleready-tailored-cv.txt", outputCV)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Download CV
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap text-sm leading-6">
                {outputCV}
              </div>
            </div>

            {coverLetter && (
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold">Cover Letter</h2>

                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(coverLetter)}
                      className="bg-gray-900 text-white px-4 py-2 rounded"
                    >
                      Copy Cover Letter
                    </button>

                    <button
                      onClick={() =>
                        downloadTextFile(
                          "roleready-cover-letter.txt",
                          coverLetter
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Download Cover Letter
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap text-sm leading-6">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;