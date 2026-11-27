/* Kit de 72h · consentimiento de cookies + Google Analytics 4 (modo básico:
   GA4 solo se carga si la persona acepta). Mide también los clics a Amazon. */
(function () {
  var GA_ID = "G-MPZEHHCG1J";
  var KEY = "k72_consent"; // "granted" | "denied"
  var loaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function loadGA() {
    if (loaded) return; loaded = true;
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  // Clics en enlaces de afiliado (solo se envían si GA4 está cargado)
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href*="amazon."]');
    if (!a || !loaded) return;
    var label = (a.closest(".item, .pick, .panel, article") || a).querySelector("h3, h4");
    gtag("event", "amazon_click", {
      link_url: a.href,
      item_name: label ? label.textContent.trim().slice(0, 100) : a.textContent.trim().slice(0, 100),
      page_path: location.pathname,
      transport_type: "beacon"
    });
  }, true);

  // Eventos de uso de herramientas. Solo se envían tras aceptar analítica.
  // No se leen ni transmiten valores de formularios, nombres, teléfonos o datos familiares.
  document.addEventListener("click", function (ev) {
    var control = ev.target.closest && ev.target.closest("[data-analytics-event]");
    if (!control || !loaded) return;
    var eventName = control.getAttribute("data-analytics-event");
    if (!eventName) return;
    var params = { page_path: location.pathname, transport_type: "beacon" };
    var field = control.getAttribute("data-analytics-field");
    if (field) params.control_field = field;
    gtag("event", eventName, params);
  }, true);

  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    var eventName = form && form.getAttribute && form.getAttribute("data-analytics-submit");
    if (!eventName || !loaded) return;
    gtag("event", eventName, { page_path: location.pathname, transport_type: "beacon" });
  }, true);

  var css = "#k72-cookies{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:0 auto;background:#1b1d1f;color:#f6f4ef;border-radius:14px;padding:16px 18px;font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)}" +
    "#k72-cookies p{margin:0 0 12px}#k72-cookies a{color:#ffb98c}" +
    "#k72-cookies .b{display:flex;gap:10px;flex-wrap:wrap}#k72-cookies button{flex:1 1 140px;min-height:44px;border-radius:10px;border:1px solid #f6f4ef;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;background:transparent;color:#f6f4ef}" +
    "#k72-cookies button.ok{background:#f6f4ef;color:#1b1d1f}";

  function showBanner() {
    if (document.getElementById("k72-cookies")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement("div"); d.id = "k72-cookies"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Preferencias de cookies");
    d.innerHTML = '<p>Usamos cookies de analítica (Google Analytics) para saber qué guías son útiles. No usamos cookies de publicidad. <a href="/politica-cookies.html">Más información</a></p>' +
      '<div class="b"><button type="button" class="no">Rechazar</button><button type="button" class="ok">Aceptar</button></div>';
    document.body.appendChild(d);
    d.querySelector(".ok").addEventListener("click", function () { setChoice("granted"); d.remove(); loadGA(); });
    d.querySelector(".no").addEventListener("click", function () { setChoice("denied"); d.remove(); });
  }

  // Enlace "Cookies" del pie para cambiar la elección
  window.k72OpenCookies = function () {
    var was = getChoice();
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (was === "granted") { // borra las cookies de GA4 y recarga sin él
      document.cookie.split(";").forEach(function (c) {
        var n = c.split("=")[0].trim();
        if (n.indexOf("_ga") === 0) {
          ["", "; domain=" + location.hostname, "; domain=." + location.hostname.replace(/^www\./, "")].forEach(function (dm) {
            document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + dm;
          });
        }
      });
      location.reload(); return;
    }
    showBanner();
  };

  function init() {
    var c = getChoice();
    if (c === "granted") loadGA();
    else if (c !== "denied") showBanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
