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

const fabaoGradeColorMap: Record<string, string> = {
  法器: gradeColorList[0],
  灵器: gradeColorList[1],
  法宝: gradeColorList[2],
  古宝: gradeColorList[3],
  灵宝: gradeColorList[4],
  后天灵宝: gradeColorList[5],
  先天灵宝: gradeColorList[6],
  通天灵宝: gradeColorList[7]
};

const gongfaGradeColorMap: Record<string, string> = {
  一品: gradeColorList[0],
  二品: gradeColorList[1],
  三品: gradeColorList[2],
  四品: gradeColorList[3],
  五品: gradeColorList[4],
  六品: gradeColorList[5],
  七品: gradeColorList[6],
  八品: gradeColorList[7],
  九品: gradeColorList[7],
  十品: gradeColorList[7],
  十一品: gradeColorList[7],
  十二品: gradeColorList[7],
  十三品: gradeColorList[7],
  十四品: gradeColorList[7],
  十五品: gradeColorList[7]
};

export const getGradeColor = (label?: string) =>
  (label && gradeColorMap[label]) ||
  (label && realmColorMap[label]) ||
  (label && fabaoGradeColorMap[label]) ||
  (label && gongfaGradeColorMap[label]) ||
  '';

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
