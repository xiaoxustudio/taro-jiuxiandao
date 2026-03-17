import { random } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from '@tarojs/components';
import {
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import {
  REALM_ORDER,
  XIUXIAN_TIME_SCALE_DEFAULT,
  createRng,
  danfangIds,
  dfGrades
} from '@/assets/const';
import danfangData from '@/assets/danfang.json';
import {
  UUID,
  generateRandomName,
  getGradeColor,
  getXiuxianCalendar,
  numberToChinese
} from '@/utils';
import { JJ2_ARR } from '@/utils/zhandou';
import {
  addMemberLingshi,
  advanceMemberRealm,
  buildSectExchangeList,
  buildSectBuildings,
  buildEventText,
  buildIntimacy,
  buildMemberBag,
  buildMemberRelation,
  buildSectTaskList,
  buildPlayerMember,
  getMaxTaskCount,
  getRoleLevel,
  sectBuildingTemplates,
  normalizeSectBuildings,
  growMemberAttr,
  pickLeaderCandidate,
  pickRoleRealmIndex,
  pickWeightedRole,
  promoteMemberRole,
  sectNameParts
} from '@/utils/zongmen';
import type { SectExchangeConfig, SectTaskConfig } from '@/utils/zongmen';
import { CWType } from '@/types';
import { GongFaPinJie } from '@/types/gongfa';
import type {
  ActorDataConfig,
  Sect,
  SectBuilding,
  SectMember,
  SectRank,
  SectRole
} from '@/types';
import chuwu from '@/utils/chuwu';
import { add as addGongfa } from '@/utils/gongfa';
import {
  SectBuildingModal,
  SectContributeModal,
  SectExchangeModal,
  SectLogModal,
  SectMemberDetailModal,
  SectMemberModal,
  SectTaskModal
} from './components';
import './index.less';

export default function MenPai() {
  const { get, set, actor } = useActorController();
  const [memberVisible, setMemberVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [memberDetail, setMemberDetail] = useState<SectMember | null>(null);
  const [buildingDetail, setBuildingDetail] = useState<SectBuilding | null>(
    null
  );
  const [contributeVisible, setContributeVisible] = useState(false);
  const [contributeAmount, setContributeAmount] = useState(100);
  const [taskVisible, setTaskVisible] = useState(false);
  const [exchangeVisible, setExchangeVisible] = useState(false);

  const menpai = useMemo(
    () => get('menpai') as ActorDataConfig['menpai'] | undefined,
    [get]
  );
  const sects = useMemo(() => menpai?.sects ?? [], [menpai?.sects]);
  const joinedSectId = useMemo(
    () => menpai?.joinedSectId ?? null,
    [menpai?.joinedSectId]
  );
  const joinedSect = useMemo(() => {
    if (!joinedSectId) return null;
    return sects.find((item) => item.id === joinedSectId) || null;
  }, [joinedSectId, sects]);
  const playerMemberId = useMemo(
    () => menpai?.playerMemberId ?? null,
    [menpai?.playerMemberId]
  );
  const playerMember = useMemo(() => {
    if (!joinedSect || !playerMemberId) return null;
    return (
      joinedSect.members.find((member) => member.id === playerMemberId) || null
    );
  }, [joinedSect, playerMemberId]);

  const memberMap = useMemo(() => {
    const map = new Map<string, SectMember>();
    sects.forEach((sect) => {
      sect.members.forEach((member) => {
        map.set(member.id, member);
      });
    });
    return map;
  }, [sects]);

  const calendar = useMemo(() => {
    const startAt = get('xiuxianStartAt');
    const flow = get('xiuxianTimeScale') || XIUXIAN_TIME_SCALE_DEFAULT;
    return getXiuxianCalendar(startAt, flow);
  }, [get]);

  const totalDays = useMemo(() => calendar.totalDays, [calendar.totalDays]);
  const lastContributionDay = useMemo(
    () => menpai?.lastContributionDay ?? 0,
    [menpai?.lastContributionDay]
  );
  const lastWelfareDay = useMemo(
    () => menpai?.lastWelfareDay ?? 0,
    [menpai?.lastWelfareDay]
  );
  const lastTaskDay = useMemo(
    () => menpai?.lastTaskDay ?? 0,
    [menpai?.lastTaskDay]
  );
  const taskDoneCount = useMemo(
    () => (totalDays === lastTaskDay ? (menpai?.taskCount ?? 0) : 0),
    [lastTaskDay, menpai?.taskCount, totalDays]
  );
  const roleLevel = useMemo(
    () => getRoleLevel(playerMember?.role),
    [playerMember?.role]
  );
  const maxTaskCount = useMemo(() => {
    return getMaxTaskCount(playerMember?.role);
  }, [playerMember?.role]);
  const taskRemaining = useMemo(() => {
    if (maxTaskCount <= 0) return 0;
    if (totalDays > lastTaskDay) return maxTaskCount;
    return Math.max(0, maxTaskCount - taskDoneCount);
  }, [lastTaskDay, maxTaskCount, taskDoneCount, totalDays]);
  const welfareAmount = useMemo(() => {
    if (!joinedSect) return 0;
    const reputation = joinedSect.reputation ?? 0;
    return Math.max(
      120,
      160 + joinedSect.rank * 120 + Math.floor(reputation * 2)
    );
  }, [joinedSect]);
  const lingshi = useMemo(() => {
    get('cw');
    return chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0;
  }, [get]);
  const taskList = useMemo(() => buildSectTaskList(), []);
  const exchangeList = useMemo(() => buildSectExchangeList(), []);
  const buildingTemplateMap = useMemo(() => {
    return new Map(
      sectBuildingTemplates.map((template) => [template.key, template])
    );
  }, []);

  const getBuildingCosts = useCallback((sect: Sect, building: SectBuilding) => {
    const unlockRank = building.unlockRank ?? 1;
    const unlockCost = 1200 + unlockRank * 800 + sect.rank * 300;
    const repairCost =
      600 + sect.rank * 260 + Math.max(0, building.level) * 120;
    const upgradeCost = 1000 + (building.level + 1) * 800 + sect.rank * 420;
    return { unlockCost, repairCost, upgradeCost };
  }, []);

  const buildEffectText = useCallback(
    (building: SectBuilding, level: number, unlocked: boolean) => {
      if (!unlocked) {
        const unlockRank = building.unlockRank ?? 1;
        return `需宗门${numberToChinese(unlockRank)}品解锁`;
      }
      const template = buildingTemplateMap.get(building.name);
      if (!template) return building.effect;
      return `${template.effectLabel}+${Math.max(1, level) * template.perLevel}%`;
    },
    [buildingTemplateMap]
  );

  const updateBuilding = useCallback(
    (
      sectId: string,
      buildingId: string,
      updater: (current: SectBuilding) => SectBuilding,
      logText: string
    ) => {
      const current = get('menpai') as ActorDataConfig['menpai'] | undefined;
      if (!current?.sects?.length) return null;
      let updated: SectBuilding | null = null;
      const nextSects = current.sects.map((sect) => {
        if (sect.id !== sectId) return sect;
        const nextBuildings = (sect.buildings ?? []).map((building) => {
          if (building.id !== buildingId) return building;
          const next = updater(building);
          updated = next;
          return next;
        });
        const logs = [...(sect.logs ?? []), { day: totalDays, text: logText }];
        return { ...sect, buildings: nextBuildings, logs };
      });
      set('menpai', { ...current, sects: nextSects });
      return updated;
    },
    [get, set, totalDays]
  );

  const createSectMember = useCallback(
    (
      rank: SectRank,
      role: SectRole,
      day: number,
      usedNames: Set<string>,
      rng: () => number
    ) => {
      let name = generateRandomName();
      let guard = 0;
      while (usedNames.has(name) && guard < 10) {
        name = generateRandomName();
        guard += 1;
      }
      usedNames.add(name);
      const realmIndex = pickRoleRealmIndex(role, rank, rng);
      const jingjie = REALM_ORDER[realmIndex] || REALM_ORDER[0];
      const jingjie1 = `${numberToChinese(Math.floor(rng() * 9) + 1)}阶`;
      const jingjie2 =
        JJ2_ARR[Math.floor(rng() * JJ2_ARR.length)] || JJ2_ARR[0];
      const scale = realmIndex + 1;
      const attr = {
        qixue: Math.round(500 + scale * 320 + random(0, 200)),
        gongji: Math.round(40 + scale * 35 + random(0, 15)),
        fangyu: Math.round(30 + scale * 28 + random(0, 12)),
        sudu: Math.round(12 + scale * 14 + random(0, 10)),
        baoji: Math.max(1, Math.round(scale / 2))
      };
      return {
        id: UUID(),
        name,
        role,
        relation: buildMemberRelation(role, rng),
        intimacy: buildIntimacy(role, rng),
        jingjie,
        jingjie1,
        jingjie2,
        attr,
        joinDay: day,
        cw: buildMemberBag(role, rng)
      };
    },
    []
  );

  const normalizeMember = useCallback(
    (member: SectMember, day: number, rng: () => number) => {
      let changedLocal = false;
      const role = member.role || '杂役';
      const relation = member.relation || buildMemberRelation(role, rng);
      const intimacy =
        typeof member.intimacy === 'number'
          ? member.intimacy
          : buildIntimacy(role, rng);
      const joinDay = typeof member.joinDay === 'number' ? member.joinDay : day;
      const attr = member.attr || {};
      const jingjie1 = member.jingjie1 ?? '';
      const jingjie2 = member.jingjie2 ?? '';
      const cw = member.cw || buildMemberBag(role, rng);
      if (
        role !== member.role ||
        relation !== member.relation ||
        intimacy !== member.intimacy ||
        joinDay !== member.joinDay ||
        attr !== member.attr ||
        jingjie1 !== member.jingjie1 ||
        jingjie2 !== member.jingjie2 ||
        cw !== member.cw
      ) {
        changedLocal = true;
      }
      return {
        member: {
          ...member,
          role,
          relation,
          intimacy,
          joinDay,
          attr,
          jingjie1,
          jingjie2,
          cw
        },
        changed: changedLocal
      };
    },
    []
  );

  const applyCasualties = useCallback(
    (
      currentMembers: SectMember[],
      currentElders: Sect['elders'],
      casualtyCount: number,
      rng: () => number
    ) => {
      if (!currentMembers.length || casualtyCount <= 0) {
        return {
          members: currentMembers,
          elders: currentElders,
          fallen: [] as SectMember[]
        };
      }
      const casualtyIds = new Set<string>();
      for (let i = 0; i < casualtyCount; i += 1) {
        const pick = currentMembers[Math.floor(rng() * currentMembers.length)];
        if (pick) casualtyIds.add(pick.id);
      }
      const fallen = currentMembers.filter((m) => casualtyIds.has(m.id));
      if (!fallen.length) {
        return {
          members: currentMembers,
          elders: currentElders,
          fallen
        };
      }
      const members = currentMembers.filter((m) => !casualtyIds.has(m.id));
      const elders = currentElders.map((seat) =>
        seat.memberId && casualtyIds.has(seat.memberId)
          ? { ...seat, memberId: null }
          : seat
      );
      return {
        members,
        elders,
        fallen
      };
    },
    []
  );

  const createInitialMenpai = useCallback(() => {
    const seed = get('uuid');
    const rng = createRng(`${seed}:menpai`);
    const usedNames = new Set<string>();
    const sectsInit = Array.from({ length: 6 }, (_, index) => {
      const sectId = UUID();
      const rank = (Math.min(8, Math.max(1, Math.floor(rng() * 8) + 1)) ||
        1) as SectRank;
      const name = sectNameParts.map(
        (part) => part[Math.floor(rng() * part.length)]
      );
      let sectName = name.join('');
      if (usedNames.has(sectName)) {
        sectName = `${sectName}${index + 1}`;
      }
      usedNames.add(sectName);
      const capacity = Math.max(100, 80 + rank * 60 + random(0, 80));
      const memberCount = Math.min(
        capacity,
        Math.max(100, Math.floor(capacity * (0.6 + rng() * 0.3)))
      );
      const memberNames = new Set<string>();
      const eldersCount = Math.min(5, Math.max(0, Math.floor(rng() * 6)));
      const members: SectMember[] = [];
      const leader = createSectMember(
        rank,
        '宗主',
        totalDays,
        memberNames,
        rng
      );
      members.push(leader);
      for (let i = 0; i < eldersCount; i += 1) {
        members.push(
          createSectMember(rank, '长老', totalDays, memberNames, rng)
        );
      }
      const remaining = Math.max(0, memberCount - members.length);
      for (let i = 0; i < remaining; i += 1) {
        const role = pickWeightedRole(rng);
        members.push(createSectMember(rank, role, totalDays, memberNames, rng));
      }
      const elders = Array.from({ length: 5 }, (__, seatIndex) => {
        const member = seatIndex < eldersCount ? members[seatIndex + 1] : null;
        return {
          seat: seatIndex + 1,
          memberId: member?.id || null
        };
      });
      const logs = [
        {
          day: totalDays,
          text: buildEventText(totalDays, sectName, rng)
        }
      ];
      const buildings = buildSectBuildings(
        rank,
        createRng(`${sectId}:buildings`),
        `${sectId}-`
      );
      return {
        id: sectId,
        name: sectName,
        rank,
        capacity,
        elders,
        members,
        logs,
        buildings,
        lastEventDay: totalDays,
        reputation: Math.floor(40 + rng() * 30),
        injuryRecoveryUntilDay: 0,
        warMeritDays: 0,
        revengeLevel: 0,
        revengeNextDay: 0
      };
    });
    return { sects: sectsInit, joinedSectId: null };
  }, [createSectMember, get, totalDays]);

  useEffect(() => {
    if (joinedSectId) return;
    if (sects.length >= 6) return;
    const init = createInitialMenpai();
    set('menpai', init);
  }, [createInitialMenpai, joinedSectId, sects.length, set]);

  useEffect(() => {
    if (!sects.length) return;
    if (totalDays <= 0) return;
    let changed = false;
    const nextSects: Sect[] = sects.map((sect) => {
      const rng = createRng(`${sect.id}:${totalDays}`);
      const usedNames = new Set<string>(sect.members.map((m) => m.name));
      let members = [...sect.members];
      let elders = [...sect.elders];
      let logs = [...sect.logs];
      let logFixed = false;
      let memberFixed = false;
      let buildingFixed = false;
      let buildings = sect.buildings ?? [];
      const buildingResult = normalizeSectBuildings(
        sect.rank,
        sect.buildings,
        createRng(`${sect.id}:buildings`),
        `${sect.id}-`
      );
      if (buildingResult.changed) {
        buildingFixed = true;
        buildings = buildingResult.buildings;
      }
      members = members.map((member) => {
        const result = normalizeMember(member, totalDays, rng);
        if (result.changed) memberFixed = true;
        return result.member;
      });
      logs = logs.map((log) => {
        if (log?.text) return log;
        logFixed = true;
        const safeDay = log?.day ?? totalDays;
        return {
          day: safeDay,
          text: `第${safeDay}日，${sect.name}宗门平稳`
        };
      });
      const needsEvents = totalDays > sect.lastEventDay;
      let reputation =
        typeof sect.reputation === 'number' ? sect.reputation : 50;
      let injuryRecoveryUntilDay =
        typeof sect.injuryRecoveryUntilDay === 'number'
          ? sect.injuryRecoveryUntilDay
          : 0;
      let warMeritDays =
        typeof sect.warMeritDays === 'number' ? sect.warMeritDays : 0;
      let revengeLevel =
        typeof sect.revengeLevel === 'number' ? sect.revengeLevel : 0;
      let revengeNextDay =
        typeof sect.revengeNextDay === 'number' ? sect.revengeNextDay : 0;
      const clamp = (value: number, min = 0, max = 100) =>
        Math.min(max, Math.max(min, value));
      if (!needsEvents && !logFixed && !memberFixed && !buildingFixed) {
        if (
          reputation !== sect.reputation ||
          injuryRecoveryUntilDay !== sect.injuryRecoveryUntilDay ||
          warMeritDays !== sect.warMeritDays ||
          revengeLevel !== sect.revengeLevel ||
          revengeNextDay !== sect.revengeNextDay
        ) {
          changed = true;
          return {
            ...sect,
            buildings,
            reputation,
            injuryRecoveryUntilDay,
            warMeritDays,
            revengeLevel,
            revengeNextDay
          };
        }
        return sect;
      }
      if (needsEvents) {
        for (let day = sect.lastEventDay + 1; day <= totalDays; day += 1) {
          const pickedMember =
            members.length > 0
              ? members[Math.floor(rng() * members.length)]
              : null;
          const isRecovery =
            injuryRecoveryUntilDay > 0 && day <= injuryRecoveryUntilDay;
          const revengeDue = revengeLevel > 0 && day >= revengeNextDay;
          let handled = false;
          if (revengeDue) {
            const strength =
              members.length / Math.max(1, sect.capacity) + reputation / 200;
            const winChance = Math.min(0.85, Math.max(0.2, strength * 0.7));
            const win = rng() < winChance;
            if (win) {
              reputation = clamp(reputation + Math.floor(3 + rng() * 5));
              logs.push({
                day,
                text: `第${day}日，${sect.name}外敌复仇来袭，宗门守住阵线，声望上扬`
              });
              revengeLevel = Math.max(0, revengeLevel - 1);
              revengeNextDay = revengeLevel
                ? day + Math.floor(5 + rng() * 8)
                : 0;
              warMeritDays = Math.max(warMeritDays, Math.floor(2 + rng() * 3));
            } else {
              const casualties = Math.max(
                1,
                Math.min(6, Math.floor(2 + rng() * 5))
              );
              const result = applyCasualties(members, elders, casualties, rng);
              members = result.members;
              elders = result.elders;
              const { fallen } = result;
              injuryRecoveryUntilDay = Math.max(
                injuryRecoveryUntilDay,
                day + Math.floor(3 + rng() * 5)
              );
              reputation = clamp(reputation - Math.floor(4 + rng() * 6));
              revengeLevel = Math.min(3, revengeLevel + 1);
              revengeNextDay = day + Math.floor(3 + rng() * 6);
              const leaderGone = fallen.some((m) => m.role === '宗主');
              if (leaderGone) {
                const candidate = pickLeaderCandidate(members);
                if (candidate) {
                  members = members.map((m) =>
                    m.id === candidate.id
                      ? {
                          ...candidate,
                          role: '宗主',
                          relation: '宗主',
                          intimacy: Math.min(100, candidate.intimacy + 10)
                        }
                      : m
                  );
                  logs.push({
                    day,
                    text: `第${day}日，${sect.name}外敌复仇得手，宗主殒落，${candidate.name}继任宗主`
                  });
                } else {
                  logs.push({
                    day,
                    text: `第${day}日，${sect.name}外敌复仇得手，宗主殒落`
                  });
                }
              } else {
                logs.push({
                  day,
                  text: `第${day}日，${sect.name}外敌复仇得手，伤亡${fallen.length}人`
                });
              }
              if (
                members.length < Math.max(10, Math.floor(sect.capacity * 0.5))
              ) {
                logs.push({
                  day,
                  text: `第${day}日，${sect.name}开始广募弟子补充战力`
                });
              }
            }
            handled = true;
          }
          if (!handled && warMeritDays > 0 && pickedMember && rng() > 0.2) {
            const reward = Math.max(20, Math.floor(80 + rng() * 180));
            const updated = addMemberLingshi(pickedMember, reward);
            members = members.map((m) => (m.id === updated.id ? updated : m));
            warMeritDays = Math.max(0, warMeritDays - 1);
            reputation = clamp(reputation + 1);
            logs.push({
              day,
              text: `第${day}日，${updated.name}领取战功奖励灵石${reward}`
            });
            handled = true;
          }
          if (!handled && isRecovery && rng() > 0.4) {
            logs.push({
              day,
              text: `第${day}日，${sect.name}战损后弟子养伤，宗门暂缓外出`
            });
            if (day === injuryRecoveryUntilDay) {
              logs.push({
                day,
                text: `第${day}日，${sect.name}伤势恢复完毕，宗门渐复元气`
              });
            }
            handled = true;
          }
          if (!handled) {
            const eventIndex = Math.floor(rng() * 15);
            if (eventIndex === 0 && members.length < sect.capacity) {
              const role = pickWeightedRole(rng);
              const recruit = createSectMember(
                sect.rank,
                role,
                day,
                usedNames,
                rng
              );
              members = [...members, recruit];
              reputation = clamp(reputation + 1);
              logs.push({
                day,
                text: `第${day}日，${sect.name}招收新弟子${recruit.name}`
              });
            } else if (eventIndex === 1 && pickedMember) {
              const progress = advanceMemberRealm(pickedMember, rng, 'minor');
              if (progress) {
                members = members.map((m) =>
                  m.id === progress.member.id ? progress.member : m
                );
                logs.push({
                  day,
                  text: `第${day}日，${progress.member.name}${progress.text}`
                });
                reputation = clamp(reputation + 1);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 2 && pickedMember) {
              const progress = advanceMemberRealm(pickedMember, rng, 'stage');
              if (progress) {
                members = members.map((m) =>
                  m.id === progress.member.id ? progress.member : m
                );
                logs.push({
                  day,
                  text: `第${day}日，${progress.member.name}${progress.text}`
                });
                reputation = clamp(reputation + 1);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 3 && pickedMember) {
              const progress = advanceMemberRealm(pickedMember, rng, 'major');
              if (progress) {
                members = members.map((m) =>
                  m.id === progress.member.id ? progress.member : m
                );
                logs.push({
                  day,
                  text: `第${day}日，${progress.member.name}${progress.text}`
                });
                reputation = clamp(reputation + 2);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 4) {
              const emptySeat = elders.find((seat) => !seat.memberId);
              if (emptySeat && pickedMember) {
                elders = elders.map((seat) =>
                  seat.seat === emptySeat.seat
                    ? { ...seat, memberId: pickedMember.id }
                    : seat
                );
                logs.push({
                  day,
                  text: `第${day}日，${pickedMember.name}被推举为第${emptySeat.seat}席长老`
                });
                reputation = clamp(reputation + 1);
              } else {
                logs.push({
                  day,
                  text: `第${day}日，${sect.name}长老议事`
                });
              }
            } else if (eventIndex === 5 && pickedMember) {
              logs.push({
                day,
                text: `第${day}日，${pickedMember.name}外出历练收获机缘`
              });
            } else if (eventIndex === 6 && pickedMember) {
              logs.push({
                day,
                text: `第${day}日，${pickedMember.name}闭关稳固修为`
              });
            } else if (eventIndex === 7 && pickedMember) {
              const reward = Math.max(10, Math.floor(50 + rng() * 120));
              const updated = addMemberLingshi(pickedMember, reward);
              members = members.map((m) => (m.id === updated.id ? updated : m));
              logs.push({
                day,
                text: `第${day}日，${updated.name}带回灵石${reward}`
              });
              reputation = clamp(reputation + 1);
            } else if (eventIndex === 8 && members.length > 1) {
              const rival =
                members[Math.floor(rng() * members.length)] || pickedMember;
              if (pickedMember && rival && pickedMember.id !== rival.id) {
                const winner = rng() > 0.5 ? pickedMember : rival;
                const grown = {
                  ...winner,
                  attr: growMemberAttr(winner.attr, rng, 1)
                };
                members = members.map((m) => (m.id === grown.id ? grown : m));
                logs.push({
                  day,
                  text: `第${day}日，${pickedMember.name}与${rival.name}切磋，${grown.name}胜出`
                });
                reputation = clamp(reputation + 1);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 9 && pickedMember) {
              const promote = promoteMemberRole(pickedMember, rng);
              if (promote) {
                members = members.map((m) =>
                  m.id === promote.member.id ? promote.member : m
                );
                logs.push({
                  day,
                  text: `第${day}日，${promote.member.name}${promote.text}`
                });
                reputation = clamp(reputation + 1);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 10 && pickedMember) {
              const improved = {
                ...pickedMember,
                intimacy: Math.min(100, pickedMember.intimacy + 5 + rng() * 8)
              };
              members = members.map((m) =>
                m.id === improved.id ? improved : m
              );
              logs.push({
                day,
                text: `第${day}日，${improved.name}在宗门贡献增加亲密度`
              });
              reputation = clamp(reputation + 1);
            } else if (eventIndex === 11 && members.length > 5) {
              const casualties = Math.max(
                1,
                Math.min(5, Math.floor(1 + rng() * 4))
              );
              const result = applyCasualties(members, elders, casualties, rng);
              const { fallen } = result;
              if (fallen.length) {
                members = result.members;
                elders = result.elders;
                injuryRecoveryUntilDay = Math.max(
                  injuryRecoveryUntilDay,
                  day + Math.floor(3 + rng() * 5)
                );
                revengeLevel = Math.max(1, revengeLevel);
                revengeNextDay = day + Math.floor(4 + rng() * 8);
                reputation = clamp(reputation - Math.floor(4 + rng() * 5));
                const leaderGone = fallen.some((m) => m.role === '宗主');
                if (leaderGone) {
                  const candidate = pickLeaderCandidate(members);
                  if (candidate) {
                    members = members.map((m) =>
                      m.id === candidate.id
                        ? {
                            ...candidate,
                            role: '宗主',
                            relation: '宗主',
                            intimacy: Math.min(100, candidate.intimacy + 10)
                          }
                        : m
                    );
                    logs.push({
                      day,
                      text: `第${day}日，${sect.name}遭外敌入侵，宗主殒落，${candidate.name}继任宗主`
                    });
                  } else {
                    logs.push({
                      day,
                      text: `第${day}日，${sect.name}遭外敌入侵，宗主殒落`
                    });
                  }
                } else {
                  logs.push({
                    day,
                    text: `第${day}日，${sect.name}遭外敌入侵，伤亡${fallen.length}人`
                  });
                }
                if (
                  members.length < Math.max(10, Math.floor(sect.capacity * 0.5))
                ) {
                  logs.push({
                    day,
                    text: `第${day}日，${sect.name}开始广募弟子补充战力`
                  });
                }
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 12 && members.length > 3) {
              const candidate = pickLeaderCandidate(members);
              if (candidate && candidate.role !== '宗主') {
                members = members.map((m) =>
                  m.id === candidate.id
                    ? {
                        ...candidate,
                        role: '宗主',
                        relation: '宗主',
                        intimacy: Math.min(100, candidate.intimacy + 6)
                      }
                    : m
                );
                logs.push({
                  day,
                  text: `第${day}日，${candidate.name}被推举为宗主`
                });
                reputation = clamp(reputation + 2);
              } else {
                logs.push({
                  day,
                  text: buildEventText(day, sect.name, rng)
                });
              }
            } else if (eventIndex === 13) {
              const gain = Math.floor(2 + rng() * 5);
              reputation = clamp(reputation + gain);
              logs.push({
                day,
                text: `第${day}日，${sect.name}声望提升，名望上扬`
              });
            } else if (eventIndex === 14) {
              const loss = Math.floor(2 + rng() * 5);
              reputation = clamp(reputation - loss);
              logs.push({
                day,
                text: `第${day}日，${sect.name}声望受挫，坊间流言四起`
              });
            } else {
              logs.push({
                day,
                text: buildEventText(day, sect.name, rng)
              });
            }
          }
          if (logs.length > 200) {
            logs = logs.slice(logs.length - 200);
          }
        }
      }
      changed = true;
      return {
        ...sect,
        members,
        elders,
        logs,
        buildings,
        lastEventDay: totalDays,
        reputation,
        injuryRecoveryUntilDay,
        warMeritDays,
        revengeLevel,
        revengeNextDay
      };
    });
    if (changed) {
      set('menpai', { sects: nextSects });
    }
  }, [
    applyCasualties,
    createSectMember,
    normalizeMember,
    sects,
    set,
    totalDays
  ]);

  useEffect(() => {
    if (!joinedSect || !actor?.uuid) return;
    const safeActor = actor as Partial<ActorDataConfig> & { uuid: string };
    const current = get('menpai') as ActorDataConfig['menpai'] | undefined;
    if (!current?.sects?.length) return;
    const target = current.sects.find((item) => item.id === joinedSect.id);
    if (!target) return;
    const player = buildPlayerMember(
      safeActor,
      totalDays,
      createRng(`${actor.uuid}:menpai:player`)
    );
    const alreadyIn = target.members.some((member) => member.id === player.id);
    const nextPlayerId = current.playerMemberId || player.id;
    if (alreadyIn && nextPlayerId === current.playerMemberId) return;
    const members = alreadyIn ? target.members : [...target.members, player];
    const logs = alreadyIn
      ? target.logs
      : [
          ...(target.logs ?? []),
          {
            day: totalDays,
            text: `第${totalDays}日，${player.name}加入${target.name}`
          }
        ];
    const nextSects = current.sects.map((sect) =>
      sect.id === target.id ? { ...sect, members, logs } : sect
    );
    set('menpai', {
      ...current,
      sects: nextSects,
      joinedSectId: target.id,
      playerMemberId: nextPlayerId
    });
  }, [actor, get, joinedSect, set, totalDays]);

  const handleOpenMember = useCallback((member: SectMember) => {
    setMemberDetail(member);
  }, []);

  const buildingCosts = useMemo(() => {
    if (!joinedSect || !buildingDetail) return null;
    return getBuildingCosts(joinedSect, buildingDetail);
  }, [buildingDetail, getBuildingCosts, joinedSect]);

  const handleUnlockBuilding = useCallback(() => {
    if (!joinedSect || !buildingDetail || !buildingCosts) return;
    const unlockRank = buildingDetail.unlockRank ?? 1;
    if (joinedSect.rank < unlockRank) {
      JXToast(`宗门品阶不足，需${numberToChinese(unlockRank)}品`).show();
      return;
    }
    if (lingshi < buildingCosts.unlockCost) {
      JXToast('灵石不足').show();
      return;
    }
    chuwu.Remove({
      name: '灵石',
      type: CWType.QT,
      num: buildingCosts.unlockCost
    });
    const next = updateBuilding(
      joinedSect.id,
      buildingDetail.id,
      (current) => {
        const level = Math.max(1, current.level || 1);
        return {
          ...current,
          level,
          status: '正常',
          effect: buildEffectText(current, level, true)
        };
      },
      `第${totalDays}日，${joinedSect.name}${buildingDetail.name}正式启用`
    );
    if (next) {
      setBuildingDetail(next);
    }
    JXToast(`已解锁${buildingDetail.name}`).show();
  }, [
    buildEffectText,
    buildingCosts,
    buildingDetail,
    joinedSect,
    lingshi,
    totalDays,
    updateBuilding
  ]);

  const handleRepairBuilding = useCallback(() => {
    if (!joinedSect || !buildingDetail || !buildingCosts) return;
    if (buildingDetail.status === '正常') return;
    if (lingshi < buildingCosts.repairCost) {
      JXToast('灵石不足').show();
      return;
    }
    if (buildingDetail.level <= 0) {
      JXToast('建筑尚未解锁').show();
      return;
    }
    chuwu.Remove({
      name: '灵石',
      type: CWType.QT,
      num: buildingCosts.repairCost
    });
    const next = updateBuilding(
      joinedSect.id,
      buildingDetail.id,
      (current) => ({
        ...current,
        status: '正常'
      }),
      `第${totalDays}日，${joinedSect.name}${buildingDetail.name}修缮完毕`
    );
    if (next) {
      setBuildingDetail(next);
    }
    JXToast(`${buildingDetail.name}修缮完成`).show();
  }, [
    buildingCosts,
    buildingDetail,
    joinedSect,
    lingshi,
    totalDays,
    updateBuilding
  ]);

  const handleUpgradeBuilding = useCallback(() => {
    if (!joinedSect || !buildingDetail || !buildingCosts) return;
    if (buildingDetail.status !== '正常') {
      JXToast('建筑需先修缮').show();
      return;
    }
    if (buildingDetail.level >= 5) {
      JXToast('建筑已满级').show();
      return;
    }
    if (lingshi < buildingCosts.upgradeCost) {
      JXToast('灵石不足').show();
      return;
    }
    chuwu.Remove({
      name: '灵石',
      type: CWType.QT,
      num: buildingCosts.upgradeCost
    });
    const next = updateBuilding(
      joinedSect.id,
      buildingDetail.id,
      (current) => {
        const nextLevel = Math.min(5, (current.level || 1) + 1);
        return {
          ...current,
          level: nextLevel,
          effect: buildEffectText(current, nextLevel, true)
        };
      },
      `第${totalDays}日，${joinedSect.name}${buildingDetail.name}升至${buildingDetail.level + 1}级`
    );
    if (next) {
      setBuildingDetail(next);
    }
    JXToast(`${buildingDetail.name}升至${buildingDetail.level + 1}级`).show();
  }, [
    buildEffectText,
    buildingCosts,
    buildingDetail,
    joinedSect,
    lingshi,
    totalDays,
    updateBuilding
  ]);

  const updateJoinedSect = useCallback(
    (
      updater: (sect: Sect) => Sect,
      extra?: Partial<ActorDataConfig['menpai']>
    ) => {
      const current = get('menpai') as ActorDataConfig['menpai'] | undefined;
      if (!current?.sects?.length || !joinedSect) return null;
      let updated: Sect | null = null;
      const nextSects = current.sects.map((sect) => {
        if (sect.id !== joinedSect.id) return sect;
        const next = updater(sect);
        updated = next;
        return next;
      });
      set('menpai', { ...current, sects: nextSects, ...extra });
      return updated;
    },
    [get, joinedSect, set]
  );

  const handleConfirmContribution = useCallback(() => {
    if (!joinedSect || !playerMember) return;
    if (totalDays <= lastContributionDay) {
      JXToast('今日已贡献').show();
      return;
    }
    if (lingshi <= 0) {
      JXToast('灵石不足').show();
      return;
    }
    const amount = Math.max(1, Math.min(contributeAmount, lingshi));
    const repGain = Math.max(1, Math.floor(amount / 200));
    const intimacyGain = Math.max(2, Math.floor(repGain * 2));
    chuwu.Remove({ name: '灵石', type: CWType.QT, num: amount });
    updateJoinedSect(
      (sect) => {
        const members = sect.members.map((member) => {
          if (member.id !== playerMember.id) return member;
          return {
            ...member,
            intimacy: Math.min(100, (member.intimacy || 0) + intimacyGain)
          };
        });
        const logs = [
          ...(sect.logs ?? []),
          {
            day: totalDays,
            text: `第${totalDays}日，${playerMember.name}贡献灵石${amount}，宗门声望上扬`
          }
        ];
        return {
          ...sect,
          members,
          logs,
          reputation: Math.min(100, (sect.reputation ?? 0) + repGain)
        };
      },
      { lastContributionDay: totalDays }
    );
    setContributeVisible(false);
    JXToast(`已贡献灵石${amount}`).show();
  }, [
    contributeAmount,
    joinedSect,
    lastContributionDay,
    lingshi,
    playerMember,
    totalDays,
    updateJoinedSect
  ]);

  const handleReceiveWelfare = useCallback(() => {
    if (!joinedSect || !playerMember) return;
    if (totalDays <= lastWelfareDay) {
      JXToast('今日已领取').show();
      return;
    }
    if (welfareAmount <= 0) {
      JXToast('当前无俸禄').show();
      return;
    }
    chuwu.Add({
      name: '灵石',
      type: CWType.QT,
      num: welfareAmount,
      isPile: true
    });
    updateJoinedSect(
      (sect) => {
        const logs = [
          ...(sect.logs ?? []),
          {
            day: totalDays,
            text: `第${totalDays}日，${playerMember.name}领取宗门俸禄灵石${welfareAmount}`
          }
        ];
        return { ...sect, logs };
      },
      { lastWelfareDay: totalDays }
    );
    JXToast(`领取俸禄灵石${welfareAmount}`).show();
  }, [
    joinedSect,
    lastWelfareDay,
    playerMember,
    totalDays,
    updateJoinedSect,
    welfareAmount
  ]);

  const handleTakeTask = useCallback(
    (task: SectTaskConfig) => {
      if (!joinedSect || !playerMember) return;
      const requiredRoleLevel = getRoleLevel(task.minRole);
      if (roleLevel < requiredRoleLevel) {
        JXToast('职位不足，无法领取该任务').show();
        return;
      }
      if (taskRemaining <= 0) {
        JXToast('今日任务已完成').show();
        return;
      }
      const currentDone = totalDays === lastTaskDay ? taskDoneCount : 0;
      const rng = createRng(
        `${joinedSect.id}:task:${totalDays}:${task.key}:${currentDone}`
      );
      let rewardText = '';
      if (task.reward.type === 'lingshi') {
        const reward = Math.max(
          10,
          Math.floor(
            task.reward.min + rng() * (task.reward.max - task.reward.min + 1)
          )
        );
        chuwu.Add({
          name: '灵石',
          type: CWType.QT,
          num: reward,
          isPile: true
        });
        rewardText = `灵石${reward}`;
      } else if (task.reward.type === 'danyao') {
        const gradeIndex = dfGrades.indexOf(task.reward.grade);
        const candidates = danfangIds.filter((id) => {
          const base = (danfangData as Record<string, any>)[id];
          const itemGrade = base?.itype;
          const itemIndex = dfGrades.indexOf(itemGrade);
          return itemIndex >= 0 && itemIndex <= gradeIndex;
        });
        const pickId = candidates[Math.floor(rng() * candidates.length)] || '';
        const base = (danfangData as Record<string, any>)[pickId];
        const countMin = task.reward.countRange[0];
        const countMax = task.reward.countRange[1];
        const count =
          countMax <= countMin
            ? countMin
            : Math.floor(countMin + rng() * (countMax - countMin + 1));
        if (base?.name) {
          chuwu.Add({
            name: base.name,
            type: CWType.DY,
            num: Math.max(1, count),
            isPile: true
          });
          rewardText = `丹药${base.name}×${Math.max(1, count)}`;
        } else {
          const fallback = Math.max(180, Math.floor(220 + rng() * 120));
          chuwu.Add({
            name: '灵石',
            type: CWType.QT,
            num: fallback,
            isPile: true
          });
          rewardText = `灵石${fallback}`;
        }
      } else if (task.reward.type === 'gongfa') {
        const gongfaGrades = [
          GongFaPinJie.一品,
          GongFaPinJie.二品,
          GongFaPinJie.三品,
          GongFaPinJie.四品,
          GongFaPinJie.五品,
          GongFaPinJie.六品,
          GongFaPinJie.七品,
          GongFaPinJie.八品
        ];
        const maxIndex = Math.max(0, gongfaGrades.indexOf(task.reward.grade));
        const pool = get('gongfaPoolByGrade') as
          | Record<string, any[]>
          | undefined;
        const candidates = gongfaGrades
          .slice(0, maxIndex + 1)
          .flatMap((grade) => pool?.[grade] ?? []);
        const ownedIds = new Set<string>();
        (get('gongfa.ls') as any[] | undefined)?.forEach((item) => {
          if (item?.id) ownedIds.add(item.id);
        });
        const current = get('gongfa.current') as any;
        if (current?.id) ownedIds.add(current.id);
        const available = candidates.filter(
          (item) => item?.id && !ownedIds.has(item.id)
        );
        const pick =
          (available.length ? available : candidates)[
            Math.floor(rng() * candidates.length)
          ] || null;
        if (pick?.name) {
          addGongfa({ ...pick });
          rewardText = `功法《${pick.name}》`;
        } else {
          const fallback = Math.max(320, Math.floor(360 + rng() * 160));
          chuwu.Add({
            name: '灵石',
            type: CWType.QT,
            num: fallback,
            isPile: true
          });
          rewardText = `灵石${fallback}`;
        }
      }
      const nextTaskCount = totalDays === lastTaskDay ? currentDone + 1 : 1;
      updateJoinedSect(
        (sect) => {
          const logs = [
            ...(sect.logs ?? []),
            {
              day: totalDays,
              text: `第${totalDays}日，${playerMember.name}完成${task.name}，获得${rewardText}`
            }
          ];
          return {
            ...sect,
            logs,
            reputation: Math.min(
              100,
              (sect.reputation ?? 0) + task.reputationGain
            )
          };
        },
        { lastTaskDay: totalDays, taskCount: nextTaskCount }
      );
      JXToast(`完成${task.name}，获得${rewardText}`).show();
    },
    [
      get,
      joinedSect,
      lastTaskDay,
      playerMember,
      roleLevel,
      taskDoneCount,
      taskRemaining,
      totalDays,
      updateJoinedSect
    ]
  );

  const handleExchange = useCallback(
    (item: SectExchangeConfig) => {
      if (!joinedSect || !playerMember) return;
      const reputation = joinedSect.reputation ?? 0;
      if (reputation < item.cost) {
        JXToast('宗门声望不足').show();
        return;
      }
      let rewardText = '';
      if (item.reward.type === 'lingshi') {
        chuwu.Add({
          name: '灵石',
          type: CWType.QT,
          num: item.reward.amount,
          isPile: true
        });
        rewardText = `灵石${item.reward.amount}`;
      } else if (item.reward.type === 'danyao') {
        const gradeIndex = dfGrades.indexOf(item.reward.grade);
        const candidates = danfangIds.filter((id) => {
          const base = (danfangData as Record<string, any>)[id];
          const itemGrade = base?.itype;
          const itemIndex = dfGrades.indexOf(itemGrade);
          return itemIndex >= 0 && itemIndex <= gradeIndex;
        });
        const rng = createRng(
          `${joinedSect.id}:exchange:${totalDays}:${item.key}`
        );
        const pickId = candidates[Math.floor(rng() * candidates.length)] || '';
        const base = (danfangData as Record<string, any>)[pickId];
        if (base?.name) {
          chuwu.Add({
            name: base.name,
            type: CWType.DY,
            num: 1,
            isPile: true
          });
          rewardText = `丹药${base.name}×1`;
        } else {
          chuwu.Add({
            name: '灵石',
            type: CWType.QT,
            num: 360,
            isPile: true
          });
          rewardText = '灵石360';
        }
      } else if (item.reward.type === 'gongfa') {
        const rng = createRng(
          `${joinedSect.id}:exchange:${totalDays}:${item.key}`
        );
        const gongfaGrades = [
          GongFaPinJie.一品,
          GongFaPinJie.二品,
          GongFaPinJie.三品,
          GongFaPinJie.四品,
          GongFaPinJie.五品,
          GongFaPinJie.六品,
          GongFaPinJie.七品,
          GongFaPinJie.八品
        ];
        const maxIndex = Math.max(0, gongfaGrades.indexOf(item.reward.grade));
        const pool = get('gongfaPoolByGrade') as
          | Record<string, any[]>
          | undefined;
        const candidates = gongfaGrades
          .slice(0, maxIndex + 1)
          .flatMap((grade) => pool?.[grade] ?? []);
        const ownedIds = new Set<string>();
        (get('gongfa.ls') as any[] | undefined)?.forEach((entry) => {
          if (entry?.id) ownedIds.add(entry.id);
        });
        const current = get('gongfa.current') as any;
        if (current?.id) ownedIds.add(current.id);
        const available = candidates.filter(
          (entry) => entry?.id && !ownedIds.has(entry.id)
        );
        const pick =
          (available.length ? available : candidates)[
            Math.floor(rng() * candidates.length)
          ] || null;
        if (pick?.name) {
          addGongfa({ ...pick });
          rewardText = `功法《${pick.name}》`;
        } else {
          chuwu.Add({
            name: '灵石',
            type: CWType.QT,
            num: 520,
            isPile: true
          });
          rewardText = '灵石520';
        }
      }
      updateJoinedSect((sect) => {
        const logs = [
          ...(sect.logs ?? []),
          {
            day: totalDays,
            text: `第${totalDays}日，${playerMember.name}消耗声望${item.cost}兑换${rewardText}`
          }
        ];
        return {
          ...sect,
          logs,
          reputation: Math.max(0, (sect.reputation ?? 0) - item.cost)
        };
      });
      setExchangeVisible(false);
      JXToast(`已兑换${rewardText}`).show();
    },
    [get, joinedSect, playerMember, totalDays, updateJoinedSect]
  );

  const handleExitSect = useCallback(() => {
    if (!joinedSect || !playerMember) return;
    const { close } = JXModal.show({
      title: '退出宗门',
      okText: '退出',
      cancleText: '取消',
      content: (
        <JXSpace direction='vertical' gap={6}>
          <Text>确认退出{joinedSect.name}？</Text>
          <Text>退出后宗门职位将清空，需要重新申请加入。</Text>
        </JXSpace>
      ),
      onOk() {
        const current = get('menpai') as ActorDataConfig['menpai'] | undefined;
        if (!current?.sects?.length) {
          close();
          return;
        }
        const nextSects = current.sects.map((sect) => {
          if (sect.id !== joinedSect.id) return sect;
          const remaining = sect.members.filter(
            (member) => member.id !== playerMember.id
          );
          let members = remaining;
          const elders = sect.elders.map((seat) =>
            seat.memberId === playerMember.id
              ? { ...seat, memberId: null }
              : seat
          );
          if (playerMember.role === '宗主') {
            const candidate = pickLeaderCandidate(remaining);
            if (candidate) {
              members = remaining.map((member) =>
                member.id === candidate.id
                  ? {
                      ...candidate,
                      role: '宗主',
                      relation: '宗主',
                      intimacy: Math.min(100, candidate.intimacy + 10)
                    }
                  : member
              );
            }
          }
          const logs = [
            ...(sect.logs ?? []),
            {
              day: totalDays,
              text: `第${totalDays}日，${playerMember.name}退出${sect.name}`
            }
          ];
          return { ...sect, members, elders, logs };
        });
        set('menpai', {
          ...current,
          sects: nextSects,
          joinedSectId: null,
          playerMemberId: undefined
        });
        JXToast('已退出宗门').show();
        close();
      }
    });
  }, [get, joinedSect, playerMember, set, totalDays]);

  return (
    <Container title='门派'>
      <JXSpace direction='vertical' className='menpai-container' gap={12}>
        {!joinedSect && <Text>未加入宗门</Text>}
        {joinedSect && (
          <View className='menpai-card'>
            <JXSpace direction='vertical' gap={8}>
              <Text
                bold
                color={getGradeColor(`${numberToChinese(joinedSect.rank)}品`)}
              >
                {joinedSect.name}（{numberToChinese(joinedSect.rank)}品）
              </Text>
              <Text>
                弟子：{joinedSect.members.length}/{joinedSect.capacity}
              </Text>
              <Text>声望：{joinedSect.reputation ?? 0}</Text>
              <Text>长老席位</Text>
              <View className='menpai-elders'>
                {joinedSect.elders.map((seat) => {
                  const member = seat.memberId
                    ? memberMap.get(seat.memberId)
                    : null;
                  return (
                    <Text
                      key={`${joinedSect.id}-${seat.seat}`}
                      className='menpai-elder'
                    >
                      第{seat.seat}席：{member?.name || '空缺'}
                    </Text>
                  );
                })}
              </View>
              <Text>宗门建筑</Text>
              <View className='menpai-building-list'>
                {(joinedSect.buildings ?? []).length ? (
                  joinedSect.buildings?.map((building) => (
                    <View key={building.id} className='menpai-building-row'>
                      <View className='menpai-building-info'>
                        <Text bold>{building.name}</Text>
                        <Text>
                          等级：
                          {building.level > 0 ? building.level : '未建'}
                        </Text>
                        <Text>状态：{building.status}</Text>
                        <Text>{building.effect}</Text>
                      </View>
                      <JXButton
                        size='mini'
                        onClick={() => setBuildingDetail(building)}
                      >
                        查看
                      </JXButton>
                    </View>
                  ))
                ) : (
                  <Text>暂无建筑</Text>
                )}
              </View>
              <JXSpace gap={10} className='menpai-actions'>
                <JXButton size='mini' onClick={() => setMemberVisible(true)}>
                  宗门成员
                </JXButton>
                <JXButton size='mini' onClick={() => setLogVisible(true)}>
                  宗门日志
                </JXButton>
                <JXButton
                  size='mini'
                  onClick={() => setTaskVisible(true)}
                  disabled={taskRemaining <= 0}
                >
                  宗门任务
                </JXButton>
                <JXButton size='mini' onClick={() => setExchangeVisible(true)}>
                  宗门兑换
                </JXButton>
                <JXButton
                  size='mini'
                  onClick={() => setContributeVisible(true)}
                  disabled={totalDays <= lastContributionDay}
                >
                  宗门贡献
                </JXButton>
                <JXButton
                  size='mini'
                  onClick={handleReceiveWelfare}
                  disabled={totalDays <= lastWelfareDay}
                >
                  领取俸禄
                </JXButton>
                <JXButton size='mini' onClick={handleExitSect}>
                  退出宗门
                </JXButton>
              </JXSpace>
            </JXSpace>
          </View>
        )}
      </JXSpace>
      <SectMemberModal
        visible={memberVisible}
        onClose={() => setMemberVisible(false)}
        members={joinedSect?.members ?? []}
        onOpenMember={handleOpenMember}
      />
      <SectLogModal
        visible={logVisible}
        onClose={() => setLogVisible(false)}
        logs={joinedSect?.logs ?? []}
      />
      <SectBuildingModal
        visible={!!buildingDetail}
        onClose={() => setBuildingDetail(null)}
        building={buildingDetail}
        lingshi={lingshi}
        sectRank={joinedSect?.rank ?? 0}
        buildingCosts={buildingCosts}
        onUnlock={handleUnlockBuilding}
        onRepair={handleRepairBuilding}
        onUpgrade={handleUpgradeBuilding}
      />
      <SectMemberDetailModal
        visible={!!memberDetail}
        onClose={() => setMemberDetail(null)}
        member={memberDetail}
      />
      <SectTaskModal
        visible={taskVisible}
        onClose={() => setTaskVisible(false)}
        taskList={taskList}
        taskDoneCount={taskDoneCount}
        maxTaskCount={maxTaskCount}
        taskRemaining={taskRemaining}
        roleLevel={roleLevel}
        onTakeTask={handleTakeTask}
      />
      <SectExchangeModal
        visible={exchangeVisible}
        onClose={() => setExchangeVisible(false)}
        exchangeList={exchangeList}
        reputation={joinedSect?.reputation ?? 0}
        onExchange={handleExchange}
      />
      <SectContributeModal
        visible={contributeVisible}
        onClose={() => setContributeVisible(false)}
        onConfirm={handleConfirmContribution}
        lingshi={lingshi}
        contributeAmount={contributeAmount}
        setContributeAmount={setContributeAmount}
        canContribute={totalDays > lastContributionDay}
      />
    </Container>
  );
}
