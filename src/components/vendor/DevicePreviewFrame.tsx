'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders its children inside an <iframe> so CSS media queries (Tailwind's
 * md:/lg:/xl: breakpoints) resolve against the FRAME's width — not the desktop
 * browser viewport. Without this, a full storefront template rendered in a
 * ~375px phone mockup still shows its DESKTOP layout (viewport is wide), which
 * overlaps and corrupts the live preview.
 *
 * The children are portaled in, so they keep running in the parent React tree
 * (same router/store/context, `window` still points at the parent). Only the
 * DOM nodes live in the iframe, where the app's stylesheets are mirrored.
 */
export default function DevicePreviewFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  const init = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    // Mirror the parent document's styles (Tailwind <style> in dev, <link> in prod)
    // into the iframe so classes render identically.
    doc.head.querySelectorAll('[data-preview-style]').forEach((n) => n.remove());
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-preview-style', '');
      doc.head.appendChild(clone);
    });

    // Ensure a true mobile viewport + clean body.
    let meta = doc.head.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = doc.createElement('meta');
      meta.setAttribute('name', 'viewport');
      doc.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1');
    doc.documentElement.style.background = '#ffffff';
    doc.body.style.margin = '0';
    // Inherit the app font family from the parent body.
    doc.body.style.fontFamily = window.getComputedStyle(document.body).fontFamily;

    setBody(doc.body);
  };

  useEffect(() => {
    // srcDoc iframes may finish loading before onLoad binds; init defensively.
    const doc = iframeRef.current?.contentDocument;
    if (doc && doc.readyState === 'complete') init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Live storefront preview"
        onLoad={init}
        srcDoc="<!doctype html><html><head></head><body></body></html>"
        className={className}
        style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
      />
      {body ? createPortal(children, body) : null}
    </>
  );
}
