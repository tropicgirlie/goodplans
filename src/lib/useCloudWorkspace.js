import { useEffect, useRef, useState } from "react";
import { readWorkspace, saveWorkspace } from "./goodPlansApi";
export default function useCloudWorkspace(user, data, apply) {
  const [status, setStatus] = useState("local"),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [conflict, setConflict] = useState(null);
  const revision = useRef(0),
    ready = useRef(false),
    last = useRef(""),
    latest = useRef(data),
    busy = useRef(false),
    generation = useRef(0),
    applyRef = useRef(apply);
  latest.current = data;
  applyRef.current = apply;
  const remember = (rev, snapshot) =>
    localStorage.setItem(
      `good-plans-sync-${user.id}`,
      JSON.stringify({ revision: rev, snapshot }),
    );
  const backup = () =>
    localStorage.setItem(
      `good-plans-backup-${Date.now()}`,
      JSON.stringify(latest.current),
    );
  useEffect(() => {
    const run = ++generation.current;
    ready.current = false;
    busy.current = false;
    setError("");
    setConflict(null);
    if (!user) {
      setStatus("local");
      return;
    }
    setStatus("loading");
    (async () => {
      try {
        const remote = await readWorkspace();
        if (run !== generation.current) return;
        revision.current = remote.revision;
        const owner = localStorage.getItem("good-plans-workspace-owner");
        const cached = JSON.parse(
          localStorage.getItem(`good-plans-sync-${user.id}`) || "null",
        );
        const local = JSON.stringify(latest.current);
        if (remote.data) {
          const snapshot = JSON.stringify(remote.data);
          const pending =
            owner === user.id && cached && cached.snapshot !== local;
          if (pending && cached.revision !== remote.revision) {
            setConflict(remote);
            setError(
              "Both this device and your account have changed. Choose which version to continue with.",
            );
            setStatus("error");
            return;
          }
          if (!pending) {
            backup();
            applyRef.current(remote.data);
            latest.current = remote.data;
            remember(remote.revision, snapshot);
          }
          last.current = snapshot;
        } else if (owner && owner !== user.id) {
          backup();
          const empty = { plans: [], people: [], saved: [], preferences: {} };
          applyRef.current(empty);
          latest.current = empty;
          last.current = "";
        } else last.current = "";
        localStorage.setItem("good-plans-workspace-owner", user.id);
        ready.current = true;
        setStatus("synced");
      } catch (e) {
        if (run === generation.current) {
          setError(e.message);
          setStatus("error");
        }
      }
    })();
    return () => {
      generation.current++;
    };
  }, [user?.id, retry]);
  useEffect(() => {
    if (!user) return;
    const run = generation.current;
    let ticks = 0;
    const timer = setInterval(async () => {
      if (busy.current || !ready.current) return;
      const snapshot = JSON.stringify(latest.current);
      const changed = snapshot !== last.current;
      if (!changed && ++ticks % 12 !== 0) return;
      busy.current = true;
      try {
        if (changed) {
          setStatus("syncing");
          const result = await saveWorkspace(
            JSON.parse(snapshot),
            revision.current,
          );
          if (run !== generation.current) return;
          revision.current = result.revision;
          last.current = snapshot;
          remember(result.revision, snapshot);
          setStatus("synced");
          setError("");
        } else {
          const remote = await readWorkspace();
          if (run !== generation.current) return;
          if (remote.revision !== revision.current) {
            if (JSON.stringify(latest.current) !== last.current) {
              ready.current = false;
              setConflict(remote);
              setError(
                "Changes arrived from another device while you were editing. Choose a version.",
              );
              setStatus("error");
            } else if (remote.data) {
              backup();
              applyRef.current(remote.data);
              latest.current = remote.data;
              revision.current = remote.revision;
              last.current = JSON.stringify(remote.data);
              remember(remote.revision, last.current);
            }
          }
        }
      } catch (e) {
        if (run === generation.current) {
          setError(`${e.message} Your changes remain on this device.`);
          setStatus("error");
          ready.current = false;
        }
      } finally {
        if (run === generation.current) busy.current = false;
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [user?.id, retry]);
  function resolve(useAccount) {
    if (!conflict) return;
    backup();
    revision.current = conflict.revision;
    if (useAccount) {
      applyRef.current(conflict.data);
      latest.current = conflict.data;
      last.current = JSON.stringify(conflict.data);
      remember(conflict.revision, last.current);
    } else {
      last.current = "";
    }
    localStorage.setItem("good-plans-workspace-owner", user.id);
    ready.current = true;
    setConflict(null);
    setError("");
    setStatus("synced");
  }
  return {
    status,
    error,
    conflict,
    retry: () => setRetry((n) => n + 1),
    useAccount: () => resolve(true),
    useDevice: () => resolve(false),
  };
}
