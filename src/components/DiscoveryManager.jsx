import { useEffect, useState } from "react";
import MaterialSelect from "./MaterialSelect";
import { newsletterAction } from "../lib/goodPlansApi";
import { DUBLIN_INTERESTS } from "../lib/discovery";
import { instantForWall, wallDateTime } from "../lib/plans";

export function DiscoveryFilters({ filters, onChange, sources = false }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });
  return (
    <div className="discovery-manager-filters gp-form">
      <label>
        Search events
        <input
          type="search"
          value={filters.query || ""}
          onChange={(e) => update("query", e.target.value)}
          placeholder="Title, activity or venue"
        />
      </label>
      <label>
        Filter category
        <MaterialSelect
          aria-label="Filter category"
          value={filters.category || "All"}
          onChange={(e) => update("category", e.target.value)}
        >
          {["All", ...DUBLIN_INTERESTS].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </MaterialSelect>
      </label>
      <label>
        Event focus
        <MaterialSelect
          aria-label="Event focus"
          value={filters.theme || "All"}
          onChange={(e) => update("theme", e.target.value)}
        >
          {[
            ["All", "All events"],
            ["women", "Women-centred"],
            ["caregiving", "Family & caregiving"],
            ["creative", "Creative classes"],
            ["wellbeing", "Wellbeing"],
            ["partners", "Good for two"],
            ["seasonal", "Seasonal"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </MaterialSelect>
      </label>
      <label>Children & childcare<MaterialSelect aria-label="Children & childcare" value={filters.care||'All'} onChange={e=>update('care',e.target.value)}><option value="All">All events</option><option value="childcare">Childcare listed by organiser</option><option value="children">Children welcome</option></MaterialSelect></label>
      {sources && (
        <label>
          Added through
          <MaterialSelect
            aria-label="Added through"
            value={filters.source || "All"}
            onChange={(e) => update("source", e.target.value)}
          >
            {[
              ["All", "Any source"],
              ["manual", "Added manually"],
              ["web", "Website collector"],
              ["ticketmaster", "Ticketmaster"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </MaterialSelect>
        </label>
      )}
      <label>
        From date
        <input
          type="date"
          value={filters.from || ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </label>
      <label>
        To date
        <input
          type="date"
          min={filters.from || undefined}
          value={filters.to || ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </label>
      <label className="gp-checkbox">
        <input
          type="checkbox"
          checked={filters.free || false}
          onChange={(e) => update("free", e.target.checked)}
        />
        Free events only
      </label>
      <button
        type="button"
        className="gp-text-button"
        onClick={() => onChange({})}
      >
        Clear filters
      </button>
      {filters.from && filters.to && filters.from > filters.to && (
        <p role="alert">Choose an end date on or after the start date.</p>
      )}
    </div>
  );
}

export default function DiscoveryManager({
  data,
  busy,
  action,
  editing,
  onEdit,
}) {
  const [link, setLink] = useState(""),
    [message, setMessage] = useState(""),
    [sourcesOpen, setSourcesOpen] = useState(false);
  return (
    <section
      className="discovery-manager"
      aria-labelledby="discovery-manager-title"
    >
      <header>
        <h2 id="discovery-manager-title">Add events your way.</h2>
      </header>
      {message && <p role="status">{message}</p>}
      <div className="discovery-manager-paths">
        <section>
          <span className="gp-tag">01 · Add a link</span>
          <h3>Found something good?</h3>
          <p>
            Read the listing into an editable draft. Check the date, venue and
            price before publishing.
          </p>
          <form
            className="gp-form"
            onSubmit={(e) => {
              e.preventDefault();
              action(async () => {
                const result = await newsletterAction("import-link", {
                  url: link,
                });
                onEdit({ ...result.draft, key: crypto.randomUUID() });
                setMessage(
                  "Link read. Review the details below; nothing is public yet.",
                );
              });
            }}
          >
            <label>
              Event link
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                maxLength={2048}
              />
            </label>
            <button className="gp-button" disabled={busy}>
              {busy ? "Working…" : "Read event link"}
            </button>
          </form>
          <button
            className="gp-text-button"
            disabled={busy}
            onClick={() => {
              onEdit({ key: crypto.randomUUID() });
              setMessage("");
            }}
          >
            Enter details myself
          </button>
          <details>
            <summary>Connected link-import websites</summary>
            <p>
              {data.importHosts?.join(", ")}. Other websites can be added to the
              server configuration; manual entry is always available.
            </p>
          </details>
        </section>
        <section>
          <span className="gp-tag">02 · Find automatically</span>
          <h3>A little help in the background.</h3>
          <p>
            Active website sources are checked daily, alongside Ticketmaster
            when connected. Matches arrive in the review queue.
          </p>
          <p>
            {data.ticketmasterReady
              ? "Ticketmaster connected."
              : "Ticketmaster is optional and currently disconnected."}
          </p>
          <p>
            Website collectors read public event details from connected sources.
            They cannot read every website, social post or booking page.
          </p>
          <a
            className="gp-text-button"
            href="#automatic-event-sources"
            onClick={() => setSourcesOpen(true)}
          >
            Manage automatic sources ↓
          </a>
        </section>
      </div>
      {editing && (
        <ListingEditor
          key={editing.key || editing.id}
          draft={editing}
          busy={busy}
          onCancel={() => onEdit(null)}
          onSave={(input) =>
            action(async () => {
              await newsletterAction("listings", input);
              onEdit(null);
              setMessage(
                "Published to Dublin picks. Guests can now turn this listing into a plan.",
              );
            })
          }
        />
      )}
      <SourceManager
        data={data}
        busy={busy}
        action={action}
        open={sourcesOpen}
        onToggle={setSourcesOpen}
      />
    </section>
  );
}
function ListingEditor({ draft, busy, onCancel, onSave }) {
  const [form, setForm] = useState({
    ...draft,
    start: draft.starts_at
      ? wallDateTime(draft.starts_at, "Europe/Dublin")
      : "",
    end: draft.ends_at ? wallDateTime(draft.ends_at, "Europe/Dublin") : "",
  });
  const [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState("");
  const update = (key, value) => setForm({ ...form, [key]: value });
  useEffect(() => {
    document.getElementById("listing-draft-title")?.focus();
  }, []);
  return (
    <section
      className="discovery-listing-editor"
      aria-labelledby="listing-draft-heading"
    >
      <h3 id="listing-draft-heading">Review your Dublin listing</h3>
      <p>
        Publishing showcases an existing event. It does not create or sell
        tickets for it.
      </p>
      {!!draft.warnings?.length && (
        <ul>
          {draft.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="gp-error">
          {error}
        </p>
      )}
      <form
        className="gp-form"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          try {
            const fields = new FormData(e.currentTarget),
              start = instantForWall(
                String(fields.get("start")).slice(0, 16),
                "Europe/Dublin",
              ),
              end = fields.get("end")
                ? instantForWall(
                    String(fields.get("end")).slice(0, 16),
                    "Europe/Dublin",
                  )
                : null;
            if (
              !Number.isFinite(+start) ||
              (end && (!Number.isFinite(+end) || end <= start))
            )
              throw new Error(
                "Choose a valid start time and a later end time in Dublin. Avoid the daylight-saving clock change.",
              );
            onSave({
              id: form.id,
              title: form.title,
              venue: form.venue,
              starts_at: start.toISOString(),
              ends_at: end?.toISOString() || null,
              category: form.category || "Other",
              price: form.price,
              url: form.url,
              confirmDublin: confirmed,
              children_welcome: form.children_welcome||'unknown',childcare:form.childcare||'unknown',care_url:form.care_url||null,
            });
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <label>
          Event title
          <input
            id="listing-draft-title"
            required
            maxLength={160}
            value={form.title || ""}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>
        <div className="gp-form-grid two">
          <label>
            Starts at
            <input
              name="start"
              type="datetime-local"
              required
              defaultValue={form.start}
            />
          </label>
          <label>
            Ends at (optional)
            <input name="end" type="datetime-local" defaultValue={form.end} />
          </label>
        </div>
        <p className="gp-field-note">
          All times are Dublin time (Europe/Dublin), including summer-time
          changes.
        </p>
        <label>
          Dublin venue
          <input
            required
            maxLength={240}
            value={form.venue || ""}
            onChange={(e) => update("venue", e.target.value)}
          />
        </label>
        <label>
          Category
          <MaterialSelect
            aria-label="Listing category"
            value={form.category || "Other"}
            onChange={(e) => update("category", e.target.value)}
          >
            {DUBLIN_INTERESTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </MaterialSelect>
        </label>
        <label>
          Price
          <input
            maxLength={100}
            value={form.price || ""}
            placeholder="Free, €15, or check booking page"
            onChange={(e) => update("price", e.target.value)}
          />
        </label>
        <label>
          Original event or booking URL
          <input
            type="url"
            required
            maxLength={2048}
            value={form.url || ""}
            onChange={(e) => update("url", e.target.value)}
          />
        </label>
        <details><summary>Children & childcare (optional)</summary><p className="gp-field-note">Family-friendly does not mean childcare is available. Only confirm what the organiser explicitly states; leave everything else unknown. No children’s personal details are needed.</p>
          <label>Children welcome<MaterialSelect aria-label="Children welcome" value={form.children_welcome||'unknown'} onChange={e=>update('children_welcome',e.target.value)}><option value="unknown">Not confirmed</option><option value="yes">Yes — organiser confirmed</option><option value="no">Adults only — organiser confirmed</option></MaterialSelect></label>
          <label>Childcare support<MaterialSelect aria-label="Childcare support" value={form.childcare||'unknown'} onChange={e=>update('childcare',e.target.value)}><option value="unknown">Not confirmed</option><option value="provided">Childcare provided — organiser confirmed</option><option value="not-provided">No childcare — organiser confirmed</option></MaterialSelect></label>
          <label>Organiser’s confirmation page<input type="url" maxLength={2048} value={form.care_url||''} onChange={e=>update('care_url',e.target.value)} required={(form.children_welcome||'unknown')!=='unknown'||(form.childcare||'unknown')!=='unknown'} placeholder="https://…"/></label></details>
        <label className="gp-checkbox">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I checked the original listing and confirmed the date, price and venue
          in Dublin, Ireland.
        </label>
        <div className="gp-detail-actions">
          <button className="gp-button" disabled={busy || !confirmed}>
            Publish to Dublin picks
          </button>
          <button
            type="button"
            className="gp-button secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
function SourceManager({ data, busy, action, open, onToggle }) {
  const [editing, setEditing] = useState(null);
  return (
    <details
      id="automatic-event-sources"
      className="discovery-sources"
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
    >
      <summary>
        Automatic website sources (
        {data.sources?.filter((source) => source.enabled).length || 0} active)
      </summary>
      <p>
        Add a public programme page or JSON-LD event feed from a connected
        website. The collector checks the page and up to three event links per
        source daily. No API key is needed for these website sources.
      </p>
      <p>
        Optional keywords are separated by commas; an event must match at least
        one. Leave blank for all dated Dublin events. Filter the review queue
        without changing collection.
      </p>
      {!data.sources?.some(
        (source) => source.url === "https://dublin.ie/whats-on/",
      ) && (
        <button
          className="gp-button secondary"
          disabled={busy}
          onClick={() =>
            action(() =>
              newsletterAction("sources", {
                name: "Dublin.ie programme",
                url: "https://dublin.ie/whats-on/",
                linkPath: "/whats-on/listings/",
                keywords: "",
              }),
            )
          }
        >
          Add Dublin.ie programme
        </button>
      )}
      <form
        key={editing?.id || "new-source"}
        className="gp-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget,
            values = new FormData(form);
          action(async () => {
            await newsletterAction("sources", {
              id: editing?.id,
              name: values.get("name"),
              url: values.get("url"),
              linkPath: values.get("linkPath"),
              keywords: values.get("keywords"),
            });
            setEditing(null);
            form.reset();
          });
        }}
      >
        <label>
          Source name
          <input
            name="name"
            defaultValue={editing?.name || ""}
            required
            maxLength={100}
            placeholder="A local venue’s programme"
          />
        </label>
        <label>
          Programme or feed URL
          <input
            name="url"
            defaultValue={editing?.url || ""}
            type="url"
            required
            maxLength={2048}
            placeholder="https://…"
          />
        </label>
        <label>
          Event link path (optional)
          <input
            name="linkPath"
            defaultValue={editing?.link_path || ""}
            maxLength={200}
            placeholder="/whats-on/listings/"
          />
          <small>
            Follow links on this website whose path contains this text. Leave
            blank if the page already contains structured events.
          </small>
        </label>
        <label>
          Include keywords (optional)
          <input
            name="keywords"
            defaultValue={editing?.keywords || ""}
            maxLength={300}
            placeholder="watercolour, dance, women, retreat, Christmas"
          />
        </label>
        <button className="gp-button secondary" disabled={busy}>
          {editing ? "Save source changes" : "Save automatic source"}
        </button>
        {editing && (
          <button
            type="button"
            className="gp-text-button"
            onClick={() => setEditing(null)}
          >
            Cancel editing source
          </button>
        )}
      </form>
      <div className="discovery-source-list">
        {(data.sources || []).map((source) => (
          <article key={source.id}>
            <h4>{source.name}</h4>
            <a href={source.url} target="_blank" rel="noreferrer">
              Open source ↗
            </a>
            <p>
              {source.enabled ? "Active · checked daily" : "Paused"} ·{" "}
              {source.last_checked_at
                ? `Last checked ${new Date(source.last_checked_at).toLocaleString("en-IE", { timeZone: "Europe/Dublin" })} · ${source.last_count} matches`
                : "Not checked yet"}
            </p>
            {source.last_error && (
              <p className="gp-field-note">{source.last_error}</p>
            )}
            <button
              className="gp-text-button"
              disabled={busy}
              onClick={() => setEditing(source)}
            >
              Edit source
            </button>
            <button
              className="gp-text-button"
              disabled={busy}
              onClick={() =>
                action(() =>
                  newsletterAction("sources", {
                    id: source.id,
                    enabled: !source.enabled,
                  }),
                )
              }
            >
              {source.enabled ? "Pause source" : "Resume source"}
            </button>
          </article>
        ))}
      </div>
    </details>
  );
}
