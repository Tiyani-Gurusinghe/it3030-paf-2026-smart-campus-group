const STATUS_META = {
  OPEN:        { label: "Open",        cls: "open" },
  IN_PROGRESS: { label: "In Progress", cls: "in_progress" },
  RESOLVED:    { label: "Resolved",    cls: "resolved" },
  CLOSED:      { label: "Closed",      cls: "closed" },
  REJECTED:    { label: "Rejected",    cls: "rejected" },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status ?? "Unknown", cls: "open" };
  return (
    <span className={`status-badge status-${meta.cls}`}>
      {meta.label}
    </span>
  );
}