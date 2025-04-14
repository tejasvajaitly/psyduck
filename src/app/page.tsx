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

          alert("File uploaded successfully!");
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to upload file");
        }
      }}
    >
      <input
        type="file"
        name="pdfFile"
        accept=".pdf"
        required
        className="border border-gray-300 rounded p-2"
      />
      <button
        type="submit"
        className="rounded-full bg-foreground text-background px-4 py-2 hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Upload PDF
      </button>
    </form>
  );
}
