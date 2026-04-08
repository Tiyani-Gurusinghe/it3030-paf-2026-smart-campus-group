const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`status-badge status-${status?.toLowerCase()}`}>
      {label}
    </span>
  );
}