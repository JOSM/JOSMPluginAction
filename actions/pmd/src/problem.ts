/**
 * A problem object
 */
export interface Problem {
  /** The title to show the user. */
  title?: string;
  /** The file with the problem */
  file: string;
  /** The column with the problem, starting at 1 */
  column: number;
  /** The last column with the problem */
  endColumn: number;
  /** The line with the problem, starting at 1 */
  line: number;
  /** The end line number */
  endLine: number;
  /** Optional info */
  info?: string;
}
