export default function LoadingPanel({
  message = "Loading..."
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        background: "white",
        borderRadius: 10,
        border: "1px solid #e2e8f0"
      }}
    >
      {message}
    </div>
  );
}
