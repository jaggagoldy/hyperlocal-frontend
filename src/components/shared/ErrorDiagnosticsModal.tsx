'use client';

import { useEffect, useState } from 'react';
import { useErrorStore, DebugErrorDetails } from '@/store/errorStore';
import { X, Copy, Check, AlertTriangle, Terminal, HelpCircle, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function ErrorDiagnosticsModal() {
  const { activeError, clearError, setError } = useErrorStore();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hook up window-level error event listeners to catch raw runtime exceptions
  useEffect(() => {
    if (!isMounted) return;

    const handleGlobalError = (event: ErrorEvent) => {
      // Avoid circular error loops or empty errors
      if (!event.message) return;
      
      console.error('Diagnostics captured global error:', event.error);
      setError({
        type: 'runtime',
        message: event.message,
        whyItHappened: 'A frontend Javascript runtime error occurred. This is typically due to referencing an undefined variable, a type incompatibility, or a rendering exception in a React component.',
        rawResponse: {
          filename: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        },
        stack: event.error?.stack || 'No stack trace available.',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      // Skip axios errors because they are already intercepted and logged with details
      if (reason && (reason.isAxiosError || reason.config)) return;

      console.error('Diagnostics captured unhandled promise rejection:', reason);
      setError({
        type: 'promise',
        message: reason?.message || String(reason),
        whyItHappened: 'An asynchronous operation (Promise) was rejected but was not caught in the code. Double check async/await try-catch wrappers.',
        rawResponse: typeof reason === 'object' ? reason : { error: String(reason) },
        stack: reason?.stack,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isMounted, setError]);

  if (!activeError) return null;

  const handleCopy = async () => {
    try {
      const logString = `--- NEARBYBAZAR DIAGNOSTIC ERROR LOG ---
Timestamp: ${new Date().toISOString()}
Error Type: ${activeError.type || 'api'}
Message: ${activeError.message}
Why it happened: ${activeError.whyItHappened}
URL: ${activeError.method || ''} ${activeError.url || ''}
HTTP Status: ${activeError.status || ''} ${activeError.statusText || ''}

[Request Payload]
${activeError.requestPayload ? JSON.stringify(activeError.requestPayload, null, 2) : 'None'}

[Raw Response]
${activeError.rawResponse ? JSON.stringify(activeError.rawResponse, null, 2) : 'None'}

[Stack Trace]
${activeError.stack || 'None'}
---------------------------------------`;

      await navigator.clipboard.writeText(logString);
      setCopied(true);
      toast.success('Diagnostic log copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard.');
    }
  };

  const getStatusMessage = (status?: number) => {
    if (!status) return 'Network Connection Error';
    switch (status) {
      case 400: return '400 Bad Request';
      case 401: return '401 Unauthorized';
      case 403: return '403 Forbidden';
      case 404: return '404 Not Found';
      case 409: return '409 Conflict';
      case 500: return '500 Internal Server Error';
      default: return `${status} Error`;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="bg-zinc-950 border border-zinc-800/80 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden font-sans text-zinc-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-850 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="font-bold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-rose-500" />
              Developer Diagnostics
            </h2>
          </div>
          <button 
            onClick={clearError}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Error Alert Box */}
          <div className="bg-rose-950/20 border border-rose-500/25 rounded-xl p-4.5 flex gap-3.5 items-start">
            <AlertTriangle className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                {activeError.type === 'runtime' ? 'Runtime Exception' : activeError.type === 'promise' ? 'Unhandled Promise' : 'API Failure'}
              </p>
              <h3 className="font-extrabold text-zinc-100 text-base leading-tight break-words">
                {activeError.message}
              </h3>
              {activeError.url && (
                <p className="text-xs font-mono text-zinc-400 mt-1.5 break-all select-all bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800/40">
                  <span className="text-rose-400 font-bold mr-1.5">{activeError.method}</span>
                  {activeError.url}
                </p>
              )}
            </div>
          </div>

          {/* Quick Context Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">HTTP Status</p>
              <p className="text-zinc-200 text-sm font-bold">{getStatusMessage(activeError.status)}</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Detected At</p>
              <p className="text-zinc-200 text-sm font-mono">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-zinc-500" />
              Why this happened & How to resolve:
            </h4>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-zinc-300 text-xs leading-relaxed space-y-2.5">
              <p className="font-medium text-zinc-200">
                {activeError.whyItHappened}
              </p>
              
              {/* Context-Specific Actionable Tips */}
              <div className="border-t border-zinc-850 pt-2.5 mt-2 space-y-1.5 text-[11px] text-zinc-400 font-medium">
                <p className="font-bold text-zinc-300">💡 Recommended Checks:</p>
                {activeError.status === 403 && (
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Confirm that the logged-in user profile has a linked <code className="text-rose-400 font-mono">Vendor</code> record in the database.</li>
                    <li>If testing with <code className="text-zinc-200 font-bold">Rahul</code>, make sure you ran the seeder script to populate his profile.</li>
                    <li>Verify if the user needs to go through the vendor registration wizard at <code className="text-zinc-200 font-bold">/vendor/register</code> first.</li>
                  </ul>
                )}
                {activeError.status === 404 && (
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Verify that the backend server routes match this URL exactly.</li>
                    <li>If retrieving a record, check if it was deleted or the ID in the database changed.</li>
                    <li>Ensure the Prisma migration and seed steps ran successfully.</li>
                  </ul>
                )}
                {!activeError.status && (
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Check if the backend server is running: execute <code className="text-zinc-200 font-bold">npm run dev</code> in the backend directory.</li>
                    <li>Confirm the backend is listening on port <code className="text-zinc-200 font-bold">5001</code>.</li>
                    <li>Verify local network availability and CORS configurations.</li>
                  </ul>
                )}
                {activeError.status === 500 && (
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Open your terminal running the backend process to inspect the stack trace logs.</li>
                    <li>Check for database connection errors or Prisma query syntax issues in the backend controller.</li>
                  </ul>
                )}
                {activeError.type === 'runtime' && (
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Inspect the file trace below to see which component or hook threw the exception.</li>
                    <li>Check for <code className="text-rose-400 font-mono">null</code> or <code className="text-rose-400 font-mono">undefined</code> values in your UI variables before mapping.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Technical Details Accordions */}
          <div className="space-y-3">
            
            {/* Raw Response */}
            {activeError.rawResponse && (
              <details className="group border border-zinc-850 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer select-none">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-zinc-500" />
                    Raw Response Data
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 bg-zinc-950 border-t border-zinc-850">
                  <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/60 max-h-48">
                    {JSON.stringify(activeError.rawResponse, null, 2)}
                  </pre>
                </div>
              </details>
            )}

            {/* Request Payload */}
            {activeError.requestPayload && (
              <details className="group border border-zinc-850 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer select-none">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-zinc-500" />
                    Request Payload (Body)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 bg-zinc-950 border-t border-zinc-850">
                  <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/60 max-h-48">
                    {JSON.stringify(activeError.requestPayload, null, 2)}
                  </pre>
                </div>
              </details>
            )}

            {/* Stack Trace */}
            {activeError.stack && (
              <details className="group border border-zinc-850 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer select-none">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    Stack Trace (Debug)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 bg-zinc-950 border-t border-zinc-850">
                  <pre className="text-[9px] font-mono text-rose-350 overflow-x-auto p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/60 max-h-60 leading-relaxed whitespace-pre-wrap">
                    {activeError.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-zinc-900 border-t border-zinc-850 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-1.5 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                Copied Log!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Error Log
              </>
            )}
          </button>
          
          <button
            onClick={clearError}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 transition-all shadow-md shadow-rose-900/10"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
