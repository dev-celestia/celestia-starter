export type DiffLineType = "same" | "added" | "removed";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  /** 1-based line number in the old (removed) or new (added) document. */
  oldLine?: number;
  newLine?: number;
}

const MAX_DIFF_LINES = 4000;

/**
 * Line-based diff using LCS dynamic programming. Good enough for article-length
 * documents; input beyond MAX_DIFF_LINES falls back to replace-all.
 */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");

  if (a.length > MAX_DIFF_LINES || b.length > MAX_DIFF_LINES) {
    return [
      ...a.map((text, i) => ({ type: "removed" as const, text, oldLine: i + 1 })),
      ...b.map((text, i) => ({ type: "added" as const, text, newLine: i + 1 })),
    ];
  }

  const n = a.length;
  const m = b.length;
  // lcs[i][j] = LCS length of a[i..], b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? (lcs[i + 1]![j + 1] ?? 0) + 1 : Math.max(lcs[i + 1]![j] ?? 0, lcs[i]![j + 1] ?? 0);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i]!, oldLine: i + 1, newLine: j + 1 });
      i++;
      j++;
    } else if ((lcs[i + 1]![j] ?? 0) >= (lcs[i]![j + 1] ?? 0)) {
      result.push({ type: "removed", text: a[i]!, oldLine: i + 1 });
      i++;
    } else {
      result.push({ type: "added", text: b[j]!, newLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    result.push({ type: "removed", text: a[i]!, oldLine: i + 1 });
    i++;
  }
  while (j < m) {
    result.push({ type: "added", text: b[j]!, newLine: j + 1 });
    j++;
  }
  return result;
}
