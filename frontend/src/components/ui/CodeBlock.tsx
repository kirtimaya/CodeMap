import React from 'react';
import type { CodeSnippet } from '../../types';

interface Props {
  snippet: CodeSnippet;
}

// Lightweight syntax highlighter using CSS classes — no heavy library
function tokenize(code: string, language: string): React.ReactNode[] {
  if (language === 'java') {
    const keywords = /\b(public|private|protected|class|interface|extends|implements|new|return|void|int|long|double|boolean|String|final|static|abstract|null|true|false|this|super|if|else|for|while|do|try|catch|finally|throw|throws|import|package|enum|record|sealed|permits|switch|case|default|break|continue|instanceof|var|yield)\b/g;
    const strings = /(\"[^\"]*\"|'[^']*')/g;
    const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
    const annotations = /(@\w+)/g;

    // Simple token-based highlighting via dangerouslySetInnerHTML
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Order matters — comments first to avoid highlighting inside them
    html = html.replace(/\/\/[^\n]*/g, (m) => `<span class="token-comment">${m}</span>`);
    html = html.replace(/"[^"]*"/g, (m) => `<span class="token-string">${m}</span>`);
    html = html.replace(/@\w+/g, (m) => `<span class="token-annotation">${m}</span>`);
    html = html.replace(/\b(public|private|protected|class|interface|extends|implements|new|return|void|int|long|double|boolean|String|final|static|abstract|null|true|false|this|super|if|else|for|while|do|try|catch|finally|throw|throws|import|package|enum|record|sealed|permits|switch|case|default|break|continue|instanceof|var|yield)\b/g,
      (m) => `<span class="token-keyword">${m}</span>`);
    html = html.replace(/\b(\d+[LlFf]?)\b/g, (m) => `<span class="token-number">${m}</span>`);

    return [<span key="code" dangerouslySetInnerHTML={{ __html: html }} />];
  }

  // For bash/yaml/other: just return as-is with comment highlighting
  let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/#[^\n]*/g, (m) => `<span class="token-comment">${m}</span>`);
  html = html.replace(/"[^"]*"/g, (m) => `<span class="token-string">${m}</span>`);
  return [<span key="code" dangerouslySetInnerHTML={{ __html: html }} />];
}

export function CodeBlock({ snippet }: Props) {
  return (
    <div className="rounded-lg overflow-hidden my-3" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
          {snippet.language}
        </span>
      </div>
      <pre
        className="p-4 overflow-x-auto text-sm leading-relaxed"
        style={{
          background: '#0a0e14',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)',
          margin: 0,
        }}
      >
        <style>{`
          .token-keyword { color: #c792ea; }
          .token-string { color: #c3e88d; }
          .token-comment { color: #546e7a; font-style: italic; }
          .token-annotation { color: #f59e0b; }
          .token-number { color: #f78c6c; }
        `}</style>
        <code>{tokenize(snippet.code, snippet.language)}</code>
      </pre>
    </div>
  );
}
