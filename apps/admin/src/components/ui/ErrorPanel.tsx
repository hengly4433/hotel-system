export default function ErrorPanel({
  message
}: {
  message: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        background: "#fee2e2",
        borderRadius: 10,
        border: "1px solid #fecaca",
        color: "#991b1b"
      }}
    >
      {message}
    </div>
  );
}
