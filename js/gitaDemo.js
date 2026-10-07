// Componentes interativos que recriam telas do Gita na LP.
// Cada elemento com data-demo="<nome>" é montado pela função correspondente em DEMOS.
// Os dados são fictícios e fixos; nada é buscado de API.

(function () {
  "use strict";

  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const pad = (n) => String(n).padStart(2, "0");
  const clock = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let iconsQueued = false;
  function refreshIcons() {
    if (iconsQueued || !window.lucide) return;
    iconsQueued = true;
    requestAnimationFrame(() => {
      iconsQueued = false;
      window.lucide.createIcons();
    });
  }

  // Timers só rodam enquanto o componente está visível
  const visible = new WeakMap();
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => visible.set(e.target, e.isIntersecting)), { rootMargin: "100px" })
    : null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function every(el, ms, fn) {
    if (io) io.observe(el);
    else visible.set(el, true);
    return setInterval(() => {
      if (visible.get(el) && !document.hidden) fn();
    }, reduceMotion ? ms * 3 : ms);
  }

  const chip = (label, tone) => `<span class="g-chip g-chip--${tone}">${esc(label)}</span>`;

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  const EVENT_POOL = [
    ["Normal", "Scheduled", "Pod", "api-7d9f4-x2kqp", "payments", "Successfully assigned payments/api-7d9f4-x2kqp to ip-10-0-12-4"],
    ["Normal", "Pulled", "Pod", "web-6f7d8-l2mnz", "web", 'Container image "nginx:1.27" already present on machine'],
    ["Normal", "Created", "Pod", "worker-5c8b9-9fjq", "payments", "Created container worker"],
    ["Normal", "Started", "Pod", "worker-5c8b9-9fjq", "payments", "Started container worker"],
    ["Warning", "BackOff", "Pod", "api-7d9f4-x2kqp", "payments", "Back-off restarting failed container api"],
    ["Warning", "Unhealthy", "Pod", "web-6f7d8-q9wtx", "web", "Readiness probe failed: HTTP probe failed with statuscode: 503"],
    ["Normal", "ScalingReplicaSet", "Deployment", "api", "payments", "Scaled up replica set api-7d9f4 to 5"],
    ["Warning", "FailedScheduling", "Pod", "migrate-db-k8s2", "payments", "0/3 nodes are available: 3 Insufficient memory"],
    ["Normal", "SuccessfulCreate", "Job", "migrate-db", "payments", "Created pod: migrate-db-k8s2"],
    ["Normal", "Completed", "Job", "report-28959386", "jobs", "Job completed"],
    ["Warning", "OOMKilling", "Node", "ip-10-0-12-4", "-", "Memory cgroup out of memory: Killed process 4121 (worker)"],
    ["Normal", "Killing", "Pod", "web-6f7d8-l2mnz", "web", "Stopping container nginx"],
  ];

  function demoEvents(el) {
    const state = { filter: "all", rows: [], normal: 9982, warning: 34 };
    const now = Date.now();
    for (let i = 0; i < 9; i++) {
      const e = EVENT_POOL[(i * 5) % EVENT_POOL.length];
      state.rows.push({ e, t: clock(new Date(now - (i + 1) * 47000)) });
    }

    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-stats">
          <div class="g-donut" data-ref="donut"></div>
          <div class="g-stat"><span class="g-stat__v" data-ref="normal"></span><span class="g-stat__l"><span class="g-dot g-dot--ok"></span>Normal</span></div>
          <div class="g-stat"><span class="g-stat__v" data-ref="warning"></span><span class="g-stat__l"><span class="g-dot g-dot--warn"></span>Warning</span></div>
        </div>
        <div class="g-seg" role="tablist" aria-label="Filtro de tipo">
          <button type="button" data-filter="all" class="is-on">All</button>
          <button type="button" data-filter="warning">Warning</button>
        </div>
      </div>
      <div class="g-table-wrap">
        <table class="g-table">
          <thead><tr><th class="g-hide-xs">Date</th><th>Type</th><th>Reason</th><th class="g-hide-sm">Kind</th><th>Name</th><th class="g-hide-md">Message</th></tr></thead>
          <tbody data-ref="body"></tbody>
        </table>
      </div>`;

    const ref = (k) => el.querySelector(`[data-ref="${k}"]`);
    const tip = makeTooltip(el);

    function renderDonut() {
      const total = state.normal + state.warning;
      // Warning é pequeno demais para aparecer; mantém fatia mínima visível e o valor exato no tooltip
      const wFrac = Math.max(state.warning / total, 0.04);
      const r = 15, c = 2 * Math.PI * r;
      ref("donut").innerHTML = `
        <svg viewBox="0 0 40 40" width="44" height="44" aria-label="Normal ${state.normal}, Warning ${state.warning}">
          <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--g-ok)" stroke-width="6"
            stroke-dasharray="${(1 - wFrac) * c - 1.5} ${c}" transform="rotate(-90 20 20)" data-slice="Normal" />
          <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--g-warn)" stroke-width="6"
            stroke-dasharray="${wFrac * c - 1.5} ${c}" stroke-dashoffset="${-(1 - wFrac) * c}" transform="rotate(-90 20 20)" data-slice="Warning" />
        </svg>`;
      ref("donut").querySelectorAll("[data-slice]").forEach((s) => {
        s.addEventListener("pointermove", (ev) => {
          const n = s.dataset.slice === "Normal" ? state.normal : state.warning;
          tip.show(ev, `<strong>${n.toLocaleString("pt-BR")}</strong> ${esc(s.dataset.slice)} · ${((n / total) * 100).toFixed(2)}%`);
        });
        s.addEventListener("pointerleave", tip.hide);
      });
    }

    function renderRows(fresh) {
      const rows = state.rows.filter((r) => state.filter === "all" || r.e[0] === "Warning").slice(0, 8);
      ref("body").innerHTML = rows.map((r, i) => `
        <tr class="${fresh && i === 0 ? "g-row-new" : ""}">
          <td class="g-muted g-nowrap g-hide-xs">${esc(r.t)}</td>
          <td>${chip(r.e[0], r.e[0] === "Warning" ? "warn" : "ok")}</td>
          <td>${esc(r.e[1])}</td>
          <td class="g-hide-sm">${esc(r.e[2])}</td>
          <td class="g-trunc">${esc(r.e[3])}</td>
          <td class="g-hide-md g-trunc g-muted">${esc(r.e[5])}</td>
        </tr>`).join("");
      ref("normal").textContent = state.normal.toLocaleString("pt-BR");
      ref("warning").textContent = state.warning.toLocaleString("pt-BR");
      renderDonut();
    }

    el.querySelectorAll("[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        state.filter = b.dataset.filter;
        el.querySelectorAll("[data-filter]").forEach((x) => x.classList.toggle("is-on", x === b));
        renderRows(false);
      })
    );

    renderRows(false);
    every(el, 2600, () => {
      const e = pick(EVENT_POOL);
      state.rows.unshift({ e, t: clock() });
      state.rows.length = Math.min(state.rows.length, 30);
      if (e[0] === "Warning") state.warning++;
      else state.normal++;
      renderRows(state.filter === "all" || e[0] === "Warning");
    });
  }

  // ---------------------------------------------------------------------------
  // Tooltip compartilhado
  // ---------------------------------------------------------------------------
  function makeTooltip(host) {
    const t = document.createElement("div");
    t.className = "g-tip";
    t.hidden = true;
    host.style.position = host.style.position || "relative";
    host.appendChild(t);
    return {
      show(ev, html) {
        t.innerHTML = html;
        t.hidden = false;
        const hb = host.getBoundingClientRect();
        let x = ev.clientX - hb.left + 12;
        let y = ev.clientY - hb.top + 12;
        const w = t.offsetWidth, h = t.offsetHeight;
        if (x + w > hb.width - 4) x = ev.clientX - hb.left - w - 12;
        if (y + h > hb.height - 4) y = ev.clientY - hb.top - h - 12;
        t.style.transform = `translate(${Math.max(4, x)}px, ${Math.max(4, y)}px)`;
      },
      hide() {
        t.hidden = true;
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Timeline
  // ---------------------------------------------------------------------------
  const LANES = [
    { id: "events", label: "Events", tone: "neutral" },
    { id: "changes", label: "Changes", tone: "accent" },
    { id: "problems", label: "Problems", tone: "warn" },
    { id: "incidents", label: "Incidents", tone: "err" },
  ];
  const TL_POOL = {
    events: [["api-7d9f4-x2kqp", "Pod", "payments", "BackOff"], ["web-6f7d8-q9wtx", "Pod", "web", "Unhealthy"], ["migrate-db-k8s2", "Pod", "payments", "FailedScheduling"]],
    changes: [["api-principal-555dd449b4", "ReplicaSet", "gita-api", "replicas 3 → 5"], ["web", "Ingress", "web", "host updated"], ["feature-flags", "ConfigMap", "payments", "data changed"]],
    problems: [["api-notificacoes-79f65", "container", "gita-alertas", "cpu requests should be set"], ["worker-5c8b9", "container", "payments", "liveness probe must be present"]],
    incidents: [["ms-collect-producer", "Pod", "collector", "pod status is not ready"]],
  };

  function demoTimeline(el) {
    let id = 0;
    const items = [];
    const seed = { events: 14, changes: 6, problems: 7, incidents: 1 };
    Object.entries(seed).forEach(([lane, n]) => {
      for (let i = 0; i < n; i++) items.push(newItem(lane, rand(0.02, 0.97)));
    });

    function newItem(lane, x) {
      const p = pick(TL_POOL[lane]);
      const minutesAgo = Math.round((1 - x) * 60);
      return { id: id++, lane, x, name: p[0], kind: p[1], ns: p[2], detail: p[3], ago: minutesAgo };
    }

    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-summary" data-ref="summary"></div>
        <span class="g-filter g-filter--solid"><i data-lucide="calendar"></i>Last 1h</span>
      </div>
      <div class="g-tl">
        ${LANES.map((l) => `<div class="g-tl__lane"><span class="g-tl__label">${l.label}</span><div class="g-tl__track" data-lane="${l.id}"></div></div>`).join("")}
        <div class="g-tl__axis"><span>-60m</span><span>-45m</span><span>-30m</span><span>-15m</span><span>now</span></div>
      </div>
      <p class="g-hint">Passe o mouse ou toque nos pontos para ver o recurso.</p>`;
    refreshIcons();

    const tip = makeTooltip(el);
    const dots = new Map();

    function summary() {
      const c = (lane) => items.filter((i) => i.lane === lane).length;
      el.querySelector('[data-ref="summary"]').innerHTML =
        `<span>Total: <b>${items.length}</b></span><span>Changes: <b>${c("changes")}</b></span>` +
        `<span>Problems: <b>${c("problems")}</b></span><span>Incidents: <b>${c("incidents")}</b></span>` +
        `<span class="g-hide-sm">Events - Warning: <b>${c("events")}</b></span>`;
    }

    function place(item, isNew) {
      let d = dots.get(item.id);
      if (!d) {
        d = document.createElement("button");
        d.type = "button";
        d.className = `g-tl__dot g-tl__dot--${LANES.find((l) => l.id === item.lane).tone}${isNew ? " is-new" : ""}`;
        d.setAttribute("aria-label", `${item.kind} ${item.name}`);
        const show = (ev) => {
          const ago = Math.max(0, Math.round((1 - item.x) * 60));
          tip.show(ev, `<strong>${esc(item.name)}</strong><br><span>Kind: ${esc(item.kind)}</span><br><span>Namespace: ${esc(item.ns)}</span><br><span>${esc(item.detail)}</span><br><span class="g-muted">${ago === 0 ? "agora" : `há ${ago} min`}</span>`);
        };
        d.addEventListener("pointermove", show);
        d.addEventListener("pointerleave", tip.hide);
        d.addEventListener("focus", () => {
          const r = d.getBoundingClientRect();
          show({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
        });
        d.addEventListener("blur", tip.hide);
        el.querySelector(`[data-lane="${item.lane}"]`).appendChild(d);
        dots.set(item.id, d);
      }
      d.style.left = `${item.x * 100}%`;
    }

    items.forEach((i) => place(i, false));
    summary();

    every(el, 2200, () => {
      for (let i = items.length - 1; i >= 0; i--) {
        items[i].x -= 1 / 90;
        if (items[i].x < 0) {
          dots.get(items[i].id).remove();
          dots.delete(items[i].id);
          items.splice(i, 1);
        } else place(items[i], false);
      }
      const lane = pick(["events", "events", "events", "changes", "problems", Math.random() < 0.15 ? "incidents" : "events"]);
      const it = newItem(lane, 0.995);
      items.push(it);
      place(it, true);
      summary();
    });
  }

  // ---------------------------------------------------------------------------
  // Auditoria
  // ---------------------------------------------------------------------------
  const AUDIT = [
    { when: "02:32pm", verb: "UPDATE", user: "ana@empresa.com", kind: "Deployment", name: "api", ns: "payments", gvk: "apps/v1, Kind=Deployment", op: "replace", path: "/spec/replicas", value: "5", ip: "10.0.12.4" },
    { when: "01:05pm", verb: "DELETE", user: "ci-deployer", kind: "Secret", name: "db-creds", ns: "payments", gvk: "v1, Kind=Secret", op: "remove", path: "/metadata/name", value: "db-creds", ip: "10.0.8.21" },
    { when: "11:47am", verb: "CREATE", user: "joao@empresa.com", kind: "ConfigMap", name: "feature-flags", ns: "payments", gvk: "v1, Kind=ConfigMap", op: "add", path: "/data/NEW_CHECKOUT", value: "true", ip: "10.0.12.9" },
    { when: "10:22am", verb: "UPDATE", user: "kubernetes-admin", kind: "Ingress", name: "web", ns: "web", gvk: "networking.k8s.io/v1, Kind=Ingress", op: "replace", path: "/spec/rules/0/host", value: "shop.empresa.com", ip: "10.0.1.2" },
    { when: "09:18am", verb: "CREATE", user: "ci-deployer", kind: "Job", name: "migrate-db", ns: "payments", gvk: "batch/v1, Kind=Job", op: "add", path: "/spec/template/spec/containers/0/image", value: "migrate:1.4.2", ip: "10.0.8.21" },
    { when: "08:41am", verb: "DELETE", user: "ana@empresa.com", kind: "Pod", name: "api-7d9f4-x2kqp", ns: "payments", gvk: "v1, Kind=Pod", op: "remove", path: "/metadata/name", value: "api-7d9f4-x2kqp", ip: "10.0.12.4" },
    { when: "08:03am", verb: "UPDATE", user: "joao@empresa.com", kind: "Service", name: "api", ns: "payments", gvk: "v1, Kind=Service", op: "replace", path: "/spec/ports/0/targetPort", value: "8080", ip: "10.0.12.9" },
  ];
  const verbTone = (v) => (v === "UPDATE" ? "orange" : v === "DELETE" ? "err" : "ok");

  function demoAudit(el, opts = {}) {
    const state = { verbs: new Set(["CREATE", "UPDATE", "DELETE"]), q: "", sel: opts.closed || el.clientWidth < 560 ? null : 0 };
    el.classList.add("g-audit");
    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-filters">
          ${["CREATE", "UPDATE", "DELETE"].map((v) => `<button type="button" class="g-filter is-on" data-verb="${v}" aria-pressed="true"><i data-lucide="check"></i>${v}</button>`).join("")}
        </div>
        <label class="g-search"><i data-lucide="search"></i><input type="search" placeholder="Search..." aria-label="Buscar na auditoria"></label>
      </div>
      <div class="g-table-wrap">
        <table class="g-table g-table--click">
          <thead><tr><th class="g-hide-xs">Date</th><th>Verb</th><th class="g-hide-sm">User</th><th class="g-hide-sm">Kind</th><th>Name</th><th class="g-hide-md">Namespace</th></tr></thead>
          <tbody data-ref="body"></tbody>
        </table>
      </div>
      <aside class="g-sheet" data-ref="sheet" hidden></aside>`;
    refreshIcons();

    const body = el.querySelector('[data-ref="body"]');
    const sheet = el.querySelector('[data-ref="sheet"]');

    function rows() {
      return AUDIT.map((a, i) => ({ a, i })).filter(({ a }) =>
        state.verbs.has(a.verb) && (!state.q || `${a.name} ${a.user} ${a.kind}`.toLowerCase().includes(state.q))
      );
    }

    function render() {
      const list = rows();
      body.innerHTML = list.length
        ? list.map(({ a, i }) => `
          <tr data-i="${i}" tabindex="0" class="${state.sel === i ? "is-sel" : ""}">
            <td class="g-muted g-nowrap g-hide-xs">2026/10/05 ${esc(a.when)}</td>
            <td>${chip(a.verb, verbTone(a.verb))}</td>
            <td class="g-hide-sm g-trunc">${esc(a.user)}</td>
            <td class="g-hide-sm">${esc(a.kind)}</td>
            <td class="g-trunc">${esc(a.name)}</td>
            <td class="g-hide-md">${esc(a.ns)}</td>
          </tr>`).join("")
        : `<tr><td colspan="6" class="g-empty">Nenhum registro para este filtro.</td></tr>`;
      renderSheet();
    }

    function renderSheet() {
      const a = AUDIT[state.sel];
      if (state.sel === null || !a) {
        sheet.hidden = true;
        return;
      }
      sheet.hidden = false;
      sheet.innerHTML = `
        <div class="g-sheet__head">
          <div><strong>${esc(a.name)}</strong><span class="g-muted">Namespace: ${esc(a.ns)}</span></div>
          <button type="button" class="g-icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button>
        </div>
        <div class="g-card"><h4>Info</h4>
          <p><b>User:</b> ${esc(a.user)}</p><p><b>Verb:</b> ${esc(a.verb)}</p><p><b>GVK:</b> ${esc(a.gvk)}</p>
        </div>
        <div class="g-card"><h4>Changes</h4>
          <p>Operation: ${esc(a.op)}</p><p>Path: <code>${esc(a.path)}</code></p><p>Value: <code class="g-accent">${esc(a.value)}</code></p>
        </div>
        <div class="g-card"><h4>Source IP</h4><p><code>${esc(a.ip)}</code></p></div>`;
      sheet.querySelector("[data-close]").addEventListener("click", () => {
        state.sel = null;
        render();
      });
      refreshIcons();
    }

    body.addEventListener("click", (ev) => {
      const tr = ev.target.closest("tr[data-i]");
      if (!tr) return;
      state.sel = Number(tr.dataset.i);
      render();
    });
    body.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.matches("tr[data-i]")) {
        state.sel = Number(ev.target.dataset.i);
        render();
      }
    });
    el.querySelectorAll("[data-verb]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = b.dataset.verb;
        if (state.verbs.has(v)) state.verbs.delete(v);
        else state.verbs.add(v);
        const on = state.verbs.has(v);
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
        render();
      })
    );
    el.querySelector("input[type=search]").addEventListener("input", (ev) => {
      state.q = ev.target.value.trim().toLowerCase();
      render();
    });

    render();
  }

  // ---------------------------------------------------------------------------
  // Grafo de recursos
  // ---------------------------------------------------------------------------
  function demoGraph(el) {
    const N = [
      { id: "ns", kind: "Namespace", name: "kube-system", x: 450, y: 40, parent: null },
      { id: "ds1", kind: "DaemonSet", name: "aws-node", x: 230, y: 175, parent: "ns" },
      { id: "ds2", kind: "DaemonSet", name: "ebs-csi-node", x: 670, y: 175, parent: "ns" },
      { id: "p1", kind: "Pod", name: "aws-node-n6gd5", x: 80, y: 320, parent: "ds1" },
      { id: "p2", kind: "Pod", name: "aws-node-55dx8", x: 230, y: 320, parent: "ds1" },
      { id: "p3", kind: "Pod", name: "aws-node-mdjdb", x: 380, y: 320, parent: "ds1" },
      { id: "p4", kind: "Pod", name: "ebs-csi-node-7mr79", x: 540, y: 320, parent: "ds2", bad: true },
      { id: "p5", kind: "Pod", name: "ebs-csi-node-wvb69", x: 690, y: 320, parent: "ds2" },
      { id: "p6", kind: "Pod", name: "ebs-csi-node-z85st", x: 840, y: 320, parent: "ds2" },
    ];
    const byId = Object.fromEntries(N.map((n) => [n.id, n]));
    // Recursos no caminho do pod com problema também ficam marcados
    const badPath = new Set();
    N.filter((n) => n.bad).forEach((n) => {
      let c = n;
      while (c) {
        badPath.add(c.id);
        c = byId[c.parent];
      }
    });

    const W = 130, H = 46;
    const edges = N.filter((n) => n.parent).map((n) => {
      const p = byId[n.parent];
      const x1 = p.x, y1 = p.y + H / 2, x2 = n.x, y2 = n.y - H / 2, my = (y1 + y2) / 2;
      return { from: p.id, to: n.id, d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}` };
    });

    el.innerHTML = `
      <div class="g-graph-head">
        <div><strong>Security: ebs-csi-node-7mr79</strong><span class="g-muted">Pod running not as user</span></div>
        <span class="g-chip g-chip--err">Open</span>
      </div>
      <div class="g-graph-canvas">
        <svg viewBox="0 0 920 360" role="img" aria-label="Grafo: namespace kube-system, DaemonSets aws-node e ebs-csi-node e seus pods; o pod ebs-csi-node-7mr79 está com problema">
          <g data-ref="edges">${edges.map((e) => `<path d="${e.d}" data-from="${e.from}" data-to="${e.to}" class="g-edge${badPath.has(e.to) ? " g-edge--bad" : ""}"/>`).join("")}</g>
          <g data-ref="nodes">${N.map((n) => `
            <g class="g-node${badPath.has(n.id) ? " g-node--bad" : ""}" data-id="${n.id}" tabindex="0" transform="translate(${n.x - W / 2},${n.y - H / 2})">
              <rect class="g-node__box" width="${W}" height="${H}" rx="5"/>
              <rect class="g-node__cap" width="${W}" height="13" rx="5"/>
              <rect class="g-node__cap" y="7" width="${W}" height="6"/>
              <text class="g-node__kind" x="${W / 2}" y="10">${n.kind.toLowerCase()}</text>
              <text class="g-node__name" x="${W / 2}" y="33">${esc(n.name)}</text>
            </g>`).join("")}
          </g>
        </svg>
      </div>
      <div class="g-graph-detail" data-ref="detail"></div>`;

    const related = (id) => {
      const set = new Set([id]);
      let c = byId[id];
      while (c && c.parent) {
        set.add(c.parent);
        c = byId[c.parent];
      }
      const down = (pid) => N.filter((n) => n.parent === pid).forEach((n) => {
        set.add(n.id);
        down(n.id);
      });
      down(id);
      return set;
    };

    const svg = el.querySelector("svg");
    function highlight(id) {
      const rel = id ? related(id) : null;
      svg.classList.toggle("is-focus", !!id);
      svg.querySelectorAll(".g-node").forEach((g) => g.classList.toggle("is-rel", !!rel && rel.has(g.dataset.id)));
      svg.querySelectorAll(".g-edge").forEach((p) => p.classList.toggle("is-rel", !!rel && rel.has(p.dataset.from) && rel.has(p.dataset.to)));
    }

    function select(id) {
      const n = byId[id];
      svg.querySelectorAll(".g-node").forEach((g) => g.classList.toggle("is-sel", g.dataset.id === id));
      const kids = N.filter((c) => c.parent === id).length;
      const status = n.bad ? chip("Security: Pod running not as user", "err")
        : badPath.has(id) ? chip(`Afetado: ${kids ? "contém recurso com problema" : ""}`.trim(), "warn")
        : chip("Healthy", "ok");
      el.querySelector('[data-ref="detail"]').innerHTML = `
        <span><b>${esc(n.kind)}</b> ${esc(n.name)}</span>
        <span class="g-muted">${n.parent ? `owner: ${esc(byId[n.parent].kind)}/${esc(byId[n.parent].name)}` : "cluster: prod-aws"}</span>
        ${kids ? `<span class="g-muted">${kids} filhos</span>` : ""}
        ${status}`;
    }

    svg.querySelectorAll(".g-node").forEach((g) => {
      g.addEventListener("pointerenter", () => highlight(g.dataset.id));
      g.addEventListener("pointerleave", () => highlight(null));
      g.addEventListener("focus", () => highlight(g.dataset.id));
      g.addEventListener("blur", () => highlight(null));
      g.addEventListener("click", () => select(g.dataset.id));
      g.addEventListener("keydown", (ev) => ev.key === "Enter" && select(g.dataset.id));
    });

    select("p4");
  }

  // ---------------------------------------------------------------------------
  // Métricas (CPU / memória) — uma série por gráfico, crosshair + tooltip
  // ---------------------------------------------------------------------------
  function demoMetrics(el) {
    const TARGETS = {
      node: { label: "Node: ip-10-0-12-4", cpuMax: 8, cpuUnit: "cores", memMax: 30.19, memUnit: "GiB", cpu: 1.9, mem: 18.3 },
      pod: { label: "Pod: api-7d9f4-x2kqp", cpuMax: 1, cpuUnit: "cores", memMax: 0.5, memUnit: "GiB", cpu: 0.22, mem: 0.31 },
    };
    const N = 48;
    const series = {};
    Object.entries(TARGETS).forEach(([k, t]) => {
      const cpu = [], mem = [];
      let c = t.cpu, m = t.mem;
      for (let i = 0; i < N; i++) {
        c = clamp(c + rand(-0.12, 0.12) * t.cpuMax * 0.3 + (Math.random() < 0.08 ? t.cpuMax * 0.25 : 0), t.cpuMax * 0.05, t.cpuMax * 0.92);
        if (c > t.cpu * 2.2) c = t.cpu * 1.3;
        m = clamp(m + rand(-0.02, 0.025) * t.memMax, t.memMax * 0.3, t.memMax * 0.9);
        cpu.push(c);
        mem.push(m);
      }
      series[k] = { cpu, mem };
    });

    let target = "node";
    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-seg" aria-label="Recurso">
          <button type="button" data-t="node" class="is-on">Node</button>
          <button type="button" data-t="pod">Pod</button>
        </div>
        <span class="g-muted g-mono" data-ref="label"></span>
      </div>
      <div class="g-metrics">
        <div class="g-mcard" data-m="cpu"><div class="g-mcard__head"><span>CPU</span><span class="g-mcard__v" data-ref="cpuv"></span></div><div class="g-chart" data-ref="cpuc"></div></div>
        <div class="g-mcard" data-m="mem"><div class="g-mcard__head"><span>Memory</span><span class="g-mcard__v" data-ref="memv"></span></div><div class="g-chart" data-ref="memc"></div></div>
      </div>`;

    const ref = (k) => el.querySelector(`[data-ref="${k}"]`);
    const charts = {
      cpu: lineChart(ref("cpuc"), (v) => `${v.toFixed(2)} ${TARGETS[target].cpuUnit}`),
      mem: lineChart(ref("memc"), (v) => `${v.toFixed(2)} ${TARGETS[target].memUnit}`),
    };

    function render() {
      const t = TARGETS[target], s = series[target];
      ref("label").textContent = t.label;
      const c = s.cpu[N - 1], m = s.mem[N - 1];
      ref("cpuv").innerHTML = `<b>${c.toFixed(2)}</b> / ${t.cpuMax} ${t.cpuUnit} <span class="g-muted">· ${((c / t.cpuMax) * 100).toFixed(1)}%</span>`;
      ref("memv").innerHTML = `<b>${m.toFixed(2)}</b> / ${t.memMax} ${t.memUnit} <span class="g-muted">· ${((m / t.memMax) * 100).toFixed(1)}%</span>`;
      charts.cpu.draw(s.cpu, t.cpuMax);
      charts.mem.draw(s.mem, t.memMax);
    }

    el.querySelectorAll("[data-t]").forEach((b) =>
      b.addEventListener("click", () => {
        target = b.dataset.t;
        el.querySelectorAll("[data-t]").forEach((x) => x.classList.toggle("is-on", x === b));
        render();
      })
    );

    render();
    every(el, 1500, () => {
      Object.entries(TARGETS).forEach(([k, t]) => {
        const s = series[k];
        const lc = s.cpu[N - 1], lm = s.mem[N - 1];
        let c = clamp(lc + rand(-0.1, 0.1) * t.cpuMax * 0.3 + (Math.random() < 0.08 ? t.cpuMax * 0.2 : 0), t.cpuMax * 0.05, t.cpuMax * 0.92);
        if (c > t.cpu * 2.2) c = t.cpu * 1.3;
        s.cpu.push(c);
        s.cpu.shift();
        s.mem.push(clamp(lm + rand(-0.02, 0.022) * t.memMax, t.memMax * 0.3, t.memMax * 0.9));
        s.mem.shift();
      });
      render();
    });
  }

  function lineChart(host, fmt) {
    // viewBox acompanha o tamanho real do container para o texto não distorcer
    const PL = 34, PR = 6, PT = 8, PB = 20;
    let W = 320, H = 150;
    const gid = `g-area-${Math.random().toString(36).slice(2, 7)}`;
    host.innerHTML = `
      <svg class="g-line" role="img">
        <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="var(--g-accent)" stop-opacity="0.22"/><stop offset="1" stop-color="var(--g-accent)" stop-opacity="0"/>
        </linearGradient></defs>
        <g class="g-line__grid"></g>
        <path class="g-line__area" fill="url(#${gid})"/><path class="g-line__stroke"/>
        <line class="g-line__cross" visibility="hidden"/>
        <circle class="g-line__pt" r="4" visibility="hidden"/>
        <rect class="g-line__hit" fill="transparent"/>
      </svg>`;
    const svg = host.querySelector("svg");
    const tip = makeTooltip(host);
    let data = [], max = 1, active = null;

    const sx = (i) => PL + (i / (data.length - 1)) * (W - PL - PR);
    const sy = (v) => PT + (1 - v / max) * (H - PT - PB);

    function draw(d, m) {
      data = d;
      max = m;
      W = Math.max(200, host.clientWidth);
      H = Math.max(100, host.clientHeight);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const hit = svg.querySelector(".g-line__hit");
      hit.setAttribute("x", PL);
      hit.setAttribute("width", W - PL - PR);
      hit.setAttribute("height", H);
      const cross = svg.querySelector(".g-line__cross");
      cross.setAttribute("y1", PT);
      cross.setAttribute("y2", H - PB);
      const line = d.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join("");
      svg.querySelector(".g-line__stroke").setAttribute("d", line);
      svg.querySelector(".g-line__area").setAttribute("d", `${line}L${sx(d.length - 1)},${H - PB}L${PL},${H - PB}Z`);
      svg.querySelector(".g-line__grid").innerHTML = [0, 0.5, 1].map((f) =>
        `<line x1="${PL}" x2="${W - PR}" y1="${sy(m * f)}" y2="${sy(m * f)}"/><text x="${PL - 6}" y="${sy(m * f) + 3.5}">${+(m * f).toFixed(2)}</text>`
      ).join("") + `<text x="${PL}" y="${H - 5}" text-anchor="start">-${Math.round(d.length * 1.5)}s</text><text x="${W - PR}" y="${H - 5}" text-anchor="end">agora</text>`;
      svg.setAttribute("aria-label", `Último valor: ${fmt(d[d.length - 1])}`);
      if (active !== null) moveTo(active);
    }

    function moveTo(i, ev) {
      active = i;
      const x = sx(i), y = sy(data[i]);
      const cross = svg.querySelector(".g-line__cross"), pt = svg.querySelector(".g-line__pt");
      cross.setAttribute("x1", x);
      cross.setAttribute("x2", x);
      cross.setAttribute("visibility", "visible");
      pt.setAttribute("cx", x);
      pt.setAttribute("cy", y);
      pt.setAttribute("visibility", "visible");
      if (ev) {
        const secs = Math.round((data.length - 1 - i) * 1.5);
        tip.show(ev, `<strong>${esc(fmt(data[i]))}</strong><br><span class="g-muted">${secs ? `há ${secs}s` : "agora"}</span>`);
      }
    }

    const hit = svg.querySelector(".g-line__hit");
    hit.addEventListener("pointermove", (ev) => {
      const r = svg.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W;
      const i = clamp(Math.round(((px - PL) / (W - PL - PR)) * (data.length - 1)), 0, data.length - 1);
      moveTo(i, ev);
    });
    hit.addEventListener("pointerleave", () => {
      active = null;
      svg.querySelector(".g-line__cross").setAttribute("visibility", "hidden");
      svg.querySelector(".g-line__pt").setAttribute("visibility", "hidden");
      tip.hide();
    });
    if ("ResizeObserver" in window) new ResizeObserver(() => data.length && draw(data, max)).observe(host);

    return { draw };
  }

  // ---------------------------------------------------------------------------
  // Logs + shell
  // ---------------------------------------------------------------------------
  const LOG_POOL = [
    ["INFO", "GET /api/v1/orders 200 18ms"],
    ["INFO", "POST /api/v1/checkout 201 64ms"],
    ["INFO", "cache hit ratio=0.94 keys=18233"],
    ["WARN", "slow query detected duration=1240ms table=orders"],
    ["INFO", "GET /healthz 200 1ms"],
    ["ERROR", "connect ECONNREFUSED 10.0.3.12:5432 (postgres)"],
    ["INFO", "worker pool resized from 8 to 12"],
    ["INFO", "GET /api/v1/products?page=2 200 22ms"],
    ["WARN", "retrying request to payments-gateway attempt=2"],
  ];

  const SHELL = {
    help: () => [
      "Comandos disponíveis nesta demo:",
      "  kubectl get pods -n payments",
      "  kubectl get nodes",
      "  kubectl top pods -n payments",
      "  kubectl describe pod api-7d9f4-x2kqp",
      "  kubectl logs api-7d9f4-x2kqp",
      "  clear",
    ],
    "kubectl get pods": () => [
      "NAME                 READY   STATUS             RESTARTS   AGE",
      "api-7d9f4-x2kqp      0/1     CrashLoopBackOff   12         3h",
      "worker-5c8b9-9fjq    0/1     OOMKilled          4          1h",
      "migrate-db-k8s2      0/1     Pending            0          5m",
      "web-6f7d8-l2mnz      1/1     Running            0          2d",
    ],
    "kubectl get nodes": () => [
      "NAME            STATUS   ROLES    AGE   VERSION",
      "ip-10-0-12-4    Ready    <none>   41d   v1.30.4",
      "ip-10-0-8-21    Ready    <none>   41d   v1.30.4",
      "ip-10-0-1-2     Ready    <none>   12d   v1.30.4",
    ],
    "kubectl top pods": () => [
      "NAME                 CPU(cores)   MEMORY(bytes)",
      "api-7d9f4-x2kqp      221m         318Mi",
      "worker-5c8b9-9fjq    640m         498Mi",
      "web-6f7d8-l2mnz      12m          41Mi",
    ],
    "kubectl describe pod api-7d9f4-x2kqp": () => [
      "Name:         api-7d9f4-x2kqp",
      "Namespace:    payments",
      "Node:         ip-10-0-12-4/10.0.12.4",
      "Status:       Running",
      "Containers:",
      "  api:",
      "    Image:          registry.empresa.com/api:2.3.1",
      "    State:          Waiting (CrashLoopBackOff)",
      "    Last State:     Terminated (Error, exit code 1)",
      "    Restart Count:  12",
      "Events:",
      "  Warning  BackOff  2m (x48 over 3h)  kubelet  Back-off restarting failed container",
    ],
    "kubectl logs api-7d9f4-x2kqp": () => [
      "2026-10-05T14:31:58Z INFO  starting api v2.3.1",
      "2026-10-05T14:31:59Z INFO  connecting to postgres at 10.0.3.12:5432",
      "2026-10-05T14:32:04Z ERROR connect ECONNREFUSED 10.0.3.12:5432",
      "2026-10-05T14:32:04Z ERROR fatal: database unavailable, exiting",
    ],
  };

  function normalizeCmd(raw) {
    return raw.trim().replace(/\s+/g, " ").replace(/ -n payments$/, "").replace(/ --namespace payments$/, "");
  }

  function demoLogs(el) {
    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-seg" aria-label="Modo">
          <button type="button" data-mode="logs" class="is-on"><i data-lucide="scroll-text"></i>Logs</button>
          <button type="button" data-mode="shell"><i data-lucide="terminal"></i>Shell</button>
        </div>
        <div class="g-filters" data-ref="logctl">
          <span class="g-filter g-filter--solid g-hide-sm">container: api</span>
          <button type="button" class="g-filter g-filter--solid" data-ref="pause"><i data-lucide="pause"></i><span>Pause</span></button>
        </div>
      </div>
      <div class="g-logbox" data-ref="logs" aria-live="off"></div>
      <div class="g-logbox g-logbox--shell" data-ref="shell" hidden>
        <div data-ref="out"></div>
        <form class="g-shell-line" data-ref="form" autocomplete="off">
          <span class="g-accent">$</span>
          <input type="text" aria-label="Comando kubectl" spellcheck="false" placeholder="digite um comando ou help">
        </form>
      </div>
      <div class="g-shell-hints" data-ref="hints" hidden>
        ${["kubectl get pods -n payments", "kubectl describe pod api-7d9f4-x2kqp", "kubectl top pods -n payments", "help"].map((c) => `<button type="button" data-cmd="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>`;
    refreshIcons();

    const ref = (k) => el.querySelector(`[data-ref="${k}"]`);
    const logs = ref("logs");
    let paused = false;

    function logLine() {
      const [lvl, msg] = pick(LOG_POOL);
      const d = document.createElement("div");
      d.className = "g-log";
      d.innerHTML = `<span class="g-muted">${clock()}</span> <span class="g-lvl g-lvl--${lvl.toLowerCase()}">${lvl}</span> ${esc(msg)}`;
      logs.appendChild(d);
      while (logs.children.length > 80) logs.firstChild.remove();
      logs.scrollTop = logs.scrollHeight;
    }
    for (let i = 0; i < 12; i++) logLine();
    every(el, 900, () => !paused && !ref("logs").hidden && logLine());

    ref("pause").addEventListener("click", () => {
      paused = !paused;
      ref("pause").innerHTML = paused ? '<i data-lucide="play"></i><span>Resume</span>' : '<i data-lucide="pause"></i><span>Pause</span>';
      refreshIcons();
    });

    const out = ref("out");
    const input = ref("form").querySelector("input");
    const print = (lines, cls = "") => lines.forEach((l) => {
      const d = document.createElement("div");
      d.className = cls;
      d.textContent = l;
      out.appendChild(d);
    });
    print(["Shell de cluster conectado a prod-aws. Digite help para ver os comandos."], "g-muted");

    function run(raw) {
      const cmd = normalizeCmd(raw);
      const echo = document.createElement("div");
      echo.innerHTML = `<span class="g-accent">$</span> ${esc(raw)}`;
      out.appendChild(echo);
      if (!cmd) return;
      if (cmd === "clear") {
        out.innerHTML = "";
      } else if (SHELL[cmd]) {
        print(SHELL[cmd]());
      } else {
        print([`${cmd.split(" ")[0]}: comando não disponível nesta demo. Digite help.`], "g-err");
      }
      const box = ref("shell");
      box.scrollTop = box.scrollHeight;
    }

    ref("form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      run(input.value);
      input.value = "";
    });
    ref("shell").addEventListener("click", () => input.focus({ preventScroll: true }));
    ref("hints").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-cmd]");
      if (b) run(b.dataset.cmd);
    });

    el.querySelectorAll("[data-mode]").forEach((b) =>
      b.addEventListener("click", () => {
        const shell = b.dataset.mode === "shell";
        el.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("is-on", x === b));
        ref("logs").hidden = shell;
        ref("logctl").hidden = shell;
        ref("shell").hidden = !shell;
        ref("hints").hidden = !shell;
        if (shell) input.focus({ preventScroll: true });
      })
    );
  }

  // ---------------------------------------------------------------------------
  // ACK de incidente
  // ---------------------------------------------------------------------------
  const ACK_STATUS = {
    open: { label: "open", text: "" },
    progress: { label: "progress", text: "Incidente em andamento. Estamos trabalhando na correção." },
    waiting: { label: "waiting", text: "Aguardando ação externa ou mais informações para seguir." },
    finished: { label: "finished", text: "Resolvido. Ambiente voltando ao normal." },
  };

  function demoAck(el) {
    const initial = () => [
      { status: "progress", msg: "Analisando o CrashLoopBackOff do pod api-7d9f4-x2kqp.", by: "Ana Souza", at: "14:36" },
      { status: "open", msg: "", by: "Gita", at: "14:32" },
    ];
    let entries = initial();

    el.innerHTML = `
      <div class="g-graph-head">
        <div><strong>Incident: api-7d9f4-x2kqp</strong><span class="g-muted">pod status is not ready</span></div>
        <span data-ref="status"></span>
      </div>
      <form class="g-ack-form" data-ref="form">
        <input type="text" maxlength="120" placeholder="Mensagem para o time (opcional)" aria-label="Mensagem do acompanhamento">
        <div class="g-filters">
          <button type="submit" class="g-filter g-filter--solid" data-s="progress">In progress</button>
          <button type="submit" class="g-filter g-filter--solid" data-s="waiting">Waiting</button>
          <button type="submit" class="g-filter g-filter--solid" data-s="finished">Finished</button>
        </div>
      </form>
      <ol class="g-ack" data-ref="list"></ol>
      <button type="button" class="g-link" data-ref="reset" hidden>Reiniciar demo</button>`;

    const ref = (k) => el.querySelector(`[data-ref="${k}"]`);
    let next = "progress";
    const input = ref("form").querySelector("input");

    function render(fresh) {
      const cur = entries[0].status;
      const tone = cur === "finished" ? "ok" : cur === "open" ? "err" : "warn";
      ref("status").innerHTML = chip(cur === "finished" ? "Closed" : "Open", tone);
      ref("list").innerHTML = entries.map((e, i) => `
        <li class="${fresh && i === 0 ? "g-row-new" : ""}">
          <span class="g-ack__when">${esc(e.at)}</span>
          <span class="g-ack__dot g-ack__dot--${e.status}"></span>
          <div class="g-ack__body">
            <b>Status: ${esc(ACK_STATUS[e.status].label)}</b>
            ${e.msg ? `<p>${esc(e.msg)}</p>` : ""}
            <span class="g-muted">By: ${esc(e.by)}</span>
          </div>
        </li>`).join("");
      ref("reset").hidden = entries.length <= 2;
      ref("form").querySelectorAll("[data-s]").forEach((b) => (b.disabled = cur === "finished"));
    }

    ref("form").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-s]");
      if (b) next = b.dataset.s;
    });
    ref("form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const s = (ev.submitter && ev.submitter.dataset.s) || next;
      entries.unshift({ status: s, msg: input.value.trim() || ACK_STATUS[s].text, by: "Você", at: clock().slice(0, 5) });
      input.value = "";
      render(true);
    });
    ref("reset").addEventListener("click", () => {
      entries = initial();
      render(false);
    });

    render(false);
  }

  // ---------------------------------------------------------------------------
  // Compare (diff)
  // ---------------------------------------------------------------------------
  const DIFF = [
    [12, "  replicas: 5", 12, "  replicas: 2", "chg"],
    [13, "  strategy:", 13, "  strategy:", ""],
    [14, "    type: RollingUpdate", 14, "    type: RollingUpdate", ""],
    [21, "      - image: registry.empresa.com/api:2.3.1", 21, "      - image: registry.empresa.com/api:2.4.0-rc1", "chg"],
    [22, "        name: api", 22, "        name: api", ""],
    [27, "            memory: 512Mi", 27, "            memory: 256Mi", "chg"],
    [28, "            cpu: 500m", 28, "            cpu: 500m", ""],
    [33, "          - name: LOG_LEVEL", 33, "          - name: LOG_LEVEL", ""],
    [34, "            value: info", 34, "            value: debug", "chg"],
    [null, null, 35, "          - name: FEATURE_NEW_CHECKOUT", "add"],
    [null, null, 36, '            value: "true"', "add"],
  ];

  function demoCompare(el) {
    let mode = "split";
    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-compare-title"><b>api</b><span class="g-muted">prod-aws</span><i data-lucide="arrow-right"></i><b>api</b><span class="g-muted">staging-gcp</span></div>
        <div class="g-seg" aria-label="Modo do diff">
          <button type="button" data-mode="inline">Inline</button>
          <button type="button" data-mode="split" class="is-on">Side-by-side</button>
        </div>
      </div>
      <div class="g-diff" data-ref="diff"></div>`;
    refreshIcons();

    const box = el.querySelector('[data-ref="diff"]');
    const ln = (n) => `<span class="g-diff__n">${n ?? ""}</span>`;

    function render() {
      if (mode === "split") {
        box.className = "g-diff g-diff--split";
        box.innerHTML = DIFF.map(([a, at, b, bt, t]) => `
          <div class="g-diff__row">
            <div class="g-diff__cell ${t ? (at === null ? "is-empty" : "is-del") : ""}">${ln(a)}<code>${at === null ? "" : esc(at)}</code></div>
            <div class="g-diff__cell ${t ? "is-add" : ""}">${ln(b)}<code>${esc(bt)}</code></div>
          </div>`).join("");
      } else {
        box.className = "g-diff g-diff--inline";
        box.innerHTML = DIFF.flatMap(([a, at, b, bt, t]) => {
          if (!t) return [`<div class="g-diff__cell">${ln(b)}<code>  ${esc(bt)}</code></div>`];
          const rows = [];
          if (at !== null) rows.push(`<div class="g-diff__cell is-del">${ln(a)}<code>- ${esc(at)}</code></div>`);
          rows.push(`<div class="g-diff__cell is-add">${ln(b)}<code>+ ${esc(bt)}</code></div>`);
          return rows;
        }).join("");
      }
    }

    el.querySelectorAll("[data-mode]").forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.mode;
        el.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("is-on", x === b));
        render();
      })
    );
    render();
  }

  // ---------------------------------------------------------------------------
  // Regras
  // ---------------------------------------------------------------------------
  const RULES = [
    ["Image registry prohibited", "AllowedRegistries", "CRITICAL", "security", true],
    ["Container should not be privileged", "PrivilegedContainers", "CRITICAL", "security", true],
    ["Containers should not run with allowPrivilegeEscalation", "PrivilegeEscalation", "CRITICAL", "security", true],
    ["Auto ServiceAccount token mounted", "AutoSaToken", "HIGH", "security", true],
    ["HostPath volume", "HostPathVolumes", "HIGH", "security", false],
    ["cpu requests should be set", "CpuRequests", "MEDIUM", "problem", true],
    ["liveness probe must be present", "LivenessProbe", "MEDIUM", "problem", true],
    ["readiness probe must be present", "ReadinessProbe", "MEDIUM", "problem", false],
  ];
  const sevTone = (s) => (s === "CRITICAL" ? "err" : s === "HIGH" ? "orange" : "warn");

  function demoRules(el) {
    const rules = RULES.map((r) => ({ name: r[0], cls: r[1], sev: r[2], type: r[3], on: r[4] }));
    const state = { types: new Set(["security", "problem"]), q: "" };

    el.innerHTML = `
      <div class="g-toolbar">
        <div class="g-filters">
          ${["security", "problem"].map((t) => `<button type="button" class="g-filter is-on" data-type="${t}" aria-pressed="true"><i data-lucide="check"></i>${t}</button>`).join("")}
        </div>
        <label class="g-search"><i data-lucide="search"></i><input type="search" placeholder="Search..." aria-label="Buscar regras"></label>
      </div>
      <div class="g-table-wrap">
        <table class="g-table">
          <thead><tr><th>Name</th><th class="g-hide-md">Class Name</th><th>Severity</th><th class="g-hide-sm">Type</th><th>Enabled</th></tr></thead>
          <tbody data-ref="body"></tbody>
        </table>
      </div>
      <p class="g-hint" data-ref="count"></p>`;
    refreshIcons();

    const body = el.querySelector('[data-ref="body"]');
    function render() {
      const list = rules.map((r, i) => ({ r, i })).filter(({ r }) => state.types.has(r.type) && (!state.q || `${r.name} ${r.cls}`.toLowerCase().includes(state.q)));
      body.innerHTML = list.length ? list.map(({ r, i }) => `
        <tr>
          <td class="g-trunc">${esc(r.name)}</td>
          <td class="g-hide-md g-muted">${esc(r.cls)}</td>
          <td>${chip(r.sev, sevTone(r.sev))}</td>
          <td class="g-hide-sm">${esc(r.type)}</td>
          <td><button type="button" class="g-switch${r.on ? " is-on" : ""}" role="switch" aria-checked="${r.on}" aria-label="Ativar ${esc(r.name)}" data-i="${i}"><span></span></button></td>
        </tr>`).join("") : `<tr><td colspan="5" class="g-empty">Nenhuma regra para este filtro.</td></tr>`;
      const on = rules.filter((r) => r.on).length;
      el.querySelector('[data-ref="count"]').textContent = `${on} de ${rules.length} regras ativas. Mudanças entram no próximo processamento do cluster.`;
    }

    body.addEventListener("click", (ev) => {
      const b = ev.target.closest(".g-switch");
      if (!b) return;
      const r = rules[Number(b.dataset.i)];
      r.on = !r.on;
      render();
    });
    el.querySelectorAll("[data-type]").forEach((b) =>
      b.addEventListener("click", () => {
        const t = b.dataset.type;
        if (state.types.has(t)) state.types.delete(t);
        else state.types.add(t);
        const on = state.types.has(t);
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
        render();
      })
    );
    el.querySelector("input[type=search]").addEventListener("input", (ev) => {
      state.q = ev.target.value.trim().toLowerCase();
      render();
    });
    render();
  }

  // ---------------------------------------------------------------------------
  // kubectl get pods com diagnóstico do Gita (seção de problemas)
  // ---------------------------------------------------------------------------
  const PODS = [
    ["api-7d9f4-x2kqp", "0/1", "CrashLoopBackOff", "err", 12, "3h", "Container api termina com exit code 1: não conecta no postgres (10.0.3.12:5432). 48 restarts em 3h."],
    ["worker-5c8b9-9fjq", "0/1", "OOMKilled", "err", 4, "1h", "Uso de memória chegou ao limit de 512Mi. Recomendo revisar resources.limits.memory."],
    ["migrate-db-k8s2", "0/1", "Pending", "warn", 0, "5m", "0/3 nodes disponíveis: memória insuficiente para o request de 2Gi."],
    ["web-6f7d8-l2mnz", "1/1", "Running", "ok", 0, "2d", "Saudável. Sem eventos de warning nas últimas 24h."],
    ["web-6f7d8-q9wtx", "1/1", "Running", "ok", 0, "2d", "Readiness probe falhou 3 vezes há 40 min e se recuperou."],
  ];

  function demoPods(el) {
    let sel = 0;
    el.innerHTML = `
      <div class="g-term-bar"><span class="g-dots"><i></i><i></i><i></i></span><span>kubectl — payments</span></div>
      <div class="g-term-body">
        <div><span class="g-accent">$</span> kubectl get pods -n payments</div>
        <table class="g-pods">
          <thead><tr><th>NAME</th><th>READY</th><th>STATUS</th><th class="g-hide-sm">RESTARTS</th><th>AGE</th></tr></thead>
          <tbody data-ref="body"></tbody>
        </table>
      </div>
      <div class="g-term-foot" data-ref="foot" aria-live="polite"></div>`;
    const body = el.querySelector('[data-ref="body"]');

    function render() {
      body.innerHTML = PODS.map((p, i) => `
        <tr data-i="${i}" tabindex="0" class="${i === sel ? "is-sel" : ""}">
          <td>${esc(p[0])}</td><td>${p[1]}</td><td class="g-tone-${p[3]}">${esc(p[2])}</td><td class="g-hide-sm">${p[4]}</td><td>${p[5]}</td>
        </tr>`).join("");
      const p = PODS[sel];
      el.querySelector('[data-ref="foot"]').innerHTML = `
        <img src="img/icon-gita.svg" width="16" height="16" alt="">
        <div><b>${esc(p[0])}</b> <span class="g-tone-${p[3]}">${esc(p[2])}</span><p>${esc(p[6])}</p></div>`;
    }

    body.addEventListener("click", (ev) => {
      const tr = ev.target.closest("tr[data-i]");
      if (tr) {
        sel = Number(tr.dataset.i);
        render();
      }
    });
    body.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.matches("tr[data-i]")) {
        sel = Number(ev.target.dataset.i);
        render();
      }
    });
    render();
  }

  // ---------------------------------------------------------------------------
  // Console do hero: sidebar de clusters + views
  // ---------------------------------------------------------------------------
  const CLUSTERS = {
    "prod-aws": { tag: "EKS", status: "ok", tiles: [16, 4, 1, 3], pods: [170, 180], cpu: 39, mem: 59, nodes: ["ip-10-0-12-4", "ip-10-0-8-21", "ip-10-0-1-2"] },
    "staging-gcp": { tag: "GKE", status: "ok", tiles: [6, 1, 0, 0], pods: [64, 66], cpu: 22, mem: 41, nodes: ["gke-pool-a-1", "gke-pool-a-2"] },
    "onprem-dc": { tag: "on-prem", status: "warn", tiles: [23, 9, 2, 5], pods: [212, 240], cpu: 71, mem: 83, nodes: ["k8s-worker-01", "k8s-worker-02", "k8s-worker-03"] },
  };
  const VIEWS = [
    { id: "overview", label: "Overview", icon: "layout-dashboard" },
    { id: "events", label: "Events", icon: "activity" },
    { id: "timeline", label: "Timeline", icon: "chart-gantt" },
    { id: "audit", label: "Audit", icon: "shield-check" },
  ];

  function demoConsole(el) {
    const state = { cluster: "prod-aws", view: "overview", touched: false };

    el.innerHTML = `
      <aside class="g-side">
        <div class="g-side__brand"><img src="img/icon-gita.svg" width="18" height="18" alt=""><span>Ambiente GITA</span></div>
        <span class="g-side__label">Clusters</span>
        <div class="g-side__clusters" role="tablist" aria-label="Clusters">
          ${Object.entries(CLUSTERS).map(([name, c]) => `
            <button type="button" data-cluster="${name}"><span class="g-dot g-dot--${c.status}"></span><span>${name}</span><small>${c.tag}</small></button>`).join("")}
        </div>
        <span class="g-side__label">Cluster</span>
        <nav class="g-side__nav" aria-label="Telas">
          ${VIEWS.map((v) => `<button type="button" data-view="${v.id}"><i data-lucide="${v.icon}"></i><span>${v.label}</span></button>`).join("")}
        </nav>
      </aside>
      <div class="g-main">
        <div class="g-main__bar">
          <span class="g-crumbs" data-ref="crumbs"></span>
          <span class="g-live"><span class="g-dot g-dot--ok"></span>live</span>
        </div>
        <div class="g-main__body">
          <div data-pane="overview"></div>
          <div data-pane="events" hidden></div>
          <div data-pane="timeline" hidden></div>
          <div data-pane="audit" hidden></div>
        </div>
      </div>`;
    refreshIcons();

    const pane = (id) => el.querySelector(`[data-pane="${id}"]`);
    const mounted = new Set();
    const mounters = { events: demoEvents, timeline: demoTimeline, audit: (p) => demoAudit(p) };

    // Overview
    const ov = pane("overview");
    function renderOverview() {
      const c = CLUSTERS[state.cluster];
      const labels = [["Problems", "triangle-alert", "warn"], ["Security", "shield-alert", "err"], ["Incidents", "siren", "err"], ["Alerts", "bell", "warn"]];
      ov.innerHTML = `
        <div class="g-tiles">
          ${labels.map(([l, ic, tone], i) => `
            <button type="button" class="g-tile" data-go="timeline">
              <span class="g-tile__icon g-tone-${c.tiles[i] ? tone : "ok"}"><i data-lucide="${ic}"></i></span>
              <span class="g-tile__v">${c.tiles[i]}</span><span class="g-tile__l">${l}</span>
            </button>`).join("")}
        </div>
        <div class="g-gauges">
          ${gauge("Pods", (c.pods[0] / c.pods[1]) * 100, `${c.pods[0]} / ${c.pods[1]}`, "pods")}
          ${gauge("CPU", c.cpu, `${c.cpu}%`, "cpu")}
          ${gauge("Memory", c.mem, `${c.mem}%`, "mem")}
        </div>
        <table class="g-table g-table--compact">
          <thead><tr><th>Node</th><th>Status</th><th>CPU</th><th class="g-hide-sm">Memory</th></tr></thead>
          <tbody>${c.nodes.map((n, i) => `
            <tr data-node="${i}"><td class="g-trunc">${esc(n)}</td><td>${chip("Ready", "ok")}</td>
              <td><span class="g-meter"><span style="width:${c.cpu}%"></span></span><span class="g-meter__v" data-v="cpu">${c.cpu}%</span></td>
              <td class="g-hide-sm"><span class="g-meter"><span style="width:${c.mem}%"></span></span><span class="g-meter__v" data-v="mem">${c.mem}%</span></td></tr>`).join("")}
          </tbody>
        </table>`;
      ov.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
        state.touched = true;
        go(b.dataset.go);
      }));
      refreshIcons();
    }

    function gauge(label, pct, text, key) {
      const r = 22, c = 2 * Math.PI * r;
      const tone = pct > 80 ? "var(--g-warn)" : "var(--g-accent)";
      return `<div class="g-gauge" data-g="${key}">
        <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
          <circle cx="28" cy="28" r="${r}" fill="none" stroke="var(--g-line-strong)" stroke-width="5"/>
          <circle cx="28" cy="28" r="${r}" fill="none" stroke="${tone}" stroke-width="5" stroke-linecap="round"
            stroke-dasharray="${(pct / 100) * c} ${c}" transform="rotate(-90 28 28)" class="g-gauge__arc"/>
        </svg>
        <div><span class="g-gauge__v">${esc(text)}</span><span class="g-gauge__l">${label}</span></div>
      </div>`;
    }

    // Oscilação leve dos medidores do overview
    every(el, 2000, () => {
      if (state.view !== "overview") return;
      const c = CLUSTERS[state.cluster];
      ov.querySelectorAll("tr[data-node]").forEach((tr) => {
        [["cpu", c.cpu], ["mem", c.mem]].forEach(([k, base]) => {
          const v = Math.round(clamp(base + rand(-9, 9), 3, 97));
          const cell = tr.querySelector(`[data-v="${k}"]`);
          if (!cell) return;
          cell.textContent = `${v}%`;
          cell.previousElementSibling.firstElementChild.style.width = `${v}%`;
        });
      });
    });

    function crumbs() {
      const v = VIEWS.find((x) => x.id === state.view).label;
      el.querySelector('[data-ref="crumbs"]').innerHTML = `Ambiente GITA <span>›</span> ${esc(state.cluster)} <span>›</span> <b>${v}</b>`;
    }

    function go(view) {
      state.view = view;
      el.querySelectorAll("[data-view]").forEach((b) => {
        b.classList.toggle("is-on", b.dataset.view === view);
        b.setAttribute("aria-current", b.dataset.view === view ? "page" : "false");
      });
      VIEWS.forEach((v) => (pane(v.id).hidden = v.id !== view));
      if (mounters[view] && !mounted.has(view)) {
        mounters[view](pane(view));
        mounted.add(view);
      }
      crumbs();
    }

    function setCluster(name) {
      state.cluster = name;
      el.querySelectorAll("[data-cluster]").forEach((b) => b.classList.toggle("is-on", b.dataset.cluster === name));
      renderOverview();
      crumbs();
    }

    el.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
      state.touched = true;
      go(b.dataset.view);
    }));
    el.querySelectorAll("[data-cluster]").forEach((b) => b.addEventListener("click", () => {
      state.touched = true;
      setCluster(b.dataset.cluster);
      go("overview");
    }));
    el.addEventListener("pointerdown", () => (state.touched = true));
    el.addEventListener("keydown", () => (state.touched = true));

    setCluster("prod-aws");
    go("overview");

    // Tour automático até a primeira interação
    const order = VIEWS.map((v) => v.id);
    every(el, 6500, () => {
      if (state.touched) return;
      go(order[(order.indexOf(state.view) + 1) % order.length]);
    });
  }

  // ---------------------------------------------------------------------------
  // Abas da seção "Gerencie e otimize"
  // ---------------------------------------------------------------------------
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((root) => {
      const tabs = root.querySelectorAll("[data-tab]");
      const panels = root.querySelectorAll("[data-panel]");
      tabs.forEach((t) => t.addEventListener("click", () => {
        tabs.forEach((x) => {
          x.classList.toggle("active", x === t);
          x.setAttribute("aria-selected", String(x === t));
        });
        panels.forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
      }));
    });
  }

  const DEMOS = {
    console: demoConsole,
    events: demoEvents,
    timeline: demoTimeline,
    audit: demoAudit,
    graph: demoGraph,
    metrics: demoMetrics,
    logs: demoLogs,
    ack: demoAck,
    compare: demoCompare,
    rules: demoRules,
    pods: demoPods,
  };

  function init() {
    initTabs();
    document.querySelectorAll("[data-demo]").forEach((el) => {
      const fn = DEMOS[el.dataset.demo];
      if (fn) fn(el);
    });
    refreshIcons();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
