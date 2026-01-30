export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: 600 }}>{title}</h1>
        {subtitle ? (
          <div style={{ color: "#64748b", marginTop: 4, fontSize: "1rem" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
