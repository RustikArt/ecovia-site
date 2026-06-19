import { useEffect } from "react";

const META_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const TIKTOK_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined;

export function Pixels() {
  useEffect(() => {
    if (META_ID && !(window as any).fbq) {
      (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      (window as any).fbq("init", META_ID);
      (window as any).fbq("track", "PageView");
    }
    if (TIKTOK_ID && !((window as unknown) as { ttq?: unknown }).ttq) {
      (function (w: any, d, t) {
        w.TiktokAnalyticsObject = t;
        const ttq: any = (w[t] = w[t] || []);
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
        ttq.setAndDefer = function (e: any, n: any) { e[n] = function () { e.push([n].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (e: any) { const n = ttq._i[e] || []; for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(n, ttq.methods[i]); return n; };
        ttq.load = function (e: any) {
          const n = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = {};
          const o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = n + "?sdkid=" + e + "&lib=" + t;
          const a = d.getElementsByTagName("script")[0]; a.parentNode!.insertBefore(o, a);
        };
        ttq.load(TIKTOK_ID); ttq.page();
      })(window, document, "ttq");
    }
  }, []);
  return null;
}
