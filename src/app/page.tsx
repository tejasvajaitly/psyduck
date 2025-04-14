"use client";

export default function Home() {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
          const response = await fetch("/api/extract", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }}
    >
      <input type="file" name="pdfFile" accept=".pdf" required />
      <button type="submit">Upload PDF</button>
    </form>
  );
}
