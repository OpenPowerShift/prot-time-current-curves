/**
 * Editor colour scheme for `.ptc`.
 *
 * Every colour is a `var(--tc-syn-*)` reference rather than a literal,
 * so the same highlight style serves both themes: flipping
 * `data-theme` on the root element re-colours the editor through the
 * cascade, with no extension reconfiguration and no editor rebuild.
 *
 * The token vocabulary matches what `tc-language.ts` emits.
 */

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

export const tcHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: 'var(--tc-syn-comment)', fontStyle: 'italic' },
  { tag: t.keyword, color: 'var(--tc-syn-keyword)', fontWeight: '600' },
  { tag: t.propertyName, color: 'var(--tc-syn-property)' },
  { tag: t.string, color: 'var(--tc-syn-string)' },
  { tag: t.number, color: 'var(--tc-syn-number)' },
  { tag: t.unit, color: 'var(--tc-syn-unit)' },
  { tag: t.atom, color: 'var(--tc-syn-atom)' },
  { tag: t.variableName, color: 'var(--tc-syn-variable)' },
  { tag: t.operator, color: 'var(--tc-syn-operator)' },
  { tag: t.punctuation, color: 'var(--tc-syn-operator)' },
  { tag: t.invalid, color: 'var(--tc-error)' },
]);

/**
 * Chrome around the text -- gutters, cursor, selection, active line.
 * CodeMirror's own base theme hard-codes light-mode colours for these,
 * so they have to be restated in tokens or the editor looks broken on
 * a dark background.
 */
export const tcEditorTheme = EditorView.theme({
  '&': {
    color: 'var(--tc-fg)',
    backgroundColor: 'var(--tc-bg-sunken)',
  },
  '.cm-content': {
    caretColor: 'var(--tc-accent)',
    fontFamily: 'var(--tc-font)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--tc-accent)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--tc-bg-elevated)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 8%, transparent)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--tc-bg-sunken)',
    color: 'var(--tc-fg-muted)',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 8%, transparent)',
    color: 'var(--tc-fg)',
  },
  '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 25%, transparent)',
    color: 'inherit',
  },
  '.cm-nonmatchingBracket': {
    color: 'var(--tc-error)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--tc-bg-elevated)',
    color: 'var(--tc-fg)',
    border: '1px solid var(--tc-border)',
  },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'var(--tc-accent)',
    color: 'var(--tc-accent-fg)',
  },
  /*
   * The Find / Replace panel (Ctrl/Cmd-F). The search package's base
   * theme paints it, its fields and its buttons in fixed light-mode
   * greys, so on the dark theme it was a white slab across the editor.
   */
  '.cm-panels': {
    backgroundColor: 'var(--tc-bg-elevated)',
    color: 'var(--tc-fg)',
  },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--tc-border)' },
  '.cm-panels.cm-panels-bottom': { borderTop: '1px solid var(--tc-border)' },
  '.cm-search': { fontFamily: 'inherit' },
  '.cm-search label': { color: 'var(--tc-fg-muted)' },
  '.cm-textfield': {
    backgroundColor: 'var(--tc-bg-sunken)',
    color: 'var(--tc-fg)',
    border: '1px solid var(--tc-border)',
    borderRadius: '3px',
  },
  '.cm-textfield:focus': {
    outline: '2px solid color-mix(in srgb, var(--tc-accent) 60%, transparent)',
    outlineOffset: '-1px',
  },
  '.cm-button': {
    backgroundImage: 'none',
    backgroundColor: 'var(--tc-bg-sunken)',
    color: 'var(--tc-fg)',
    border: '1px solid var(--tc-border)',
    borderRadius: '3px',
  },
  '.cm-button:hover': { borderColor: 'var(--tc-accent)' },
  '.cm-button:active': {
    backgroundImage: 'none',
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 20%, var(--tc-bg-sunken))',
  },
  '.cm-search input[type=checkbox]': { accentColor: 'var(--tc-accent)' },
  '.cm-panel button[name=close]': { color: 'var(--tc-fg-muted)' },
  '.cm-searchMatch': {
    backgroundColor: 'color-mix(in srgb, var(--tc-warning) 30%, transparent)',
    outline: '1px solid color-mix(in srgb, var(--tc-warning) 60%, transparent)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 40%, transparent)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'color-mix(in srgb, var(--tc-accent) 15%, transparent)',
  },
}, { dark: false });

/** The complete visual package for the editor. */
export const tcEditorAppearance = [
  tcEditorTheme,
  syntaxHighlighting(tcHighlightStyle, { fallback: true }),
];
