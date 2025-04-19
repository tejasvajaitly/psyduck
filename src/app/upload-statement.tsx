function UploadStatement({ mutate }: { mutate: (formData: FormData) => void }) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        mutate(formData);
      }}
    >
      <input type="file" name="pdfFile" accept=".pdf" required />
      <button type="submit">Upload PDF</button>
    </form>
  );
}

export default UploadStatement;
