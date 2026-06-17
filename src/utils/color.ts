import { REALM_ORDER } from '@/assets/const';

export const gradeColorList = [
  '#8c8c8c',
  '#52c41a',
  '#1890ff',
  '#722ed1',
  '#fa8c16',
  '#f5222d',
  '#eb2f96',
  '#13c2c2'
];

export const gradeColorMap: Record<string, string> = {
  一品: gradeColorList[0],
  二品: gradeColorList[1],
  三品: gradeColorList[2],
  四品: gradeColorList[3],
  五品: gradeColorList[4],
  六品: gradeColorList[5],
  七品: gradeColorList[6],
  八品: gradeColorList[7]
};

export const realmColorMap: Record<string, string> = {
  练气: gradeColorList[0],
  筑基: gradeColorList[1],
  结丹: gradeColorList[2],
  元婴: gradeColorList[3],
  化神: gradeColorList[4],
  返虚: gradeColorList[5],
  合体: gradeColorList[6],
  大乘: gradeColorList[7]
};

export const getGradeColor = (label?: string) =>
  (label && gradeColorMap[label]) || (label && realmColorMap[label]) || '';

export function splitNameByRealm(name: string) {
  const realm = REALM_ORDER.find((item) => name.includes(item));
  if (!realm) return null;
  const color = getGradeColor(realm);
  if (!color) return null;
  const index = name.indexOf(realm);
  if (index < 0) return null;
  return {
    before: name.slice(0, index),
    realm,
    after: name.slice(index + realm.length),
    color
  };
}
