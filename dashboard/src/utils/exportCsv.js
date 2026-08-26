/**
 * Utility to export users data to CSV spreadsheet file (compatible with Excel, Google Sheets, Numbers)
 */

export const formatDateForExport = (value) => {
  if (!value) return "Not provided";

  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(
          Number(value.slice(0, 4)),
          Number(value.slice(5, 7)) - 1,
          Number(value.slice(8, 10))
        )
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const exportUsersToCsv = (users, filenamePrefix = "body_axis_users") => {
  if (!users || !users.length) {
    throw new Error("No user records available to export.");
  }

  const headers = [
    "User ID",
    "Full Name",
    "Date of Birth",
    "Email Address",
    "Join Date",
    "Current Plan",
    "Total Plans",
    "Status",
    "Completed Sessions",
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const rows = users.map((user) => [
    escapeCell(user.id || ""),
    escapeCell(user.name || "Unnamed user"),
    escapeCell(formatDateForExport(user.date_of_birth)),
    escapeCell(user.email || ""),
    escapeCell(formatDateForExport(user.join_date)),
    escapeCell(user.current_plan || "No active plan"),
    escapeCell(user.total ?? 0),
    escapeCell(user.status || "No Plan"),
    escapeCell(user.sessions ?? 0),
  ]);

  // Prepend UTF-8 BOM so Excel & Sheets render UTF-8 characters correctly
  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCell).join(","), ...rows.map((row) => row.join(","))].join(
      "\r\n"
    );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
