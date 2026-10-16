import { id } from "./core.js";
import { fail } from "./hosting-core.js";
import {
  boundedText,
  discoveryUrl,
  dublinProgramme,
  eventPageLinks,
  fetchDiscoveryPage,
  publisherEvents,
  webCandidate,
} from "./discovery-import.js";

export async function discoverySources(env) {
  return (
    await env.DB.prepare(
      "SELECT * FROM discovery_sources ORDER BY created_at,id",
    ).all()
  ).results;
}
export async function saveDiscoverySource(env, input) {
  if (input.id && input.url === undefined) {
    if (typeof input.enabled !== "boolean")
      fail("Choose whether this source is active.");
    const result = await env.DB.prepare(
      "UPDATE discovery_sources SET enabled=? WHERE id=?",
    )
      .bind(input.enabled ? 1 : 0, input.id)
      .run();
    if (!result.meta.changes) fail("Source not found.", 404);
    return;
  }
  const name = String(input.name || "").trim(),
    url = discoveryUrl(input.url, env);
  const linkPath = String(input.linkPath || "").trim(),
    keywords = String(input.keywords || "").trim();
  if (
    !name ||
    name.length > 100 ||
    keywords.length > 300 ||
    linkPath.length > 200 ||
    (linkPath && (!linkPath.startsWith("/") || /[?#]/.test(linkPath)))
  )
    fail(
      "Add a source name and an optional event path beginning with /; use up to 300 characters for keywords.",
    );
  if (!input.id && (await discoverySources(env)).length >= 5)
    fail(
      "This release supports five website sources. Edit an existing source or ask for a larger collection budget.",
    );
  const existing = await env.DB.prepare(
    "SELECT id FROM discovery_sources WHERE url=?",
  )
    .bind(url.href)
    .first();
  if (existing && existing.id !== input.id)
    fail("This source is already saved.");
  if (input.id) {
    const result = await env.DB.prepare(
      "UPDATE discovery_sources SET name=?,url=?,link_path=?,keywords=?,last_error=NULL WHERE id=?",
    )
      .bind(name, url.href, linkPath, keywords, input.id)
      .run();
    if (!result.meta.changes) fail("Source not found.", 404);
    return;
  }
  await env.DB.prepare(
    "INSERT INTO discovery_sources(id,name,url,link_path,keywords,created_at) VALUES (?,?,?,?,?,?)",
  )
    .bind(
      id("feed"),
      name,
      url.href,
      linkPath,
      keywords,
      new Date().toISOString(),
    )
    .run();
}
// Choose the crawler's group over *, then apply the longest matching path rule.
// A non-zero crawl delay uses a feed/manual fallback rather than ignoring the publisher.
export function robotsPolicy(text) {
  const groups = [];
  let group = null,
    hasRules = false;
  for (const line of text.split(/\r?\n/)) {
    const match = line.replace(/#.*/, "").match(/^\s*([^:]+):\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1].toLowerCase(),
      value = match[2];
    if (key === "user-agent") {
      if (!group || hasRules) {
        group = { agents: [], rules: [], delay: 0 };
        groups.push(group);
        hasRules = false;
      }
      group.agents.push(value.toLowerCase());
    } else if (group && ["allow", "disallow", "crawl-delay"].includes(key)) {
      hasRules = true;
      if (key === "crawl-delay") group.delay = Number(value) || 0;
      else if (value) group.rules.push({ allow: key === "allow", path: value });
    }
  }
  const specific = groups.filter((group) =>
    group.agents.some(
      (agent) => agent !== "*" && "goodplanseventfinder".includes(agent),
    ),
  );
  const selected = specific.length
    ? specific
    : groups.filter((group) => group.agents.includes("*"));
  return (path) => {
    if (selected.some((group) => group.delay > 0)) return false;
    const rules = selected
      .flatMap((group) => group.rules)
      .filter((rule) => {
        const escaped = rule.path
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replaceAll("*", ".*")
          .replace(/\\\$$/, "$");
        return new RegExp("^" + escaped).test(path);
      })
      .sort(
        (a, b) =>
          b.path.length - a.path.length || Number(b.allow) - Number(a.allow),
      );
    return !rules.length || rules[0].allow;
  };
}
async function sourcePolicy(source, env) {
  const base = discoveryUrl(source.url, env);
  const response = await fetch(new URL("/robots.txt", base).href, {
    redirect: "manual",
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "GoodPlansEventFinder/1.0" },
  });
  let permits;
  if (response.status === 404) {
    await response.body?.cancel();
    permits = () => true;
  } else if (response.ok)
    permits = robotsPolicy(await boundedText(response, 64_000));
  else {
    await response.body?.cancel();
    fail(
      "Could not confirm this website’s crawler rules. Use a permitted feed or add individual events manually.",
    );
  }
  return async (url) => {
    if (url.origin !== base.origin || !permits(url.pathname + url.search))
      fail(
        "This website does not permit this collection path. Use another public source or add the event manually.",
      );
  };
}
export async function collectWebSource(env, source, save) {
  let count = 0,
    skipped = 0;
  const failures = [];
  try {
    const checkPath = await sourcePolicy(source, env);
    const index = await fetchDiscoveryPage(source.url, env, checkPath);
    const pages = [index];
    const seeds = dublinProgramme(index.html, index.url).filter(
      (seed) =>
        !seed.endDay || seed.endDay >= new Date().toISOString().slice(0, 10),
    );
    const keywords = source.keywords
      .split(",")
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);
    const priority = (seed) =>
      keywords.some((word) => seed.text.toLowerCase().includes(word)) ? 1 : 0;
    const today = new Date().toISOString().slice(0, 10);
    seeds.sort(
      (a, b) =>
        priority(b) - priority(a) ||
        Number(b.day > today) - Number(a.day > today) ||
        a.day.localeCompare(b.day),
    );
    const links = seeds.length
      ? seeds.map((seed) => seed.url)
      : eventPageLinks(index.html, index.url, source.link_path);
    // A finite scan of a chosen programme; never an unrestricted recursive crawler.
    for (const url of [...new Set(links)].slice(0, 3)) {
      try {
        pages.push({
          ...(await fetchDiscoveryPage(url, env, checkPath)),
          seed: seeds.find((seed) => seed.url === url),
        });
      } catch (e) {
        failures.push(e.message);
      }
    }
    const seen = new Set();
    scan: for (const page of pages)
      for (const raw of publisherEvents(page.html, page.url, page.seed)) {
        const candidate = await webCandidate(raw, page.url, source.id);
        if (!candidate) {
          skipped++;
          continue;
        }
        if (
          keywords.length &&
          !keywords.some((word) =>
            `${raw.name || ""} ${raw.description || ""}`
              .toLowerCase()
              .includes(word),
          )
        )
          continue;
        if (seen.has(candidate.source_id)) continue;
        seen.add(candidate.source_id);
        await save(candidate);
        count++;
        if (count >= 50) break scan;
      }
    const detail = failures.length
      ? `${failures.length} linked pages could not be checked. ${failures[0]}`
      : !count
        ? `No matching, dated Dublin events found. ${skipped} entries lacked usable dates or a Dublin venue; try a direct event page or adjust keywords.`
        : null;
    await env.DB.prepare(
      "UPDATE discovery_sources SET last_checked_at=?,last_count=?,last_error=? WHERE id=?",
    )
      .bind(new Date().toISOString(), count, detail, source.id)
      .run();
    return {
      count,
      error: failures.length ? `${source.name}: ${detail}` : null,
    };
  } catch (e) {
    await env.DB.prepare(
      "UPDATE discovery_sources SET last_checked_at=?,last_count=?,last_error=? WHERE id=?",
    )
      .bind(new Date().toISOString(), count, e.message, source.id)
      .run();
    return { count, error: `${source.name}: ${e.message}` };
  }
}
