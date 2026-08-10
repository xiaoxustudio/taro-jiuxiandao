import { random, round } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { Button, View } from '@tarojs/components';
import {
  Container,
  ItemCounter,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import { REALM_ORDER } from '@/assets/const';
import { DAOLV_QUALITIES } from '@/config';
import {
  generateRandomName,
  getRealmTierIndex,
  getCurrentDate,
  getGradeColor,
  numberToChinese,
  safeNumber
} from '@/utils';
import chuwu from '@/utils/chuwu';
import { checkAchievements } from '@/utils/chengjiuHelper';
import {
  ActorDataConfigForZhanDou,
  CWType,
  DaoLvCandidate,
  DaoLvQuality
} from '@/types';
import useModal from '@/hooks/useModal';
import './index.less';

export default function Dongfu() {
  const { get, set, actor } = useActorController();

  const [blNum, setBlNum] = useState(0); // 补灵数量
  const { state: stateBuling } = useModal(); // 补灵
  const { state: stateShengjie } = useModal(); // 升阶
  const { state: stateDaolv } = useModal(); // 道侣
  const lv = useMemo(() => actor?.dongfu?.lv ?? 1, [actor]);
  const pjMemo = useMemo(() => `${numberToChinese(lv)}阶`, [lv]);

  const lingshi = useMemo(
    () => chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0,
    [get, set] // eslint-disable-line
    // 使其强制刷新
  );

  const needUpLingshi = useMemo(() => Math.ceil(lv ** 1.5 * 200), [lv]);

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
    return raw as {
      date: string;
      refreshCount: number;
      candidates: DaoLvCandidate[];
    };
  }, [actor]);

  const isTodayShuangXiu = useMemo(() => {
    const today = getCurrentDate();
    const last = actor?.dongfu?.shuangxiu?.date;
    return last === today;
  }, [actor]);

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
      const total = {
        qixue: safeNumber(get('qixue')) + safeNumber(get('addAttr.qixue')),
        gongji: safeNumber(get('gongji')) + safeNumber(get('addAttr.gongji')),
        fangyu: safeNumber(get('fangyu')) + safeNumber(get('addAttr.fangyu')),
        sudu: safeNumber(get('sudu')) + safeNumber(get('addAttr.sudu')),
        baoji: safeNumber(get('baoji')) + safeNumber(get('addAttr.baoji'))
      };

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

    chuwu.Remove({ name: '灵石', type: CWType.QT, num: 3000 });
    const candidates = genDaoLvCandidates();
    set('dongfu.daolvMarket', {
      date: today,
      refreshCount: refreshCount + 1,
      candidates
    });
  }, [genDaoLvCandidates, get, lingshi, set]);

  const handleSelectDaoLv = useCallback(
    (candidate: DaoLvCandidate) => {
      const old = get('dongfu').daolv as DaoLvCandidate | null;
      if (
        old &&
        old.name === candidate.name &&
        old.quality === candidate.quality
      ) {
        JXToast(`你与${candidate.name}已是道侣`).show();
        stateDaolv.setVisiableModal(false);
        return;
      }

      const doSelect = () => {
        const currentAddAttr = get('addAttr') as ActorDataConfigForZhanDou;
        const nextAddAttr: ActorDataConfigForZhanDou = { ...currentAddAttr };
        const applyDelta = (
          attr: Partial<ActorDataConfigForZhanDou> | undefined,
          dir: 1 | -1
        ) => {
          if (!attr) return;
          Object.keys(attr).forEach((k) => {
            const key = k as keyof ActorDataConfigForZhanDou;
            const v = attr[key];
            if (typeof v !== 'number') return;
            if (typeof nextAddAttr[key] !== 'number') return;
            nextAddAttr[key] += v * dir;
          });
        };
        applyDelta(old?.attr, -1);
        applyDelta(candidate.attr, 1);
        set('addAttr', nextAddAttr);
        set('dongfu.daolv', candidate);
        checkAchievements(get, set, actor);
        stateDaolv.setVisiableModal(false);
      };

      if (!old) {
        doSelect();
        JXToast(`你与${candidate.name}结为道侣`).show();
        return;
      }

      const breakupCost = calcBreakupLingshi(old);
      const hasLingshi =
        (chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0) >= breakupCost;
      if (!hasLingshi) {
        JXToast(`灵石不足，分开需要${breakupCost}灵石`).show();
        return;
      }

      const { close } = JXModal.show({
        title: '已有道侣',
        content: (
          <JXSpace direction='vertical' gap={6}>
            <Text>
              你当前已有道侣：
              <Text inline style={{ color: getGradeColor(old.quality) }}>
                {old.name}（{old.quality}）
              </Text>
            </Text>
            <Text>
              若要另结新道侣，需要先分开，并给予灵石安慰：
              <Text inline color='red'>
                {breakupCost}
              </Text>
            </Text>
            <Text>
              新道侣：
              <Text inline style={{ color: getGradeColor(candidate.quality) }}>
                {candidate.name}（{candidate.quality}）
              </Text>
            </Text>
          </JXSpace>
        ),
        okText: '分开并结为道侣',
        cancleText: '取消',
        onOk() {
          const enough =
            (chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0) >=
            breakupCost;
          if (!enough) {
            JXToast(`灵石不足，分开需要${breakupCost}灵石`).show();
            return;
          }
          chuwu.Remove({ name: '灵石', type: CWType.QT, num: breakupCost });
          doSelect();
          JXToast(
            `你与${old.name}分开（消耗灵石${breakupCost}），并与${candidate.name}结为道侣`
          ).show();
          close();
        },
        onCancel() {
          close();
        }
      });
    },
    [actor, calcBreakupLingshi, get, set, stateDaolv]
  );

  const handleDropDaoLv = useCallback(() => {
    const old = get('dongfu').daolv as DaoLvCandidate | null;
    if (!old) {
      JXToast('你还没有道侣').show();
      return;
    }

    const breakupCost = calcBreakupLingshi(old);
    const { close } = JXModal.show({
      title: '分开',
      content: (
        <JXSpace direction='vertical' gap={6}>
          <Text>
            道侣：
            <Text inline style={{ color: getGradeColor(old.quality) }}>
              {old.name}（{old.quality}）
            </Text>
          </Text>
          <Text>
            分开需要给予灵石安慰：
            <Text inline color='red'>
              {breakupCost}
            </Text>
          </Text>
        </JXSpace>
      ),
      okText: '确认分开',
      cancleText: '取消',
      onOk() {
        const enough =
          (chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0) >=
          breakupCost;
        if (!enough) {
          JXToast(`灵石不足，分开需要${breakupCost}灵石`).show();
          return;
        }

        chuwu.Remove({ name: '灵石', type: CWType.QT, num: breakupCost });

        const currentAddAttr = get('addAttr') as ActorDataConfigForZhanDou;
        const nextAddAttr: ActorDataConfigForZhanDou = { ...currentAddAttr };
        const applyDelta = (
          attr: Partial<ActorDataConfigForZhanDou> | undefined,
          dir: 1 | -1
        ) => {
          if (!attr) return;
          Object.keys(attr).forEach((k) => {
            const key = k as keyof ActorDataConfigForZhanDou;
            const v = attr[key];
            if (typeof v !== 'number') return;
            if (typeof nextAddAttr[key] !== 'number') return;
            nextAddAttr[key] += v * dir;
          });
        };
        applyDelta(old.attr, -1);
        set('addAttr', nextAddAttr);
        set('dongfu.daolv', null);
        JXToast(`你与${old.name}分开（消耗灵石${breakupCost}）`).show();
        close();
      },
      onCancel() {
        close();
      }
    });
  }, [calcBreakupLingshi, get, set]);

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

  /* 补灵 */
  const getTransformRate = useMemo(() => lv ** 0.6 * 0.03, [lv]);
  const getTransformRateMemo = useMemo(
    () => `${getTransformRate * 100}%`,
    [getTransformRate]
  ); // 转化率百分比
  const needLingshiNum = useMemo(
    () => round(Math.floor(blNum * getTransformRate)),
    [blNum, getTransformRate]
  );

  const handleOk = useCallback(() => {
    if (!blNum) {
      JXToast('请加注数量').show();
      return;
    }
    if (lingshi >= blNum) {
      chuwu.Remove({ name: '灵石', type: CWType.QT, num: blNum });
      set(
        'dongfu.lingchi',
        Math.floor(blNum / 10) + needLingshiNum + get('dongfu.lingchi')
      );
    } else {
      JXToast('灵石不足').show();
      return;
    }
    stateBuling.setVisiableModal(false);
  }, [blNum, get, lingshi, needLingshiNum, set, stateBuling]);

  const handleShengjie = useCallback(() => {
    // 每10阶段需要一个升灵石
    if (lv % 10 === 0) {
      if (chuwu.Get({ name: '升灵石', type: CWType.QT })?.num) {
        chuwu.Remove({ name: '升灵石', type: CWType.QT, num: 1 });
        set('dongfu.lv', lv + 1);
      } else {
        JXToast('升灵石不足').show();
        return;
      }
    } else if (lingshi >= needUpLingshi) {
      chuwu.Remove({ name: '灵石', type: CWType.QT, num: needUpLingshi });
      set('dongfu.lv', lv + 1);
    } else {
      JXToast('灵石不足').show();
      return;
    }
  }, [lingshi, lv, needUpLingshi, set]);

  return (
    <Container
      title='洞府'
      desc='修仙之人，天地为家！群山万壑之中，云海翻涌，了无人烟！天光倾泻，鸥鹤成云！洞府之外，小兽嬉戏打闹，一抹倩影在洞府外等待你的归来……'
    >
      <JXSpace direction='vertical' gap={5} style={{ padding: '0 10px' }}>
        <Text>
          洞府品阶：{pjMemo}({get('dongfu').lv})
        </Text>
        <Text>灵池灵气：{get('dongfu').lingchi}</Text>
      </JXSpace>
      <JXSpace style={{ margin: '10px 0', padding: '0 10px' }}>
        {daolv ? (
          <Text>
            道侣：
            <Text inline style={{ color: getGradeColor(daolv.quality) }}>
              {daolv.name}（{daolv.quality}
              {daolv.jingjie
                ? `，${daolv.jingjie}${daolv.jingjie1 || ''}${
                    daolv.jingjie2 || ''
                  }`
                : ''}
              ）
            </Text>
            ，亲密度：{daolv.affinity}
          </Text>
        ) : (
          <Text>{get('daohao')} 还未拥有道侣</Text>
        )}
      </JXSpace>
      <JXSpace direction='vertical' gap={5}>
        <Button
          style={{ width: '100%' }}
          onClick={() => stateBuling.setVisiableModal(true)}
        >
          补灵
        </Button>
        <Button
          style={{ width: '100%' }}
          onClick={() => stateShengjie.setVisiableModal(true)}
        >
          升阶
        </Button>
        <Button
          style={{ width: '100%' }}
          onClick={handleShuangXiu}
          disabled={!daolv || isTodayShuangXiu}
        >
          双修
        </Button>
        <Button
          style={{ width: '100%' }}
          onClick={handleDropDaoLv}
          disabled={!daolv}
        >
          弃之
        </Button>
        <Button style={{ width: '100%' }} onClick={openDaoLvModal}>
          道侣
        </Button>
      </JXSpace>
      {/* 贡献 */}
      <JXModal
        controller={stateBuling}
        title='补灵'
        afterClose={() => {
          setBlNum(0);
        }}
        onOk={handleOk}
        onCancel={() => stateBuling.setVisiableModal(false)}
      >
        <JXSpace direction='vertical'>
          <Text>灵石：{lingshi}</Text>
          <Text>
            想要贡献数量：
            <View>
              {blNum} ==&gt; {Math.floor(blNum / 10)}灵气
            </View>
          </Text>
          <hr />
          <ItemCounter count={blNum} setCount={setBlNum} />
          <Text>
            注入后可额外获得：
            <View>
              {getTransformRateMemo}灵气（{needLingshiNum}）
            </View>
          </Text>
          <hr />
          <Text>10灵石=1灵气</Text>
          <Text>升级洞府可提升更多额外灵气率</Text>
        </JXSpace>
      </JXModal>
      {/* 升阶 */}
      <JXModal
        controller={stateShengjie}
        title='升阶'
        afterClose={() => {}}
        onOk={handleShengjie}
        okText='确认升阶'
        onCancel={() => stateShengjie.setVisiableModal(false)}
      >
        <View>
          当前：{pjMemo}({get('dongfu').lv})
        </View>
        <View>
          升阶后：{pjMemo}({get('dongfu').lv + 1})
        </View>
        <View>
          需要灵石：
          <Text color={lingshi >= needUpLingshi ? 'green' : 'red'} inline>
            {needUpLingshi} ({lingshi})
          </Text>
        </View>
      </JXModal>
      {/* 道侣 */}
      <JXModal
        controller={stateDaolv}
        title='道侣'
        disableOk
        onCancel={() => stateDaolv.setVisiableModal(false)}
      >
        <JXSpace direction='vertical' gap={8}>
          <Text>
            今日刷新：{daolvMarket.refreshCount}/3（每次消耗3000灵石）
          </Text>
          <Text>灵石：{lingshi}</Text>
          <Button
            style={{ width: '100%' }}
            onClick={handleRefreshDaoLv}
            disabled={daolvMarket.refreshCount >= 3}
          >
            刷新道侣
          </Button>
          <JXSpace direction='vertical' gap={6}>
            {daolvMarket.candidates?.length ? (
              daolvMarket.candidates.map((c) => (
                <View key={`${c.name}-${c.quality}`}>
                  <JXSpace direction='vertical' gap={4}>
                    <Text>
                      <Text inline style={{ color: getGradeColor(c.quality) }}>
                        {c.name}（{c.quality}
                        {c.jingjie
                          ? `，${c.jingjie}${c.jingjie1 || ''}${
                              c.jingjie2 || ''
                            }`
                          : ''}
                        ）
                      </Text>
                      ，亲密度：{c.affinity}
                    </Text>
                    <Text>
                      属性：攻{c.attr.gongji || 0} 防{c.attr.fangyu || 0} 血
                      {c.attr.qixue || 0} 速{c.attr.sudu || 0} 暴
                      {c.attr.baoji || 0}
                    </Text>
                    <Button
                      style={{ width: '100%' }}
                      onClick={() => handleSelectDaoLv(c)}
                    >
                      结为道侣
                    </Button>
                    <hr />
                  </JXSpace>
                </View>
              ))
            ) : (
              <Text>暂无候选道侣，请先刷新</Text>
            )}
          </JXSpace>
        </JXSpace>
      </JXModal>
    </Container>
  );
}
