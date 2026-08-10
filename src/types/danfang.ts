export interface DanfangItem {
  name: string;
  type: number;
  attr: Record<string, number>;
  cl: [string, number][];
  time: [number, number, number];
  itype: string;
  isPile: boolean;
  desc: string;
  ls: number;
}

export type DanfangData = Record<string, DanfangItem>;
