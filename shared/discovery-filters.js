export function dublinDate(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const fields = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${fields.year}-${fields.month}-${fields.day}`;
}
export function filterDiscoveryEvents(
  events,
  {
    query = "",
    category = "All",
    theme = "All",
    source = "All",
    from = "",
    to = "",
    free = false,
    care = "All",
  } = {},
) {
  const text = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return events.filter((event) => {
    let themes = event.themes;
    if (!Array.isArray(themes)) {
      try {
        themes = JSON.parse(event.themes_json || "[]");
      } catch {
        themes = [];
      }
    }
    const day = dublinDate(event.starts_at);
    return (
      (category === "All" || event.category === category) &&
      (care === "All" || (care === "childcare" ? event.childcare === "provided" && !!event.care_url : care === "children" && event.children_welcome === "yes" && !!event.care_url)) &&
      (theme === "All" || themes.includes(theme)) &&
      (source === "All" || event.source === source) &&
      (!from || day >= from) &&
      (!to || day <= to) &&
      (!free ||
        /^(?:free\b|(?:EUR|€)\s*0(?:[.,]00)?$)/i.test(
          String(event.price || "").trim(),
        )) &&
      text(`${event.title} ${event.venue} ${event.category}`).includes(
        text(query),
      )
    );
  });
}
