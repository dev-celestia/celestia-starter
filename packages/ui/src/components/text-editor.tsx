"use client"

import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment, Prec, Range } from '@codemirror/state';
import { EditorView, keymap, ViewPlugin, Decoration, DecorationSet } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

async function openExternalUrl(url: string) {
  try {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ---------------------------------------------------------------------------
// Theme definitions
// ---------------------------------------------------------------------------

const darkBase = EditorView.theme(
  {
    '&': { backgroundColor: 'oklch(23.639% 0.00479 145.683)', color: 'oklch(0.985 0 0)' },
    '.cm-gutters': { backgroundColor: 'oklch(23.639% 0.00479 145.683)', color: '#7f848e', border: 'none' },
  },
  { dark: true },
);

const darkHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#c678dd' },
  { tag: t.atom, color: '#d19a66' },
  { tag: t.number, color: '#d19a66' },
  { tag: t.string, color: '#98c379' },
  { tag: t.variableName, color: '#e06c75' },
  { tag: t.propertyName, color: '#61afef' },
  { tag: t.function(t.variableName), color: '#61afef' },
  { tag: t.lineComment, color: '#7f848e' },
  { tag: t.blockComment, color: '#7f848e' },
  { tag: t.typeName, color: '#e5c07b' },
  { tag: t.bool, color: '#d19a66' },
  { tag: t.operator, color: '#56b6c2' },
  { tag: t.punctuation, color: '#abb2bf' },
  { tag: t.paren, color: '#abb2bf' },
  { tag: t.bracket, color: '#abb2bf' },
  { tag: t.brace, color: '#abb2bf' },
  { tag: t.tagName, color: '#e06c75' },
  { tag: t.attributeName, color: '#d19a66' },
  { tag: t.attributeValue, color: '#98c379' },
]);

const themeDark: Extension = [darkBase, Prec.highest(syntaxHighlighting(darkHighlight))];

// ---------------------------------------------------------------------------

const lightBase = EditorView.theme(
  {
    '&': { backgroundColor: '#ffffffff', color: '#000000ff' },
    '.cm-gutters': { backgroundColor: '#f0efefff', color: '#6c6c6cff', border: 'none' },
    '.cm-cursor': { borderLeftColor: '#528bff' },
  },
  { dark: false },
);

const lightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#bf00f9ff' },
  { tag: t.atom, color: '#d19a66' },
  { tag: t.number, color: '#d19a66' },
  { tag: t.string, color: '#4fbd00ff' },
  { tag: t.variableName, color: '#95000cff' },
  { tag: t.propertyName, color: '#0382e9ff' },
  { tag: t.function(t.variableName), color: '#00a100ff' },
  { tag: t.lineComment, color: '#5c6370' },
  { tag: t.blockComment, color: '#3f4653ff' },
  { tag: t.typeName, color: '#f7a000ff' },
  { tag: t.bool, color: '#c08751ff' },
  { tag: t.operator, color: '#2e6f78ff' },
  { tag: t.punctuation, color: '#abb2bf' },
  { tag: t.paren, color: '#abb2bf' },
  { tag: t.bracket, color: '#abb2bf' },
  { tag: t.brace, color: '#abb2bf' },
  { tag: t.tagName, color: '#e06c75' },
  { tag: t.attributeName, color: '#d19a66' },
  { tag: t.attributeValue, color: '#53ae12ff' },
]);

const themeLight: Extension = [lightBase, Prec.highest(syntaxHighlighting(lightHighlight))];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildLinkDecorations(view: EditorView) {
  const builder: Range<Decoration>[] = [];
  const urlRegex = /https?:\/\/[^\s'"()[\]{}]+/g;

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to);
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const start = from + match.index;
      const end = start + match[0].length;
      
      builder.push(
        Decoration.mark({
          class: 'cm-link',
          attributes: {
            'data-url': match[0],
            'title': 'Click to open link in browser'
          }
        }).range(start, end)
      );
    }
  }
  return Decoration.set(builder);
}

const linkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildLinkDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildLinkDecorations(update.view);
      }
    }
  },
  {
    decorations: (v: { decorations: DecorationSet }) => v.decorations,
  }
);

interface TextEditorOptions {
  readOnly?: boolean;
}

function buildOptionsExtensions(opts?: TextEditorOptions): Extension {
  if (!opts?.readOnly) return [];

  return Prec.highest(keymap.of([
    { key: 'Backspace', run: () => true },
    { key: 'Delete', run: () => true },
    { key: 'Enter', run: () => true },
    { key: 'Cut', run: () => true },
    { key: 'Paste', run: () => true },
  ]));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface TextEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (view: EditorView) => void;
  options?: TextEditorOptions;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  path?: string;
  theme?: 'dark' | 'light';
  className?: string;
  language?: 'javascript' | 'typescript' | 'tsx' | 'json' | 'markdown';
  detectLinks?: boolean;
}

export function TextEditor({
  value,
  onChange,
  onMount,
  options,
  height = '100%',
  minHeight,
  maxHeight,
  className,
  theme = 'dark',
  language = 'typescript',
  detectLinks = false,
}: TextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const isExternalUpdate = useRef(false);

  const optionsCompartment = useRef(new Compartment());

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const langMap: Record<'javascript' | 'typescript' | 'tsx' | 'json' | 'markdown', () => Extension> = {
      javascript: () => javascript({ jsx: true }),
      typescript: () => javascript({ typescript: true, jsx: true }),
      tsx: () => javascript({ typescript: true, jsx: true }),
      json: () => json(),
      markdown: () => markdown(),
    };
    const getLang = langMap[language] ?? (() => javascript({ typescript: true, jsx: true }));
    const langExt = getLang();

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value ?? '',
        extensions: [
          basicSetup,
          langExt,
          EditorView.lineWrapping,
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
            },
            '.cm-scroller': {
              overflow: 'auto',
              fontFamily: 'inherit',
            },
            '.cm-content': {
              userSelect: 'text',
              fontSize: '12.5px',
              lineHeight: '1.6',
              padding: '8px 0',
            },
            '.cm-line': {
              userSelect: 'text',
              padding: '0 8px',
            },
            '.cm-gutters': {
              fontSize: '11px',
              lineHeight: '1.6',
              paddingTop: '8px',
            },
            '.cm-link': {
              color: 'var(--primary, #00c950)',
              textDecoration: 'underline',
              cursor: 'pointer',
            },
            '.cm-link:hover': {
              opacity: 0.8,
            },
          }),

          optionsCompartment.current.of(buildOptionsExtensions(options)),
          theme === 'dark' ? themeDark : themeLight,
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged && !isExternalUpdate.current) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }),

          ...(detectLinks ? [
            linkPlugin,
            EditorView.domEventHandlers({
              click: (event: MouseEvent, _view: EditorView) => {
                const target = event.target as HTMLElement;
                const linkEl = target.closest('.cm-link');
                if (linkEl) {
                  const url = linkEl.getAttribute('data-url');
                  if (url) {
                    event.preventDefault();
                    event.stopPropagation();
                    openExternalUrl(url);
                  }
                }
              }
            })
          ] : [])
        ],
      }),
    });

    viewRef.current = view;
    onMount?.(view);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme, language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === undefined) return;

    const currentValue = view.state.doc.toString();
    if (value !== currentValue) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
      isExternalUpdate.current = false;
    }
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: optionsCompartment.current.reconfigure(buildOptionsExtensions(options)),
    });
  }, [options]);

  return (
    <div
      ref={containerRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      }}
      className={className}
    />
  );
}
