import { REALM_ORDER, dfGrades } from '@/assets/const';
import { CWType } from '@/types';
import type {
  ActorDataConfig,
  QTItemType,
  SectBuilding,
  SectBuildingKey,
  SectMember,
  SectRank,
  SectRole
} from '@/types';
import { GongFaPinJie } from '@/types/gongfa';
import { JingJie1ToNumber } from '@/utils/actor';
import { numberToChinese } from '@/utils';

export const sectNameParts = [
  ['青', '玄', '太', '元', '清', '灵', '天', '紫', '苍', '无'],
  ['云', '霄', '虚', '阳', '月', '星', '风', '雷', '幽', '辰'],
  ['宗', '门', '派', '宫', '观', '阁', '殿', '峰']
];

export const eventTemplates = [
  '外出历练收获灵石',
  '宗门论道提升修为',
  '灵脉涌动宗门气运上升',
  '护山大阵运转稳固',
  '丹房炼制成功',
  '藏经阁出现异动',
  '门中切磋火热',
  '宗门大比热闹非凡',
  '长老讲法门人受益'
];

export type SectTaskReward =
  | { type: 'lingshi'; min: number; max: number }
  | {
      type: 'danyao';
      grade: (typeof dfGrades)[number];
      countRange: [number, number];
    }
  | { type: 'gongfa'; grade: GongFaPinJie };

export type SectTaskConfig = {
  key: string;
  name: string;
  desc: string;
  reputationGain: number;
  minRole: SectRole;
  reward: SectTaskReward;
};

export type SectExchangeReward =
  | { type: 'lingshi'; amount: number }
  | { type: 'danyao'; grade: (typeof dfGrades)[number] }
  | { type: 'gongfa'; grade: GongFaPinJie };

export type SectExchangeConfig = {
  key: string;
  name: string;
  desc: string;
  cost: number;
  reward: SectExchangeReward;
};

export const roleOrderMap = {
  宗主: 6,
  长老: 5,
  亲传弟子: 4,
  内门弟子: 3,
  外门弟子: 2,
  杂役: 1
} as const;

export const getRoleLevel = (role?: SectRole) =>
  roleOrderMap[role || '杂役'] || 1;

export const getMaxTaskCount = (role?: SectRole) => {
  if (role === '宗主') return 4;
  if (role === '长老') return 3;
  if (role === '亲传弟子') return 3;
  if (role === '内门弟子') return 2;
  if (role === '外门弟子') return 2;
  return 1;
};

export const buildSectTaskList = (): SectTaskConfig[] => [
  {
    key: 'xunshan',
    name: '巡山',
    desc: '巡查护山大阵',
    reputationGain: 1,
    minRole: '杂役',
    reward: { type: 'lingshi', min: 180, max: 260 }
  },
  {
    key: 'caiji',
    name: '外出采集',
    desc: '采集灵材补给宗门',
    reputationGain: 1,
    minRole: '外门弟子',
    reward: { type: 'lingshi', min: 220, max: 320 }
  },
  {
    key: 'yaotian',
    name: '药田协助',
    desc: '协助丹房整理药材',
    reputationGain: 2,
    minRole: '外门弟子',
    reward: { type: 'danyao', grade: '二品', countRange: [1, 2] }
  },
  {
    key: 'cangjing',
    name: '藏经整理',
    desc: '协助长老整理功法卷宗',
    reputationGain: 2,
    minRole: '内门弟子',
    reward: { type: 'gongfa', grade: GongFaPinJie.四品 }
  },
  {
    key: 'hushan',
    name: '护山除妖',
    desc: '击退骚扰宗门的妖物',
    reputationGain: 3,
    minRole: '亲传弟子',
    reward: { type: 'lingshi', min: 520, max: 760 }
  },
  {
    key: 'zhengwu',
    name: '宗务处理',
    desc: '协助长老处理宗门事务',
    reputationGain: 3,
    minRole: '长老',
    reward: { type: 'danyao', grade: '五品', countRange: [1, 1] }
  },
  {
    key: 'zhenmen',
    name: '镇守秘境',
    desc: '镇守宗门秘境封印',
    reputationGain: 4,
    minRole: '宗主',
    reward: { type: 'gongfa', grade: GongFaPinJie.六品 }
  }
];

export const buildSectExchangeList = (): SectExchangeConfig[] => [
  {
    key: 'lingshi-small',
    name: '灵石补给',
    desc: '消耗宗门声望兑换灵石',
    cost: 6,
    reward: { type: 'lingshi', amount: 480 }
  },
  {
    key: 'lingshi-big',
    name: '灵石供奉',
    desc: '消耗较多声望换取更多灵石',
    cost: 12,
    reward: { type: 'lingshi', amount: 980 }
  },
  {
    key: 'danyao-mid',
    name: '丹药补给',
    desc: '兑换丹房炼制的丹药',
    cost: 14,
    reward: { type: 'danyao', grade: '三品' }
  },
  {
    key: 'gongfa-mid',
    name: '藏经阁功法',
    desc: '兑换藏经阁拓印功法',
    cost: 18,
    reward: { type: 'gongfa', grade: GongFaPinJie.四品 }
  }
];

export const buildTaskRewardLabel = (task: { reward: SectTaskReward }) => {
  if (task.reward.type === 'lingshi') {
    return `奖励：灵石${task.reward.min}-${task.reward.max}`;
  }
  if (task.reward.type === 'danyao') {
    const countText =
      task.reward.countRange[0] === task.reward.countRange[1]
        ? `${task.reward.countRange[0]}`
        : `${task.reward.countRange[0]}-${task.reward.countRange[1]}`;
    return `奖励：丹药（${task.reward.grade}及以下）×${countText}`;
  }
  return `奖励：功法（${task.reward.grade}及以下）`;
};

export const buildExchangeRewardLabel = (item: {
  reward: SectExchangeReward;
}) => {
  if (item.reward.type === 'lingshi') {
    return `获得灵石${item.reward.amount}`;
  }
  if (item.reward.type === 'danyao') {
    return `获得丹药（${item.reward.grade}及以下）`;
  }
  return `获得功法（${item.reward.grade}及以下）`;
};

export const sectBuildingTemplates: Array<{
  key: SectBuildingKey;
  desc: string;
  effectLabel: string;
  perLevel: number;
  unlockRank: SectRank;
}> = [
  {
    key: '大门',
    desc: '护山大阵枢纽，提升宗门防守',
    effectLabel: '护山防御',
    perLevel: 6,
    unlockRank: 1
  },
  {
    key: '藏经阁',
    desc: '典籍传承之地，提升功法研习',
    effectLabel: '功法研习效率',
    perLevel: 4,
    unlockRank: 1
  },
  {
    key: '灵池',
    desc: '汇聚灵气之源，提升修炼效率',
    effectLabel: '修炼效率',
    perLevel: 5,
    unlockRank: 2
  },
  {
    key: '演武场',
    desc: '切磋磨砺之所，提升弟子战力',
    effectLabel: '弟子战力',
    perLevel: 3,
    unlockRank: 2
  },
  {
    key: '丹房',
    desc: '炼制丹药之地，提升丹药产出',
    effectLabel: '丹药产出',
    perLevel: 4,
    unlockRank: 3
  }
];

export const buildSectBuildings = (
  rank: SectRank,
  rng: () => number,
  idPrefix = ''
): SectBuilding[] => {
  return sectBuildingTemplates.map((template) => {
    const unlocked = rank >= template.unlockRank;
    const baseLevel = Math.min(5, Math.max(1, Math.floor(rank / 2) + 1));
    let drift = 0;
    const driftRoll = rng();
    if (driftRoll > 0.7) {
      drift = 1;
    } else if (driftRoll < 0.15) {
      drift = -1;
    }
    const level = unlocked ? Math.min(5, Math.max(1, baseLevel + drift)) : 0;
    let status: SectBuilding['status'];
    if (!unlocked) {
      status = '未建';
    } else {
      const statusRoll = rng();
      if (statusRoll < 0.08) {
        status = '受损';
      } else if (statusRoll < 0.12) {
        status = '修缮中';
      } else {
        status = '正常';
      }
    }
    let effect = `需宗门${numberToChinese(template.unlockRank)}品解锁`;
    if (unlocked) {
      effect = `${template.effectLabel}+${Math.max(1, level) * template.perLevel}%`;
    }
    return {
      id: `${idPrefix}${template.key}`,
      name: template.key,
      level,
      status,
      desc: template.desc,
      effect,
      unlockRank: template.unlockRank
    };
  });
};

export const normalizeSectBuildings = (
  rank: SectRank,
  buildings: SectBuilding[] | undefined,
  rng: () => number,
  idPrefix = ''
) => {
  const fallback = buildSectBuildings(rank, rng, idPrefix);
  if (!buildings || !buildings.length) {
    return { buildings: fallback, changed: true };
  }
  const templateMap = new Map(
    sectBuildingTemplates.map((template) => [template.key, template])
  );
  const existingMap = new Map(buildings.map((item) => [item.name, item]));
  let changed = false;
  const next = fallback.map((base) => {
    const existing = existingMap.get(base.name);
    const template = templateMap.get(base.name);
    if (!existing) {
      changed = true;
      return base;
    }
    const unlockRank = existing.unlockRank ?? base.unlockRank ?? 1;
    const unlocked = rank >= unlockRank;
    let level = 0;
    if (typeof existing.level === 'number') {
      level = existing.level;
    } else if (unlocked) {
      level = base.level;
    }
    const status =
      existing.status === '未建' && unlocked ? '正常' : existing.status;
    let { effect } = existing;
    if (!effect) {
      if (unlocked && template) {
        effect = `${template.effectLabel}+${Math.max(1, level) * template.perLevel}%`;
      } else {
        effect = `需宗门${numberToChinese(unlockRank)}品解锁`;
      }
    }
    const merged: SectBuilding = {
      id: existing.id || base.id,
      name: base.name,
      level,
      status: (status || base.status) as SectBuilding['status'],
      desc: existing.desc || base.desc,
      effect,
      unlockRank
    };
    if (
      merged.id !== existing.id ||
      merged.level !== existing.level ||
      merged.status !== existing.status ||
      merged.desc !== existing.desc ||
      merged.effect !== existing.effect ||
      merged.unlockRank !== existing.unlockRank
    ) {
      changed = true;
    }
    return merged;
  });
  return { buildings: next, changed };
};

export const STAGE_ORDER = ['初期', '中期', '后期', '圆满', '大圆满'];

const roleWeights: { role: SectRole; weight: number }[] = [
  { role: '亲传弟子', weight: 12 },
  { role: '内门弟子', weight: 38 },
  { role: '杂役', weight: 50 }
];

export const buildEventText = (
  day: number,
  name: string,
  rng: () => number
) => {
  const pick =
    eventTemplates[Math.floor(rng() * eventTemplates.length)] || '宗门平稳';
  return `第${day}日，${name}${pick}`;
};

export const pickWeightedRole = (rng: () => number) => {
  const total = roleWeights.reduce((sum, item) => sum + item.weight, 0) || 1;
  const target = rng() * total;
  let acc = 0;
  for (let i = 0; i < roleWeights.length; i += 1) {
    acc += roleWeights[i].weight;
    if (target <= acc) return roleWeights[i].role;
  }
  return roleWeights[roleWeights.length - 1].role;
};

export const pickRoleRealmIndex = (
  role: SectRole,
  rank: SectRank,
  rng: () => number
) => {
  const baseTier = Math.min(7, Math.max(2, rank + 1));
  const maxIndex = REALM_ORDER.length - 1;
  const clamp = (value: number) => Math.min(maxIndex, Math.max(0, value));
  if (role === '宗主') {
    const min = clamp(baseTier - 1);
    const max = clamp(baseTier);
    return min + Math.floor(rng() * (max - min + 1));
  }
  if (role === '长老') {
    const min = clamp(baseTier - 2);
    const max = clamp(baseTier - 1);
    return min + Math.floor(rng() * (max - min + 1));
  }
  if (role === '亲传弟子') {
    const min = clamp(baseTier - 3);
    const max = clamp(baseTier - 2);
    return min + Math.floor(rng() * (max - min + 1));
  }
  if (role === '内门弟子') {
    const min = clamp(baseTier - 4);
    const max = clamp(baseTier - 3);
    return min + Math.floor(rng() * (max - min + 1));
  }
  if (role === '外门弟子') {
    const min = clamp(0);
    const max = clamp(baseTier - 4);
    return min + Math.floor(rng() * (max - min + 1));
  }
  const max = clamp(baseTier - 5);
  return Math.floor(rng() * (max + 1));
};

export const buildMemberRelation = (role: SectRole, rng: () => number) => {
  if (role === '宗主') return '宗主';
  if (role === '长老') return '长老';
  if (role === '亲传弟子') return rng() > 0.5 ? '亲传师兄' : '亲传师姐';
  if (role === '内门弟子') return rng() > 0.5 ? '内门师兄' : '内门师姐';
  if (role === '外门弟子') return rng() > 0.5 ? '外门师兄' : '外门师姐';
  return '杂役同门';
};

export const buildIntimacy = (role: SectRole, rng: () => number) => {
  if (role === '宗主') return Math.floor(20 + rng() * 35);
  if (role === '长老') return Math.floor(15 + rng() * 35);
  if (role === '亲传弟子') return Math.floor(35 + rng() * 45);
  if (role === '内门弟子') return Math.floor(20 + rng() * 45);
  if (role === '外门弟子') return Math.floor(10 + rng() * 35);
  return Math.floor(rng() * 30);
};

export const buildMemberBag = (role: SectRole, rng: () => number) => {
  let baseMax = 30;
  let lingshiRange: [number, number] = [10, 80];
  if (role === '宗主') {
    baseMax = 120;
    lingshiRange = [1200, 2400];
  } else if (role === '长老') {
    baseMax = 90;
    lingshiRange = [600, 1600];
  } else if (role === '亲传弟子') {
    baseMax = 70;
    lingshiRange = [240, 900];
  } else if (role === '内门弟子') {
    baseMax = 50;
    lingshiRange = [120, 500];
  } else if (role === '外门弟子') {
    lingshiRange = [40, 200];
  }
  const lingshi =
    Math.floor(lingshiRange[0] + rng() * (lingshiRange[1] - lingshiRange[0])) ||
    0;
  return {
    fb: [],
    dy: [],
    qt: lingshi
      ? ([
          {
            name: '灵石',
            type: CWType.QT,
            isPile: true,
            num: lingshi
          }
        ] as QTItemType[])
      : [],
    max: baseMax
  };
};

export const getMinorMax = (realm: string) => (realm === '练气' ? 12 : 9);

export const growMemberAttr = (
  attr: Partial<ActorDataConfig>,
  rng: () => number,
  bonus = 1
) => ({
  qixue: Math.round((attr.qixue || 0) + 30 * bonus + rng() * 40),
  gongji: Math.round((attr.gongji || 0) + 5 * bonus + rng() * 8),
  fangyu: Math.round((attr.fangyu || 0) + 4 * bonus + rng() * 6),
  sudu: Math.round((attr.sudu || 0) + 2 * bonus + rng() * 4),
  baoji: Math.max(1, Math.round((attr.baoji || 1) + (bonus > 1 ? 1 : 0)))
});

export const advanceMemberRealm = (
  member: SectMember,
  rng: () => number,
  mode: 'minor' | 'major' | 'stage'
) => {
  const realmIndex = REALM_ORDER.indexOf(member.jingjie);
  const stageIndex = Math.max(
    0,
    STAGE_ORDER.indexOf(member.jingjie2 || STAGE_ORDER[0])
  );
  const minorMax = getMinorMax(member.jingjie);
  const currentMinor = JingJie1ToNumber(member.jingjie1 || '') || 1;
  const canMajor =
    member.role === '宗主' ||
    member.role === '长老' ||
    member.role === '亲传弟子';
  let nextMember = { ...member };
  let text = '';
  let bonus = 1;
  const promoteMajor = () => {
    if (!canMajor) return false;
    if (realmIndex < 0 || realmIndex >= REALM_ORDER.length - 1) return false;
    nextMember = {
      ...nextMember,
      jingjie: REALM_ORDER[realmIndex + 1],
      jingjie1: '一阶',
      jingjie2: STAGE_ORDER[0]
    };
    bonus = 2;
    text = `突破至${nextMember.jingjie}`;
    return true;
  };
  if (mode === 'major') {
    if (!promoteMajor()) return null;
  } else if (currentMinor < minorMax) {
    const nextMinor = Math.min(minorMax, currentMinor + 1);
    nextMember = {
      ...nextMember,
      jingjie1: `${numberToChinese(nextMinor)}阶`
    };
    text = `修为提升至${nextMember.jingjie1}`;
  } else {
    const nextStageIndex = stageIndex + 1;
    if (nextStageIndex < STAGE_ORDER.length) {
      nextMember = {
        ...nextMember,
        jingjie1: '一阶',
        jingjie2: STAGE_ORDER[nextStageIndex]
      };
      text = `修为踏入${nextMember.jingjie2}`;
    } else if (!promoteMajor()) {
      return null;
    }
  }
  if (mode === 'stage' && text.startsWith('修为提升')) {
    nextMember = {
      ...nextMember,
      jingjie1: '一阶',
      jingjie2: STAGE_ORDER[Math.min(STAGE_ORDER.length - 1, stageIndex + 1)]
    };
    text = `修为踏入${nextMember.jingjie2}`;
  }
  nextMember = {
    ...nextMember,
    attr: growMemberAttr(nextMember.attr, rng, bonus)
  };
  return { member: nextMember, text };
};

export const addMemberLingshi = (member: SectMember, amount: number) => {
  if (amount <= 0) return member;
  const qt = [...(member.cw?.qt ?? [])];
  const index = qt.findIndex((item) => item.name === '灵石');
  if (index >= 0) {
    const prev = qt[index];
    qt[index] = { ...prev, num: (prev.num || 0) + amount };
  } else {
    qt.push({
      name: '灵石',
      type: CWType.QT,
      isPile: true,
      num: amount
    } as QTItemType);
  }
  return {
    ...member,
    cw: {
      ...member.cw,
      qt
    }
  };
};

export const promoteMemberRole = (member: SectMember, rng: () => number) => {
  const nextRoleMap: Record<SectRole, SectRole | null> = {
    宗主: null,
    长老: null,
    亲传弟子: null,
    内门弟子: '亲传弟子',
    外门弟子: '内门弟子',
    杂役: '外门弟子'
  };
  const nextRole = nextRoleMap[member.role] || null;
  if (!nextRole) return null;
  const relation = buildMemberRelation(nextRole, rng);
  const intimacy = Math.min(100, (member.intimacy || 0) + 8 + rng() * 10);
  return {
    member: {
      ...member,
      role: nextRole,
      relation,
      intimacy: Math.round(intimacy)
    },
    text: `晋升为${nextRole}`
  };
};

export const buildPlayerMember = (
  actor: Partial<ActorDataConfig> & { uuid: string },
  day: number,
  rng: () => number
) => {
  const realmValue = actor.jingjie || REALM_ORDER[0];
  const realmIndex = Math.max(0, REALM_ORDER.indexOf(realmValue));
  let role: SectRole = '外门弟子';
  if (realmIndex >= 6) {
    role = '亲传弟子';
  } else if (realmIndex >= 4) {
    role = '内门弟子';
  }
  const attr = {
    qixue: (actor.qixue || 0) + (actor.addAttr?.qixue || 0),
    gongji: (actor.gongji || 0) + (actor.addAttr?.gongji || 0),
    fangyu: (actor.fangyu || 0) + (actor.addAttr?.fangyu || 0),
    sudu: (actor.sudu || 0) + (actor.addAttr?.sudu || 0),
    baoji: (actor.baoji || 0) + (actor.addAttr?.baoji || 0)
  };
  const cw = actor.cw
    ? {
        ...actor.cw,
        fb: [...actor.cw.fb],
        dy: [...actor.cw.dy],
        qt: [...actor.cw.qt]
      }
    : buildMemberBag(role, rng);
  return {
    id: `player-${actor.uuid}`,
    name: actor.daohao || actor.uuid,
    role,
    relation: buildMemberRelation(role, rng),
    intimacy: buildIntimacy(role, rng),
    jingjie: realmValue,
    jingjie1: actor.jingjie1 || '一阶',
    jingjie2: actor.jingjie2 || '',
    attr,
    joinDay: day,
    cw
  };
};

export const calcMemberScore = (member: SectMember) => {
  const realmIndex = REALM_ORDER.indexOf(member.jingjie);
  const minor = JingJie1ToNumber(member.jingjie1 || '') || 1;
  const stageIndex = Math.max(
    0,
    STAGE_ORDER.indexOf(member.jingjie2 || STAGE_ORDER[0])
  );
  let roleBonus = 1;
  if (member.role === '宗主') {
    roleBonus = 15;
  } else if (member.role === '长老') {
    roleBonus = 10;
  } else if (member.role === '亲传弟子') {
    roleBonus = 6;
  } else if (member.role === '内门弟子') {
    roleBonus = 3;
  }
  return realmIndex * 100 + stageIndex * 10 + minor + roleBonus;
};

export const pickLeaderCandidate = (members: SectMember[]) => {
  if (!members.length) return null;
  let best = members[0];
  let bestScore = calcMemberScore(best);
  for (let i = 1; i < members.length; i += 1) {
    const score = calcMemberScore(members[i]);
    if (score > bestScore) {
      best = members[i];
      bestScore = score;
    }
  }
  return best;
};
