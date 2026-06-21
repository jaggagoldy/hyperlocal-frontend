import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & {
  skipWaiting: () => Promise<void>;
  addEventListener: (type: string, listener: (event: any) => void) => void;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  // Phase F hardening: do NOT auto-activate a new worker. A fresh build installs
  // as the *waiting* worker; the client shows a "new version → reload" prompt
  // (PwaUpdatePrompt) and only then posts SKIP_WAITING below. This prevents silent
  // version skew where a tab runs new assets against a stale cached shell.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  // defaultCache is Serwist's Next-aware strategy set: NetworkFirst for navigations
  // /RSC/data (so a bad cache can never brick navigation) and CacheFirst/SWR only for
  // /_next/static, fonts and images. Pair it with the ~offline document fallback below.
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        revision: "v2",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Activate the waiting worker only when the user accepts the reload prompt.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
