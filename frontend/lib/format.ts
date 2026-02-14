export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeDay(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return "Available now";
  }

  if (diff === 1) {
    return "In 1 day";
  }

  return `In ${diff} days`;
}
