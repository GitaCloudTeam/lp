// Réplica da interface do gita-web no hero da LP.
// A tela é montada no tamanho real do app (1440px, mesmas medidas do Tailwind/shadcn do gita-web)
// e depois escalada para caber no container, como um print interativo.
// Estrutura copiada de: routes/LayoutWithSidebar, SidebarCluster, GitaNavbar,
// pages/Dashboard, pages/Events, pages/Timeline e pages/Audit.

(function () {
  "use strict";

  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const icon = (name, cls = "") => `<i data-lucide="${name}" class="${cls}"></i>`;
  const icons = () => window.lucide && window.lucide.createIcons();

  // Mesmas cores do GitaChip (variant ghost)
  const chip = (value, color, extra = "") => `<span class="ga-chip ga-chip--${color} ${extra}">${esc(value)}</span>`;

  // --------------------------------------------------------------------------
  // Dados fictícios
  // --------------------------------------------------------------------------
  const CLUSTER = { org: "Ambiente GITA", name: "Gita PROD", version: "v1.30.4-eks" };

  const NODES = [
    { name: "ip-10-0-105-168.ec2.internal", pods: [42, 3], cpu: 38, mem: 61 },
    { name: "ip-10-0-108-165.ec2.internal", pods: [55, 1], cpu: 52, mem: 74 },
    { name: "ip-10-0-70-105.ec2.internal", pods: [37, 0], cpu: 21, mem: 48 },
    { name: "ip-10-0-91-32.ec2.internal", pods: [36, 2], cpu: 83, mem: 66 },
  ];

  const EVENT_POOL = [
    ["limpeza-metrica-28959386.181d107e14c5d", "gita-limpeza", "ADDED", "Normal", "Completed", "Job", "Job completed"],
    ["limpeza-metrica-28959386-4hfts.181d107", "gita-limpeza", "ADDED", "Normal", "Started", "Pod", "Started container limpeza-metrica"],
    ["limpeza-metrica-28959386-4hfts.181d107", "gita-limpeza", "ADDED", "Normal", "Created", "Pod", "Created container limpeza-metrica"],
    ["limpeza-metrica-28959386-4hfts.181d107", "gita-limpeza", "ADDED", "Normal", "Pulled", "Pod", 'Container image "registry.gitlab.com/gita-cron:1.4" already present'],
    ["api-principal-geral-555dd449b4-x2kqp", "gita-api-principal", "ADDED", "Warning", "BackOff", "Pod", "Back-off restarting failed container api"],
    ["api-notificacoes-79f65c99bc-6mvck", "gita-alertas", "ADDED", "Warning", "Unhealthy", "Pod", "Readiness probe failed: HTTP probe failed with statuscode: 503"],
    ["api-principal-geral", "gita-api-principal", "ADDED", "Normal", "ScalingReplicaSet", "Deployment", "Scaled up replica set api-principal-geral-7bd6645b55 to 3"],
    ["ip-10-0-91-32.ec2.internal", "-", "ADDED", "Warning", "NodeHasDiskPressure", "Node", "Node ip-10-0-91-32 status is now: NodeHasDiskPressure"],
    ["limpeza-metrica-28959325", "gita-limpeza", "DELETED", "Normal", "SuccessfulCreate", "Job", "Created pod: limpeza-metrica-28959325-mr76m"],
    ["rabbitmq-server-0", "gita-mensageria", "ADDED", "Normal", "Pulled", "Pod", 'Container image "rabbitmq:3.13-management" already present on machine'],
  ];

  const TIMELINE_ROWS = [
    ["event", "08:57:AM 01-20-2025", "api-cluster-b8559d55-77l7z.181c5cd3c919", "gita-api-principal", "Pod", "Unhealthy", "ADDED"],
    ["problem", "09:16:AM 01-20-2025", "api-notificacoes-79f65c99bc-6mvck", "gita-alertas", "container", "does not have resources configurade", "cpu requests should be set"],
    ["problem", "09:16:AM 01-20-2025", "api-notificacoes-79f65c99bc-6mvck", "gita-alertas", "container", "does not have resources configurade", "readiness probe must be present"],
    ["problem", "09:16:AM 01-20-2025", "api-notificacoes-79f65c99bc-6mvck", "gita-alertas", "container", "does not have resources configurade", "liveness probe must be present"],
    ["problem", "09:16:AM 01-20-2025", "api-notificacoes-79f65c99bc-26nrz", "gita-alertas", "container", "does not have resources configurade", "cpu requests should be set"],
    ["change", "01:04:PM 01-20-2025", "api-principal-geral-555dd449b4", "gita-api-principal", "Replicaset", "replicas: 2 → 0", "MODIFIED"],
  ];

  const AUDIT = [
    ["2026/10/05 02:32pm", "UPDATE", "ana.souza@empresa.com", "Deployment", "api-principal-geral", "gita-api-principal", "apps/v1, Kind=Deployment", "replace", "/spec/replicas", "3", "10.0.12.4"],
    ["2026/10/05 01:05pm", "DELETE", "system:serviceaccount:argocd:argocd-application-controller", "Secret", "db-credentials", "gita-api-principal", "v1, Kind=Secret", "remove", "/metadata/name", "db-credentials", "10.0.8.21"],
    ["2026/10/05 11:47am", "CREATE", "joao.lima@empresa.com", "ConfigMap", "feature-flags", "gita-alertas", "v1, Kind=ConfigMap", "add", "/data/NEW_CHECKOUT", "true", "10.0.12.9"],
    ["2026/10/05 10:22am", "UPDATE", "kubernetes-admin", "Ingress", "gita-web", "gita-web", "networking.k8s.io/v1, Kind=Ingress", "replace", "/spec/rules/0/host", "app.gita.cloud", "10.0.1.2"],
    ["2026/10/05 09:18am", "CREATE", "ci-deployer", "Job", "migrate-db-1-4-2", "gita-api-principal", "batch/v1, Kind=Job", "add", "/spec/template/spec/containers/0/image", "migrate:1.4.2", "10.0.8.21"],
    ["2026/10/05 08:41am", "DELETE", "ana.souza@empresa.com", "Pod", "api-notificacoes-79f65c99bc-6mvck", "gita-alertas", "v1, Kind=Pod", "remove", "/metadata/name", "api-notificacoes-79f65c99bc-6mvck", "10.0.12.4"],
    ["2026/10/05 08:03am", "UPDATE", "joao.lima@empresa.com", "Service", "rabbitmq", "gita-mensageria", "v1, Kind=Service", "replace", "/spec/ports/0/targetPort", "5672", "10.0.12.9"],
    ["2026/10/04 06:55pm", "UPDATE", "ci-deployer", "Deployment", "api-notificacoes", "gita-alertas", "apps/v1, Kind=Deployment", "replace", "/spec/template/spec/containers/0/image", "api-notificacoes:2.8.1", "10.0.8.21"],
  ];

  // Sidebar igual à do useSidebarCluster (só os itens visíveis por padrão)
  const SIDEBAR_CLUSTER = [
    { id: "dashboard", title: "Dashboard", icon: "layout-grid", view: "dashboard" },
    { id: "timeline", title: "Timeline", icon: "chart-gantt", view: "timeline" },
    {
      id: "health", title: "Health", icon: "activity", items: [
        { id: "events", title: "Cluster Events", icon: "calendar-days", view: "events" },
        { id: "toppods", title: "Top Pods", icon: "area-chart" },
        { id: "memory", title: "Memory Issue", icon: "memory-stick" },
        { id: "recs", title: "Recommendations", icon: "monitor" },
        { id: "alerts", title: "Alerts", icon: "siren", chevron: true },
        { id: "incidents", title: "Incidents", icon: "circle-alert", chevron: true },
      ],
    },
    {
      id: "misconf", title: "Misconfigurations", icon: "server-crash", items: [
        { id: "security", title: "Security", icon: "shield-alert", chevron: true },
        { id: "problem", title: "Problem", icon: "triangle-alert", chevron: true },
      ],
    },
    {
      id: "inventory", title: "Inventory", icon: "box", items: [
        { id: "nodes", title: "Nodes", icon: "server" },
        { id: "namespace", title: "Namespace", icon: "folder-tree" },
        { id: "workload", title: "Workload", icon: "cpu", chevron: true },
        { id: "discovery", title: "Service Discovery", icon: "network", chevron: true },
        { id: "storage", title: "Storage", icon: "database", chevron: true },
      ],
    },
    { id: "audit", title: "Audit", icon: "logs", view: "audit" },
    { id: "resources", title: "Resources", icon: "rectangle-ellipsis", items: [] },
    {
      id: "config", title: "Configuration", icon: "server-cog", items: [
        { id: "rules", title: "Rules", icon: "book" },
        { id: "install", title: "Installation", icon: "hard-drive-download" },
        { id: "users", title: "Users", icon: "users" },
        { id: "notif", title: "Notifications", icon: "bell-dot" },
        { id: "settings", title: "Settings", icon: "settings" },
      ],
    },
  ];

  const VIEW_LABEL = { dashboard: "Dashboard", timeline: "Timeline", events: "Events", audit: "Audit" };

  // --------------------------------------------------------------------------
  // Shell (sidebar + navbar)
  // --------------------------------------------------------------------------
  function mount(stage) {
    const BASE_H = 900;
    const state = { view: "dashboard", open: new Set(["health"]), touched: false, compact: false };

    stage.innerHTML = `
      <div class="ga-shell" style="height:${BASE_H}px">
        <aside class="ga-side">
          <div class="ga-side__logo"><img src="img/logo-gita-white.svg" alt="gita" width="48"><img src="img/icon-gita.svg" alt="" width="20" class="ga-side__mark"></div>
          <div class="ga-side__search"><button type="button" class="ga-btn ga-btn--secondary ga-search-btn" data-soon>
            <span class="ga-row">${icon("search", "ga-ic")}<span class="ga-muted ga-label">Search cluster</span></span>
            <span class="ga-kbd ga-label">${icon("command", "ga-ic-sm")}<b>K</b></span>
          </button></div>
          <div class="ga-group"><span class="ga-group__label">Gita</span>
            <button type="button" class="ga-menu" data-soon>${icon("home")}<span>Home</span></button>
          </div>
          <div class="ga-group"><span class="ga-group__label">Cluster</span><div data-ref="menu"></div></div>
          <div class="ga-group ga-group--bottom"><span class="ga-group__label">Organization</span>
            <button type="button" class="ga-menu" data-soon>${icon("home")}<span>Home</span></button>
            <button type="button" class="ga-menu" data-soon>${icon("credit-card")}<span>Billing</span></button>
            <button type="button" class="ga-menu" data-soon>${icon("settings")}<span>Settings</span></button>
          </div>
        </aside>
        <div class="ga-main">
          <header class="ga-nav">
            <div class="ga-row ga-nav__left">
              <button type="button" class="ga-icon-btn" data-ref="collapse" aria-label="Recolher sidebar">${icon("panel-left")}</button>
              <span class="ga-vsep"></span>
              <nav class="ga-crumbs" data-ref="crumbs"></nav>
            </div>
            <div class="ga-row ga-nav__right">
              <button type="button" class="ga-icon-btn" data-soon aria-label="Importar YAML">${icon("upload")}</button>
              <button type="button" class="ga-icon-btn" data-soon aria-label="Shell">${icon("terminal")}</button>
              <button type="button" class="ga-icon-btn ga-bell" data-soon aria-label="Notificações">${icon("bell")}</button>
              <button type="button" class="ga-icon-btn" data-soon aria-label="Ajuda">${icon("circle-help")}</button>
              <button type="button" class="ga-avatar" data-soon aria-label="Usuário">${icon("user")}</button>
            </div>
          </header>
          <div class="ga-page" data-ref="page">
            <section data-view="dashboard"></section>
            <section data-view="timeline" hidden></section>
            <section data-view="events" hidden></section>
            <section data-view="audit" hidden></section>
          </div>
        </div>
      </div>`;

    stage.insertAdjacentHTML("beforeend", `
      <div class="ga-modal" data-ref="modal" hidden>
        <div class="ga-modal__backdrop" data-close-modal></div>
        <div class="ga-modal__box" role="dialog" aria-modal="true" aria-labelledby="ga-modal-title">
          <button type="button" class="ga-modal__x" data-close-modal aria-label="Fechar">${icon("x")}</button>
          <span class="ga-modal__icon"><img src="img/icon-gita.svg" alt="" width="22" height="22"></span>
          <h3 id="ga-modal-title" data-ref="modal-title"></h3>
          <p data-ref="modal-text"></p>
          <div class="ga-modal__actions">
            <a href="https://app.gita.cloud/register" target="_blank" rel="noopener" class="ga-modal__cta" data-ref="modal-cta"></a>
            <button type="button" class="ga-modal__ghost" data-close-modal data-ref="modal-back"></button>
          </div>
          <small data-ref="modal-note"></small>
        </div>
      </div>`);

    const shell = stage.querySelector(".ga-shell");
    const ref = (k) => shell.querySelector(`[data-ref="${k}"]`);
    const section = (v) => shell.querySelector(`[data-view="${v}"]`);

    // Escala: 1440px no desktop; abaixo de 900px usa base menor com sidebar recolhida (como o app)
    function fit() {
      const w = stage.clientWidth;
      const compact = w < 900;
      const base = compact ? 820 : 1600;
      if (compact !== state.compact) {
        state.compact = compact;
        shell.classList.toggle("is-collapsed", compact);
      }
      const s = w / base;
      shell.style.width = `${base}px`;
      shell.style.transform = `scale(${s})`;
      stage.style.height = `${BASE_H * s}px`;
    }
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(stage);
    else window.addEventListener("resize", fit);

    function renderMenu() {
      ref("menu").innerHTML = SIDEBAR_CLUSTER.map((it) => {
        const active = it.view === state.view || (it.items || []).some((s) => s.view === state.view);
        if (!it.items) {
          return `<button type="button" class="ga-menu ${active ? "is-active" : ""}" ${it.view ? `data-go="${it.view}"` : "data-soon"} title="${esc(it.title)}">${icon(it.icon)}<span>${esc(it.title)}</span></button>`;
        }
        const open = state.open.has(it.id);
        return `
          <button type="button" class="ga-menu ${active ? "is-active" : ""}" data-toggle="${it.id}" aria-expanded="${open}" title="${esc(it.title)}">
            ${icon(it.icon)}<span>${esc(it.title)}</span>${icon("chevron-right", `ga-chev ${open ? "is-open" : ""}`)}
          </button>
          ${open && it.items.length ? `<div class="ga-sub">${it.items.map((s) => `
            <button type="button" class="ga-menu ga-menu--sub ${s.view === state.view ? "is-active" : ""}" ${s.view ? `data-go="${s.view}"` : "data-soon"}>
              ${icon(s.icon)}<span>${esc(s.title)}</span>${s.chevron ? icon("chevron-right", "ga-chev") : ""}
            </button>`).join("")}</div>` : ""}`;
      }).join("");
      icons();
    }

    function renderCrumbs() {
      ref("crumbs").innerHTML = `
        <span>${CLUSTER.org}</span>${icon("chevron-right", "ga-crumb-sep")}
        <span class="ga-row ga-gap-2"><span class="ga-ping"><span></span><span></span></span>${CLUSTER.name}</span>${icon("chevron-right", "ga-crumb-sep")}
        <b>${VIEW_LABEL[state.view]}</b>`;
      icons();
    }

    const COPY = {
      pt: {
        title: (f) => (f ? `${f} está no Gita completo` : "Explore o Gita completo"),
        text: "Esta demo mostra só algumas telas. Crie sua conta e conecte seu cluster para usar todas as funcionalidades com seus próprios dados.",
        cta: "Criar conta grátis",
        back: "Continuar na demo",
        note: "15 dias grátis",
      },
      en: {
        title: (f) => (f ? `${f} is in the full Gita` : "Explore the full Gita"),
        text: "This demo shows just a few screens. Create your account and connect your cluster to use every feature with your own data.",
        cta: "Create free account",
        back: "Back to the demo",
        note: "15-day free trial",
      },
    };

    const modal = stage.querySelector('[data-ref="modal"]');
    const mref = (k) => modal.querySelector(`[data-ref="${k}"]`);
    let lastFocus = null;

    function soon(trigger) {
      let lang = "pt";
      try { lang = localStorage.getItem("lang") === "en" ? "en" : "pt"; } catch (e) { /* storage bloqueado */ }
      const c = COPY[lang];
      const label = trigger && (trigger.querySelector("span")?.textContent || trigger.getAttribute("aria-label") || "").trim();
      mref("modal-title").textContent = c.title(label);
      mref("modal-text").textContent = c.text;
      mref("modal-cta").textContent = c.cta;
      mref("modal-back").textContent = c.back;
      mref("modal-note").textContent = c.note;
      lastFocus = trigger;
      modal.hidden = false;
      icons();
      mref("modal-cta").focus({ preventScroll: true });
      if (typeof window.gtag === "function") window.gtag("event", "demo_menu_click", { item: label || "unknown" });
    }

    function closeModal() {
      modal.hidden = true;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    modal.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-close-modal]")) closeModal();
    });
    mref("modal-cta").addEventListener("click", () => {
      if (typeof window.gtag === "function") window.gtag("event", "demo_register_click");
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && !modal.hidden) closeModal();
    });

    const mounted = new Set();
    const builders = { dashboard: viewDashboard, timeline: viewTimeline, events: viewEvents, audit: viewAudit };

    function go(view) {
      state.view = view;
      Object.keys(builders).forEach((v) => (section(v).hidden = v !== view));
      if (!mounted.has(view)) {
        builders[view](section(view), { live: () => isVisible(stage) });
        mounted.add(view);
        icons();
      }
      ref("page").scrollTop = 0;
      renderMenu();
      renderCrumbs();
    }

    shell.addEventListener("click", (ev) => {
      const t = ev.target.closest("[data-go],[data-toggle],[data-soon],[data-ref='collapse']");
      if (!t) return;
      state.touched = true;
      if (t.dataset.go) go(t.dataset.go);
      else if (t.dataset.toggle) {
        const id = t.dataset.toggle;
        if (state.open.has(id)) state.open.delete(id);
        else state.open.add(id);
        renderMenu();
      } else if (t.dataset.ref === "collapse") {
        shell.classList.toggle("is-collapsed");
      } else soon(t);
    });
    shell.addEventListener("pointerdown", () => (state.touched = true));

    // #app-events, #app-timeline... abre direto numa tela (útil para links de apresentação)
    const fromHash = (location.hash.match(/^#app-(\w+)/) || [])[1];
    if (builders[fromHash]) {
      state.touched = true;
      go(fromHash);
    } else go("dashboard");

    // Passeio automático pelas telas até a primeira interação
    const order = ["dashboard", "events", "timeline", "audit"];
    setInterval(() => {
      if (state.touched || !isVisible(stage) || document.hidden) return;
      const next = order[(order.indexOf(state.view) + 1) % order.length];
      if (next === "events" || next === "timeline") state.open.add("health");
      go(next);
    }, 7000);
  }

  const vis = new WeakMap();
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => vis.set(e.target, e.isIntersecting))) : null;
  function isVisible(el) {
    if (!io) return true;
    if (!vis.has(el)) {
      io.observe(el);
      return true;
    }
    return vis.get(el);
  }

  // --------------------------------------------------------------------------
  // Dashboard (pages/Dashboard)
  // --------------------------------------------------------------------------
  function gauge(pct) {
    // Gauge do ECharts: anel de 10px, início no topo, roundCap, cor por limite
    const r = 52, c = 2 * Math.PI * r;
    const color = pct > 80 ? "#ef4444" : pct >= 60 ? "#f97316" : "#22c55e";
    return `<svg viewBox="0 0 130 130" width="130" height="130" class="ga-gauge" aria-hidden="true">
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="#34322d" stroke-width="10"/>
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${(clamp(pct, 0, 100) / 100) * c} ${c}" transform="rotate(-90 65 65)" class="ga-gauge__arc"/>
      <text x="65" y="70" text-anchor="middle">${pct.toFixed(2)}%</text>
    </svg>`;
  }

  function progress(pct) {
    const color = pct > 80 ? "#ef4444" : pct >= 60 ? "#f97316" : "#22c55e";
    return `<div class="ga-progress"><span style="width:${pct}%;background:${color}"></span><b>${pct.toFixed(2)}%</b></div>`;
  }

  function viewDashboard(el, ctx) {
    const stat = (n, label, ic, color) => `
      <div class="ga-card ga-stat">
        <div><h5 data-stat="${label}">${n}</h5><a class="ga-stat__link">${label}</a></div>
        <span class="ga-stat__icon">${icon(ic, `ga-ic-${color}`)}</span>
      </div>`;

    el.innerHTML = `
      <div class="ga-col ga-gap-4">
        <div class="ga-wrap ga-gap-4">
          ${stat(1, "Incidents", "circle-alert", "red")}
          ${stat(3, "Alerts", "siren", "red")}
          ${stat(281, "Security", "shield-alert", "blue")}
          ${stat(474, "Problem", "triangle-alert", "orange")}
          ${stat(NODES.length, "Nodes", "server", "green")}
          <div class="ga-card ga-stat"><div><h5>${CLUSTER.version}</h5><h6 class="ga-muted">Kubernetes Version</h6></div><span class="ga-stat__icon">${icon("git-commit-vertical")}</span></div>
        </div>
        <div class="ga-wrap ga-gap-4">
          <div class="ga-card ga-meter-card"><div class="ga-card__head"><h5>Pods</h5><a class="ga-link">Detail</a></div><div class="ga-meter-body" data-g="pods"></div></div>
          <div class="ga-card ga-meter-card"><div class="ga-card__head"><h5>CPU</h5></div><div class="ga-meter-body" data-g="cpu"></div></div>
          <div class="ga-card ga-meter-card"><div class="ga-card__head"><h5>Memory</h5></div><div class="ga-meter-body" data-g="mem"></div></div>
        </div>
        <div class="ga-card ga-card--flush">
          <table class="ga-table">
            <thead><tr><th style="width:8%">Status</th><th style="width:22%">Node</th><th style="width:24%">Pods</th><th style="width:20%">CPU</th><th style="width:20%">Memory</th></tr></thead>
            <tbody data-ref="nodes"></tbody>
          </table>
        </div>
      </div>`;

    const totals = { pods: [170, 440], cpu: 48.5, mem: 62.25 };

    function render() {
      const podsPct = (totals.pods[0] / totals.pods[1]) * 100;
      el.querySelector('[data-g="pods"]').innerHTML = `${gauge(podsPct)}<div class="ga-row"><h4>${totals.pods[0]} / ${totals.pods[1]}</h4><p>Pods</p></div>`;
      el.querySelector('[data-g="cpu"]').innerHTML = `${gauge(totals.cpu)}<div class="ga-row"><h4>${((totals.cpu / 100) * 16).toFixed(2)} / 16</h4><p>Cores</p></div>`;
      el.querySelector('[data-g="mem"]').innerHTML = `${gauge(totals.mem)}<div class="ga-row"><h5>${((totals.mem / 100) * 61.8).toFixed(2)} / 61.80</h5><p>Gib</p></div>`;
      el.querySelector('[data-ref="nodes"]').innerHTML = NODES.map((n) => `
        <tr>
          <td>${chip("Ready", "green")}</td>
          <td class="ga-node-link">${esc(n.name)}</td>
          <td><div class="ga-pods-bars">
            <span class="ga-row ga-gap-2">${icon("route", "ga-ic-sm ga-green-200")}${progress((n.pods[0] / 110) * 100)}</span>
            <span class="ga-row ga-gap-2">${icon("route-off", "ga-ic-sm ga-red-200")}${progress((n.pods[1] / 110) * 100)}</span>
          </div></td>
          <td>${progress(n.cpu)}</td>
          <td>${progress(n.mem)}</td>
        </tr>`).join("");
      icons();
    }

    render();
    setInterval(() => {
      if (!ctx.live() || el.hidden || document.hidden) return;
      totals.cpu = clamp(totals.cpu + rand(-4, 4), 25, 78);
      totals.mem = clamp(totals.mem + rand(-1.5, 1.5), 50, 75);
      NODES.forEach((n) => {
        n.cpu = clamp(n.cpu + rand(-6, 6), 8, 95);
        n.mem = clamp(n.mem + rand(-2, 2), 30, 92);
      });
      render();
    }, 2500);
  }

  // --------------------------------------------------------------------------
  // Cluster Events (pages/Events)
  // --------------------------------------------------------------------------
  // Paleta categórica validada (dataviz) para o gráfico de Kind, em ordem fixa
  const KIND_COLORS = { Pod: "#3b82f6", Job: "#2a9d78", Deployment: "#c97a2c", Node: "#a855f7", Other: "#e23670" };

  function donut(segments, size, label) {
    const r = size / 2 - 22, c = 2 * Math.PI * r, total = segments.reduce((s, x) => s + x.v, 0);
    let off = 0;
    const arcs = segments.map((s) => {
      const frac = Math.max(s.v / total, 0.012);
      const a = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="34"
        stroke-dasharray="${Math.max(frac * c - 2, 1)} ${c}" stroke-dashoffset="${-off * c}" transform="rotate(-90 ${size / 2} ${size / 2})"
        data-tip="${esc(s.label)}: ${s.v.toLocaleString("en-US")} (Rate ${((s.v / total) * 100).toFixed(2)}%)"/>`;
      off += frac;
      return a;
    }).join("");
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ga-donut" role="img" aria-label="${esc(label)}">${arcs}</svg>`;
  }

  function viewEvents(el, ctx) {
    const state = { filter: "all", rows: [], normal: 9982, warning: 34, kinds: { Pod: 6120, Job: 2410, Deployment: 890, Node: 210, Other: 386 } };
    const now = new Date();
    for (let i = 0; i < 12; i++) state.rows.push({ e: EVENT_POOL[i % EVENT_POOL.length], t: new Date(now - i * 61000) });

    el.innerHTML = `
      <div class="ga-col ga-gap-4">
        <div class="ga-row ga-justify-end">
          <div class="ga-tabs"><button type="button" data-f="all" class="is-on">All</button><button type="button" data-f="warning">Warning</button></div>
        </div>
        <div class="ga-grid-3">
          <div class="ga-card ga-chart-card"><h5>Type</h5><div class="ga-chart-body" data-c="type"></div></div>
          <div class="ga-card ga-chart-card"><h5>Kind</h5><div class="ga-chart-body" data-c="kind"></div></div>
          <div class="ga-card ga-chart-card"><h5>Counter</h5><div class="ga-chart-body" data-c="counter"></div></div>
        </div>
        <div class="ga-row ga-justify-end ga-gap-2">
          ${["Namespace", "Type", "Reason", "Kind"].map((f) => `<button type="button" class="ga-btn ga-btn--dashed" data-soon>${icon("circle-plus", "ga-ic")}${f}</button>`).join("")}
          <input class="ga-input" style="width:300px" placeholder="Search..." aria-label="Buscar eventos">
        </div>
        <div class="ga-card ga-card--flush">
          <table class="ga-table">
            <thead><tr><th>Date ${icon("chevrons-up-down", "ga-ic-sm")}</th><th>Name</th><th>Namespace</th><th>Type</th><th>Reason</th><th>Kind</th><th>Counter ${icon("chevrons-up-down", "ga-ic-sm")}</th><th>Message</th></tr></thead>
            <tbody data-ref="rows"></tbody>
          </table>
        </div>
      </div>
      <div class="ga-tip" hidden></div>`;

    const tip = el.querySelector(".ga-tip");
    el.addEventListener("pointermove", (ev) => {
      const t = ev.target.closest("[data-tip]");
      if (!t) return (tip.hidden = true);
      tip.textContent = t.dataset.tip;
      tip.hidden = false;
      const r = el.getBoundingClientRect(), s = r.width / el.offsetWidth;
      tip.style.transform = `translate(${(ev.clientX - r.left) / s + 14}px, ${(ev.clientY - r.top) / s + 14}px)`;
    });
    el.addEventListener("pointerleave", () => (tip.hidden = true));

    function charts() {
      const total = state.normal + state.warning;
      el.querySelector('[data-c="type"]').innerHTML = `
        ${donut([{ label: "Normal", v: state.normal, color: "#6366f1" }, { label: "Warning", v: state.warning, color: "#f59e0b" }], 240, "Tipo de evento")}
        <ul class="ga-legend">
          <li><i style="background:#6366f1"></i>Normal: ${state.normal.toLocaleString("en-US")}<small>Rate ${((state.normal / total) * 100).toFixed(2)}%</small></li>
          <li><i style="background:#f59e0b"></i>Warning: ${state.warning}<small>Rate ${((state.warning / total) * 100).toFixed(2)}%</small></li>
        </ul>`;
      const kt = Object.values(state.kinds).reduce((a, b) => a + b, 0);
      el.querySelector('[data-c="kind"]').innerHTML = `
        ${donut(Object.entries(state.kinds).map(([k, v]) => ({ label: k, v, color: KIND_COLORS[k] })), 240, "Eventos por kind")}
        <ul class="ga-legend">${Object.entries(state.kinds).map(([k, v]) => `<li><i style="background:${KIND_COLORS[k]}"></i>${k}: ${v.toLocaleString("en-US")}<small>${((v / kt) * 100).toFixed(1)}%</small></li>`).join("")}</ul>`;
      const reasons = [["Completed", 3120], ["Started", 2290], ["Pulled", 1980], ["Created", 1840], ["SuccessfulCreate", 620], ["BackOff", 21], ["Unhealthy", 13]];
      const max = reasons[0][1];
      el.querySelector('[data-c="counter"]').innerHTML = `<div class="ga-bars">${reasons.map(([r, v]) => `
        <div class="ga-bar" data-tip="${r}: ${v.toLocaleString("en-US")}"><span>${r}</span><div><i style="width:${(v / max) * 100}%"></i></div><b>${v.toLocaleString("en-US")}</b></div>`).join("")}</div>`;
    }

    function fmt(d) {
      let h = d.getHours();
      const ap = h >= 12 ? "pm" : "am";
      h = h % 12 || 12;
      return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(h)}:${pad(d.getMinutes())}${ap}`;
    }

    function rows(fresh) {
      const list = state.rows.filter((r) => state.filter === "all" || r.e[3] === "Warning").slice(0, 12);
      el.querySelector('[data-ref="rows"]').innerHTML = list.map((r, i) => `
        <tr class="${fresh && i === 0 ? "ga-new" : ""}">
          <td>${fmt(r.t)}</td><td class="ga-trunc" style="max-width:260px">${esc(r.e[0])}</td><td>${esc(r.e[1])}</td>
          <td>${chip(`${r.e[2]} - ${r.e[3]}`, r.e[3] === "Warning" ? "yellow" : "green", "ga-chip--wide")}</td>
          <td>${esc(r.e[4])}</td><td>${esc(r.e[5])}</td><td>1</td><td class="ga-trunc" style="max-width:300px">${esc(r.e[6])}</td>
        </tr>`).join("");
    }

    el.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => {
      state.filter = b.dataset.f;
      el.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("is-on", x === b));
      rows(false);
    }));

    charts();
    rows(false);
    setInterval(() => {
      if (!ctx.live() || el.hidden || document.hidden) return;
      const e = pick(EVENT_POOL);
      state.rows.unshift({ e, t: new Date() });
      state.rows.length = Math.min(state.rows.length, 40);
      if (e[3] === "Warning") state.warning++;
      else state.normal++;
      state.kinds[KIND_COLORS[e[5]] ? e[5] : "Other"]++;
      charts();
      rows(true);
    }, 2400);
  }

  // --------------------------------------------------------------------------
  // Timeline (pages/Timeline)
  // --------------------------------------------------------------------------
  const LANES = ["Events", "Changes", "Security", "Alerts", "Problems", "Incidents"];
  const TICKS = ["08:57:56", "09:16:20", "09:43:51", "10:03:15", "10:04:42", "10:05:02", "10:43:52", "10:52:46", "10:53:46", "10:54:20", "10:55:14", "10:55:50", "10:56:22", "11:06:01", "11:57:20", "01:08:00"];

  function viewTimeline(el) {
    const pts = [];
    for (let i = 0; i < 46; i++) pts.push({ lane: "Events", x: 0.03 + i * 0.021 + (i > 1 && i < 4 ? 0.04 : 0) });
    [0.09, 0.13, 0.17, 0.19, 0.21, 0.25, 0.29].forEach((x) => pts.push({ lane: "Changes", x }));
    [0.02, 0.04, 0.12, 0.14, 0.18, 0.21, 0.47, 0.52, 0.66, 0.71, 0.78, 0.85, 0.88, 0.93, 0.95, 0.97].forEach((x) => pts.push({ lane: "Problems", x }));
    pts.push({ lane: "Incidents", x: 0.62 });

    el.innerHTML = `
      <div class="ga-col ga-gap-4">
        <div class="ga-row ga-justify-end ga-gap-2">
          <button type="button" class="ga-btn ga-btn--dashed" data-soon>${icon("circle-plus", "ga-ic")}Type</button>
          <button type="button" class="ga-btn ga-btn--dashed" data-soon>${icon("circle-plus", "ga-ic")}Namespace<span class="ga-sep-v"></span><span class="ga-badge">3</span></button>
          <button type="button" class="ga-btn ga-btn--outline" data-soon>${icon("calendar", "ga-ic")}Jan 20, 04:25 - 16:25</button>
          <button type="button" class="ga-btn ga-btn--secondary ga-btn--icon" data-soon aria-label="Atualizar">${icon("refresh-cw", "ga-ic")}</button>
        </div>
        <div class="ga-card ga-tl">
          <div class="ga-tl__summary">
            <span>${icon("chart-no-axes-column", "ga-ic")}Total: 81</span>
            <span>${icon("refresh-ccw", "ga-ic")}Changes: 14</span>
            <span>${icon("circle-alert", "ga-ic ga-ic-red")}Incidents: 1</span>
            <span>${icon("triangle-alert", "ga-ic ga-ic-orange")}Problems: 16</span>
            <span>${icon("shield", "ga-ic ga-ic-blue")}Security: 0</span>
            <span>${icon("siren", "ga-ic ga-ic-red")}Alerts: 0</span>
            <span>${icon("calendar-days", "ga-ic ga-ic-orange")}Events - Warning: 51</span>
          </div>
          <div class="ga-tl__chart">
            <button type="button" class="ga-tl__nav" data-soon aria-label="Anterior">${icon("chevron-left")}</button>
            <div class="ga-tl__plot">
              ${LANES.map((l) => `<div class="ga-tl__lane"><span>${l}</span><div class="ga-tl__track">${pts.filter((p) => p.lane === l).map((p, i) => `<button type="button" class="ga-tl__dot ga-tl__dot--${l.toLowerCase()}" style="left:${p.x * 100}%" data-lane="${l}" data-i="${i}" aria-label="${l}"></button>`).join("")}</div></div>`).join("")}
              <div class="ga-tl__axis">${TICKS.map((t) => `<span>${t}</span>`).join("")}</div>
              <div class="ga-tl__pop" data-ref="pop" hidden></div>
            </div>
            <button type="button" class="ga-tl__nav" data-soon aria-label="Próximo">${icon("chevron-right")}</button>
          </div>
        </div>
        <div class="ga-card ga-card--flush">
          <table class="ga-table">
            <thead><tr><th>Event Type</th><th>Date</th><th>Name</th><th>Namespace</th><th>Kind</th><th>State</th><th>Type</th></tr></thead>
            <tbody>${TIMELINE_ROWS.map((r) => `<tr>
              <td><span class="ga-etype ga-etype--${r[0]}">${r[0]}</span></td><td>${r[1]}</td><td class="ga-trunc" style="max-width:300px">${esc(r[2])}</td>
              <td>${esc(r[3])}</td><td>${esc(r[4])}</td><td>${esc(r[5])}</td><td>${esc(r[6])}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>`;

    const pop = el.querySelector('[data-ref="pop"]');
    const DETAILS = {
      Events: [["api-cluster-b8559d55-77l7z", "Pod", "gita-api-principal", "2025-01-20T08:57:56Z"]],
      Changes: [["api-principal-geral-555dd449b4", "Replicaset", "gita-api-principal", "2025-01-20T13:04:44Z"], ["api-principal-geral-7bd6645b55", "Replicaset", "gita-api-principal", "2025-01-20T13:04:44Z"]],
      Problems: [["api-notificacoes-79f65c99bc-6mvck", "container", "gita-alertas", "2025-01-20T09:16:20Z"]],
      Incidents: [["ms-collect-producer-28946161-z8lc9", "Pod", "gita-coleta", "2025-01-20T10:55:14Z"]],
    };

    function show(dot) {
      const lane = dot.dataset.lane, items = DETAILS[lane] || DETAILS.Events;
      el.querySelectorAll(".ga-tl__dot.is-sel").forEach((d) => d.classList.remove("is-sel"));
      dot.classList.add("is-sel");
      pop.innerHTML = `<p class="ga-tl__pop-title">${lane}: ${items.length}</p>${items.map((it) => `
        <div class="ga-tl__pop-item"><div><b>${esc(it[0])}</b><p><b>Kind:</b> ${esc(it[1])}</p><p><b>Namespace:</b> ${esc(it[2])}</p><p><b>Date:</b> ${esc(it[3])}</p></div>
        <button type="button" class="ga-btn ga-btn--secondary ga-btn--xs" data-soon>View</button></div>`).join("")}`;
      pop.hidden = false;
      const plot = el.querySelector(".ga-tl__plot");
      const left = clamp(dot.offsetLeft + dot.parentElement.offsetLeft, 0, plot.clientWidth - 480);
      pop.style.left = `${left}px`;
      pop.style.top = `${dot.parentElement.parentElement.offsetTop + 30}px`;
    }

    el.querySelectorAll(".ga-tl__dot").forEach((d) => {
      d.addEventListener("click", (ev) => {
        ev.stopPropagation();
        show(d);
      });
      d.addEventListener("pointerenter", () => show(d));
    });
    el.addEventListener("click", (ev) => {
      if (!ev.target.closest(".ga-tl__pop")) pop.hidden = true;
    });
    // Abre um exemplo como no print do app
    const first = el.querySelector('.ga-tl__dot[data-lane="Changes"][data-i="5"]');
    if (first) requestAnimationFrame(() => show(first));
  }

  // --------------------------------------------------------------------------
  // Audit (pages/Audit)
  // --------------------------------------------------------------------------
  function viewAudit(el) {
    const verbColor = (v) => (v === "UPDATE" ? "orange" : v === "DELETE" ? "red" : "green");
    el.innerHTML = `
      <div class="ga-col ga-gap-4">
        <div class="ga-row ga-justify-end ga-gap-4">
          ${["Namespace", "Kind", "Verb", "User"].map((f) => `<button type="button" class="ga-btn ga-btn--dashed" data-soon>${icon("circle-plus", "ga-ic")}${f}</button>`).join("")}
          <button type="button" class="ga-btn ga-btn--outline" data-soon>${icon("calendar", "ga-ic")}05/10/2026 - 05/10/2026</button>
          <input class="ga-input" style="width:300px" placeholder="Search..." aria-label="Buscar na auditoria" data-ref="q">
          <button type="button" class="ga-btn ga-btn--secondary ga-btn--icon" data-soon aria-label="Atualizar">${icon("refresh-cw", "ga-ic")}</button>
        </div>
        <div class="ga-card ga-card--flush">
          <table class="ga-table ga-table--click">
            <thead><tr><th style="width:5%">Date ${icon("chevrons-up-down", "ga-ic-sm")}</th><th style="width:5%">Verb</th><th style="width:25%">User</th><th style="width:10%">Kind</th><th style="width:25%">Name</th><th style="width:5%">Namespace</th></tr></thead>
            <tbody data-ref="rows"></tbody>
          </table>
        </div>
        <div class="ga-row ga-justify-between ga-muted ga-pagination"><span>Rows per page <span class="ga-select">50 ${icon("chevrons-up-down", "ga-ic-sm")}</span></span><span>Page 1 of 1</span></div>
      </div>
      <div class="ga-overlay" data-ref="overlay" hidden></div>
      <aside class="ga-sheet" data-ref="sheet" hidden></aside>`;

    const rowsEl = el.querySelector('[data-ref="rows"]');
    function rows(q = "") {
      rowsEl.innerHTML = AUDIT.map((a, i) => ({ a, i })).filter(({ a }) => !q || `${a[2]} ${a[3]} ${a[4]}`.toLowerCase().includes(q)).map(({ a, i }) => `
        <tr data-i="${i}" tabindex="0"><td>${a[0]}</td><td>${chip(a[1], verbColor(a[1]), "ga-chip--verb")}</td><td class="ga-trunc" style="max-width:340px">${esc(a[2])}</td><td>${a[3]}</td><td>${esc(a[4])}</td><td>${esc(a[5])}</td></tr>`).join("");
    }

    const sheet = el.querySelector('[data-ref="sheet"]'), overlay = el.querySelector('[data-ref="overlay"]');
    function open(i) {
      const a = AUDIT[i];
      sheet.innerHTML = `
        <button type="button" class="ga-sheet__close" data-close aria-label="Fechar">${icon("x", "ga-ic")}</button>
        <div class="ga-sheet__head"><h3>${esc(a[4])}</h3><p class="ga-muted">Namespace: ${esc(a[5])}</p></div>
        <div class="ga-sheet__body">
          <div class="ga-card ga-card--pad"><h5>Info</h5><div class="ga-kv">
            <p><strong>Id:</strong> 67a1f${i}c93e2b41d0a8${i}f7e21</p><p><strong>Name:</strong> ${esc(a[4])}</p><p><strong>Namespace:</strong> ${esc(a[5])}</p>
            <p><strong>User:</strong> ${esc(a[2])}</p><p><strong>Kind:</strong> ${a[3]}</p><p><strong>Type:</strong> ResponseComplete</p>
            <p><strong>Verb:</strong> ${a[1]}</p><p><strong>GVK:</strong> ${esc(a[6])}</p><p><strong>Date:</strong> ${a[0]}</p>
            <hr><strong>Groups:</strong><p>system:authenticated</p></div></div>
          <div class="ga-card ga-card--pad"><h5>Changes</h5><div class="ga-kv"><strong>Changes:</strong>
            <p>Name: ${esc(a[4])}</p><p>Namespace: ${esc(a[5])}</p><p>Operation: ${a[7]}</p><p>Path: ${esc(a[8])}</p><p>Value: ${esc(a[9])}</p></div></div>
          <div class="ga-card ga-card--pad"><h5>Source IP</h5><div class="ga-kv"><strong>Source IP:</strong><p>${a[10]}</p></div></div>
        </div>`;
      sheet.hidden = overlay.hidden = false;
      icons();
    }
    function close() {
      sheet.hidden = overlay.hidden = true;
    }

    rowsEl.addEventListener("click", (ev) => {
      const tr = ev.target.closest("tr[data-i]");
      if (tr) open(Number(tr.dataset.i));
    });
    rowsEl.addEventListener("keydown", (ev) => ev.key === "Enter" && ev.target.dataset.i && open(Number(ev.target.dataset.i)));
    overlay.addEventListener("click", close);
    sheet.addEventListener("click", (ev) => ev.target.closest("[data-close]") && close());
    el.querySelector('[data-ref="q"]').addEventListener("input", (ev) => rows(ev.target.value.trim().toLowerCase()));
    rows();
  }

  function init() {
    document.querySelectorAll("[data-gita-app]").forEach(mount);
    icons();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
