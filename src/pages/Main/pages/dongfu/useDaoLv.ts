import { random } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { JXToast } from '@/components';
import { REALM_ORDER } from '@/assets/const';
import { DAOLV_QUALITIES } from '@/config';
import {
  generateRandomName,
  getRealmTierIndex,
  getCurrentDate,
  safeNumber,
  getTotalAttr
} from '@/utils';
import chuwu from '@/utils/chuwu';
import useModal from '@/hooks/useModal';
import {
  ActorDataConfig,
  ActorDataConfigForZhanDou,
  DaoLvCandidate,
  DaoLvMarket,
  DaoLvQuality
} from '@/types';

export interface UseDaoLvParams {
  actor: ActorDataConfig | null | undefined;
  get: (key: string, defaultValue?: any) => any;
  set: (key: string, val: any) => void;
  stateDaolv: ReturnType<typeof useModal>['state'];
}

export function useDaoLv({ actor, get, set, stateDaolv }: UseDaoLvParams) {
  const daolv = useMemo(() => actor?.dongfu?.daolv ?? null, [actor]);

  const daolvMarket = useMemo(() => {
    const today = getCurrentDate();
    const raw = actor?.dongfu?.daolvMarket || null;
    if (!raw || raw.date !== today) {
      return {
        date: today,
        refreshCount: 0,
        candidates: [] as DaoLvCandidate[]
      };
    }
    return raw as DaoLvMarket;
  }, [actor]);

  const isTodayShuangXiu = useMemo(() => {
    const today = getCurrentDate();
    const last = actor?.dongfu?.shuangxiu?.date;
    return last === today;
  }, [actor]);

  const lv = useMemo(() => actor?.dongfu?.lv ?? 1, [actor]);

  const lingshi = chuwu.getLingshi();

  const calcBreakupLingshi = useCallback(
    (oldDaoLv: Partial<DaoLvCandidate> | null | undefined) => {
      const qIndex = oldDaoLv?.quality
        ? Math.max(0, DAOLV_QUALITIES.indexOf(oldDaoLv.quality))
        : 0;
      const tierIndex = getRealmTierIndex(oldDaoLv?.jingjie, REALM_ORDER);
      const attr = oldDaoLv?.attr || {};
      const qixue = safeNumber(attr.qixue);
      const gongji = safeNumber(attr.gongji);
      const fangyu = safeNumber(attr.fangyu);
      const sudu = safeNumber(attr.sudu);
      const baoji = safeNumber(attr.baoji);

      const baseScore =
        qixue * 0.08 + gongji * 15 + fangyu * 12 + sudu * 25 + baoji * 120;
      const tierMul = 1 + tierIndex * 0.2;
      const qualityMul = 1 + qIndex * 0.1;

      const scaled = baseScore * tierMul * qualityMul * 2 + 1000;
      return Math.round(scaled);
    },
    []
  );

  const calcDaoLvAttr = useCallback(
    (quality: DaoLvQuality): Partial<ActorDataConfigForZhanDou> => {
      const total = getTotalAttr(get);

      switch (quality) {
        case '一品':
          return { gongji: Math.max(1, Math.round(total.gongji * 0.06)) };
        case '二品':
          return {
            qixue: Math.max(10, Math.round(total.qixue * 0.05)),
            fangyu: Math.max(1, Math.round(total.fangyu * 0.08))
          };
        case '三品':
          return {
            fangyu: Math.max(1, Math.round(total.fangyu * 0.15)),
            gongji: Math.max(1, Math.round(total.gongji * 0.08))
          };
        case '四品':
          return {
            sudu: Math.max(1, Math.round(total.sudu * 0.12)),
            qixue: Math.max(10, Math.round(total.qixue * 0.07))
          };
        case '五品':
          return {
            baoji: Math.max(1, Math.round(total.baoji * 0.03 + 2)),
            gongji: Math.max(1, Math.round(total.gongji * 0.1))
          };
        case '六品':
          return {
            gongji: Math.max(1, Math.round(total.gongji * 0.12)),
            fangyu: Math.max(1, Math.round(total.fangyu * 0.2)),
            qixue: Math.max(10, Math.round(total.qixue * 0.08))
          };
        case '七品':
          return {
            qixue: Math.max(10, Math.round(total.qixue * 0.12)),
            sudu: Math.max(1, Math.round(total.sudu * 0.2)),
            gongji: Math.max(1, Math.round(total.gongji * 0.15)),
            baoji: Math.max(1, Math.round(total.baoji * 0.05 + 3))
          };
        case '八品':
          return {
            gongji: Math.max(1, Math.round(total.gongji * 0.2)),
            fangyu: Math.max(1, Math.round(total.fangyu * 0.3)),
            qixue: Math.max(10, Math.round(total.qixue * 0.15)),
            sudu: Math.max(1, Math.round(total.sudu * 0.25)),
            baoji: Math.max(1, Math.round(total.baoji * 0.08 + 5))
          };
        default:
          return {};
      }
    },
    [get]
  );

  const genDaoLvCandidates = useCallback((): DaoLvCandidate[] => {
    const weights = [50, 25, 12, 6, 3, 2, 1, 1];
    const picks: DaoLvQuality[] = [];
    while (picks.length < 3) {
      const sum = weights.reduce((a, b) => a + b, 0) || 1;
      const r = random(1, sum);
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < weights.length; i += 1) {
        acc += weights[i];
        if (r <= acc) {
          idx = i;
          break;
        }
      }
      const q = DAOLV_QUALITIES[idx] || DAOLV_QUALITIES[0];
      if (!picks.includes(q)) {
        picks.push(q);
      }
    }

    return picks.map((q) => {
      const qIndex = Math.max(0, DAOLV_QUALITIES.indexOf(q));
      const affinityBaseMin = 5 + qIndex * 4;
      const affinityBaseMax = 18 + qIndex * 8;
      const affinity = Math.min(100, random(affinityBaseMin, affinityBaseMax));
      return {
        name: generateRandomName(),
        quality: q,
        affinity,
        jingjie: get('jingjie'),
        jingjie1: get('jingjie1'),
        jingjie2: get('jingjie2'),
        attr: calcDaoLvAttr(q)
      };
    });
  }, [calcDaoLvAttr, get]);

  const openDaoLvModal = useCallback(() => {
    const today = getCurrentDate();
    const raw = get('dongfu').daolvMarket || null;
    if (!raw || raw.date !== today) {
      const freeCandidates = genDaoLvCandidates();
      set('dongfu.daolvMarket', {
        date: today,
        refreshCount: 0,
        candidates: freeCandidates
      });
    }
    stateDaolv.setVisiableModal(true);
  }, [genDaoLvCandidates, get, set, stateDaolv]);

  const handleRefreshDaoLv = useCallback(() => {
    const today = getCurrentDate();
    const raw = get('dongfu').daolvMarket || null;
    const refreshCount = raw && raw.date === today ? raw.refreshCount || 0 : 0;
    if (refreshCount >= 3) {
      JXToast('今日道侣刷新次数已用完').show();
      return;
    }
    if (lingshi < 3000) {
      JXToast('灵石不足').show();
      return;
    }

    chuwu.payLingshi(3000);
    const candidates = genDaoLvCandidates();
    set('dongfu.daolvMarket', {
      date: today,
      refreshCount: refreshCount + 1,
      candidates
    });
  }, [genDaoLvCandidates, get, lingshi, set]);

  const handleShuangXiu = useCallback(() => {
    const currentDaoLv = get('dongfu').daolv;
    if (!currentDaoLv) {
      JXToast('你还没有道侣').show();
      return;
    }
    const today = getCurrentDate();
    const last = get('dongfu').shuangxiu?.date;
    if (last === today) {
      JXToast('今日已双修过了').show();
      return;
    }
    const affinity = Math.max(
      0,
      Math.min(100, Number(currentDaoLv.affinity || 0))
    );
    const qIndex = Math.max(0, DAOLV_QUALITIES.indexOf(currentDaoLv.quality));
    const qMul = 1 + qIndex * 0.08;
    const base = 120 + lv * 80;
    const gain = Math.max(1, Math.round(base * (1 + affinity / 100) * qMul));
    set('xiuwei', get('xiuwei') + gain);
    set('dongfu.shuangxiu', { date: today });
    const affinityGain = random(1, Math.max(1, 2 + Math.floor(qIndex / 2)));
    set('dongfu.daolv', {
      ...currentDaoLv,
      affinity: Math.min(100, affinity + affinityGain)
    });
    JXToast(`双修有成，修为+${gain}，亲密度+${affinityGain}`).show();
  }, [get, lv, set]);

  return {
    daolv,
    daolvMarket,
    isTodayShuangXiu,
    calcBreakupLingshi,
    openDaoLvModal,
    handleRefreshDaoLv,
    handleShuangXiu
  };
}

export default useDaoLv;
