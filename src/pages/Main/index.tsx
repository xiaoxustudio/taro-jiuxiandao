import { cloneDeep, round } from 'lodash-es';
import { Image } from 'antd-mobile';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import title from '@/assets/logo.png';
import {
  Box,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Paragraph,
  Text
} from '@/components';
import JXGrid from '@/components/Grid';
import TujianModal from '@/components/TujianModal';
import useActorController from '@/hooks/useActorController';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import {
  chineseToNumber,
  navigateTo,
  numberToChinese,
  TimeArray,
  formatXiuxianCalendar
} from '@/utils';
import {
  getJingJieMaxDep,
  getLingQiForJingJie,
  getLingQiToNumber,
  getLunhuiBuffs,
  JingJie2Transform,
  JingJieTransform,
  LUNHUI_BUFF_PER_COUNT
} from '@/utils/actor';
import TpData from '@/assets/tp.json';
import danfangData from '@/assets/danfang.json';
import { ActorDataConfig, CWType } from '@/types';
import { GongFaType } from '@/types/gongfa';
import { dyGrades, XIUXIAN_TIME_SCALE_DEFAULT } from '@/assets/const';
import chuwu from '@/utils/chuwu';
import { createDefaultLingShou } from '@/utils/lingshou';
import {
  checkAchievements,
  checkLunhuiAchievements
} from '@/utils/chengjiuHelper';
import styles from './index.module.less';

function Main() {
  const { get, set, actor } = useActorController();
  const rebirthPromptedRef = useRef(false);
  const [tujianVisible, setTujianVisible] = useState(false);
  useEffect(() => {
    const pages =
      typeof Taro.getCurrentPages === 'function' ? Taro.getCurrentPages() : [];
    if (pages.length > 1) {
      Taro.reLaunch({ url: '/pages/Main/index' });
    }
  }, []);
  useEffect(() => {
    const startAt = get('xiuxianStartAt');
    if (!startAt) {
      const base = get('time1') || Date.now();
      set('xiuxianStartAt', base);
    }
    const scale = get('xiuxianTimeScale');
    if (!scale) {
      set('xiuxianTimeScale', XIUXIAN_TIME_SCALE_DEFAULT);
    }
  }, [get, set, actor]);

  useEffect(() => {
    const lastTime = get('time1');
    if (!lastTime) return;
    const elapsedHours = (Date.now() - lastTime) / TimeArray.Map.hour;
    if (elapsedHours < 1) return;

    const maxShenshi = get('max_shenshi') || 0;
    const currentShenshi = get('shenshi') || 0;
    const shenshiRecover = Math.round(
      Math.min(maxShenshi - currentShenshi, (maxShenshi * elapsedHours) / 6)
    );

    const xiulianData = get('xiulian') as { time: number } | null;
    const daysElapsed = Math.floor(elapsedHours / 24);
    const shouyuanCost = daysElapsed;

    const xiulianOfflineZhoutian = xiulianData
      ? new TimeArray(Date.now() - xiulianData.time).toZhouTian()
      : 0;

    const contentLines = [
      <Text key='hours'>你离开了 {Math.round(elapsedHours)} 小时</Text>
    ];

    if (shenshiRecover > 0) {
      set('shenshi', currentShenshi + shenshiRecover);
      set('shenshiTime', Date.now());
      contentLines.push(
        <Text key='shenshi'>神识自动恢复：{shenshiRecover} 点</Text>
      );
    }

    if (shouyuanCost > 0) {
      const curShouyuan = Math.max(0, (get('shouyuan') || 0) - shouyuanCost);
      set('shouyuan', curShouyuan);
      const newTime1 = lastTime + daysElapsed * TimeArray.Map.hour * 24;
      set('time1', Math.round(newTime1));
      contentLines.push(
        <Text key='shouyuan'>寿元消耗：{shouyuanCost} 天</Text>
      );
    }

    if (xiulianData && xiulianOfflineZhoutian > 0.01) {
      contentLines.push(
        <Text key='xiulian'>
          离线修炼：约 {xiulianOfflineZhoutian.toFixed(1)} 小周天
        </Text>
      );
    }

    if (contentLines.length > 1) {
      JXModal.show({
        title: '离线收益',
        content: <JXSpace direction='vertical'>{contentLines}</JXSpace>,
        closeOnMaskClick: true,
        disableCancle: true,
        disableOk: true
      });
    }
  }, [get, set]); // eslint-disable-line react-hooks/exhaustive-deps

  const xiulian = useMemo(() => actor?.xiulian ?? 0, [actor]);
  const canRed = useMemo(
    () => get('xiuwei') >= get('max_xiuwei'),
    [get, actor] //eslint-disable-line
  );

  const operaterOptions: { name: string; click(): void; disabled?: boolean }[] =
    [
      {
        name: '试炼',
        click() {
          navigateTo('Main/pages/shilian-list/index');
        }
      },
      {
        name: '炼丹',
        click() {
          navigateTo('Main/pages/liandan/index');
        }
      },
      {
        name: '仙缘',
        click() {
          navigateTo('Main/pages/xianyuan/index');
        }
      },
      {
        name: '宗门',
        click() {
          navigateTo('Main/pages/zongmen/index');
        }
      },
      {
        name: '炼器',
        click() {
          navigateTo('Main/pages/lianqi/index');
        }
      },
      {
        name: '法宝',
        click() {
          navigateTo('Main/pages/fabao/index');
        }
      },
      {
        name: '升阶',
        click() {
          if (get('xiuwei') < get('max_xiuwei')) {
            JXToast('修为不足，无法升阶！').show();
            return;
          }
          if (get('jingjie2') === '大圆满') {
            JXToast(`目前已达到大圆满，请寻找机缘突破！`).show();
            return;
          }
          const curLv = get('lv');
          const newLv = curLv + 1;
          const jjBase = getLingQiForJingJie();
          const jjIdx = getLingQiToNumber();
          const logFactor = 1 + Math.log(Math.max(1, newLv)) / 12;
          const calc = Math.ceil(jjBase * (1 + jjIdx * 0.3) * logFactor);
          const lv1 = newLv / 20 + 1;

          const calcXiuwei = Math.ceil(get('xiuwei') - get('max_xiuwei'));
          const nextJingjie2 = JingJie2Transform(get('jingjie2'));
          let nextJingjie1 = get('jingjie1');
          if (nextJingjie2 === '大圆满') {
            const currentJ1Num = chineseToNumber(
              (get('jingjie1') as string).replace('阶', '')
            );
            const maxDep = getJingJieMaxDep();
            const nextJ1 = Math.min(maxDep, Math.max(1, currentJ1Num + 1));
            nextJingjie1 = `${numberToChinese(nextJ1)}阶`;
          }
          const calcSudu =
            get('jingjie') !== '练气'
              ? Math.round(get('sudu') * (1 + 0.003 * lv1))
              : get('sudu');
          const calcGongji = Math.round(get('gongji') * (1 + 0.006 * lv1));
          const calcQixue = Math.round(get('qixue') * (1 + 0.01 * lv1));
          const calcFashu = Math.round(get('fashu') * (1 + 0.004 * lv1));
          const calcFangyu = Math.round(get('fangyu') * (1 + 0.005 * lv1));
          const calcBaoji = Math.min(
            80,
            Math.round((get('baoji') || 0) + 0.1 * lv1)
          );

          JXModal.confirm({
            title: '升阶确认',
            content: (
              <JXSpace direction='vertical'>
                <Text>修为已满，是否进行升阶？</Text>
                <Text>升阶后等级：Lv.{newLv}</Text>
                <Text>
                  升阶后境界：{nextJingjie1}
                  {nextJingjie2}
                </Text>
              </JXSpace>
            ),
            onConfirm() {
              const updates = {
                lv: newLv,
                xiuwei: calcXiuwei,
                max_xiuwei: calc,
                sudu: calcSudu,
                jingjie2: nextJingjie2,
                jingjie1: nextJingjie1,
                gongji: calcGongji,
                qixue: calcQixue,
                fashu: calcFashu,
                fangyu: calcFangyu,
                baoji: calcBaoji
              };
              useActorStore.setState((state) => {
                const { current: curr } = useStore.getState();
                const currentActor = state.actors[curr];
                if (!currentActor) return state;
                return {
                  ...state,
                  actors: {
                    ...state.actors,
                    [curr]: { ...currentActor, ...updates }
                  }
                };
              });
              checkAchievements(get, set, actor);
              JXToast().show(
                `目前气血：${calcQixue}，攻击：${calcGongji}，法术：${calcFashu}`
              );
            }
          });
        }
      },
      {
        name: '功法',
        click() {
          navigateTo('Main/pages/gongfa/index');
        }
      },
      {
        name: '突破',
        click() {
          const jingjie = get('jingjie');
          const jingjie2 = get('jingjie2');
          const tpdata = TpData[jingjie as keyof typeof TpData];
          if (jingjie2 === '大圆满') {
            if (jingjie === '大乘') {
              const count = (get('lunhuiCount') as number) || 0;
              JXModal.confirm({
                title: '天道感应·轮回',
                content: (
                  <JXSpace direction='vertical'>
                    <Text>大乘已至巅峰，感应天道，可轮回重修！</Text>
                    <Text>轮回后将重置为练气初期，但将获得永久轮回印记：</Text>
                    <Box style={{ height: 4 }} />
                    <Text>
                      • 修炼倍率 +{LUNHUI_BUFF_PER_COUNT.xiulianbeilvBonus * 10}
                      %
                    </Text>
                    <Text>
                      • 神识上限 +{LUNHUI_BUFF_PER_COUNT.maxShenshiBonus}
                    </Text>
                    <Text>
                      • 寿元上限 +{LUNHUI_BUFF_PER_COUNT.shouyuanBonus}
                    </Text>
                    <Text>
                      • 初始修为 +{LUNHUI_BUFF_PER_COUNT.initialXiuweiBonus}
                    </Text>
                    <Text>
                      • 全属性加成 +{LUNHUI_BUFF_PER_COUNT.shangxianBonus}%
                    </Text>
                    <Box style={{ height: 4 }} />
                    <Text color='orange'>当前轮回次数：{count}</Text>
                    <Text color='orange'>轮回后次数：{count + 1}</Text>
                  </JXSpace>
                ),
                onConfirm() {
                  const daohao = get('daohao');
                  const linggen = get('linggen');
                  const zhongzu = get('zhongzu');
                  const xianyuan = get('xianyuan') || 0;
                  const newLunhuiCount =
                    ((get('lunhuiCount') as number) || 0) + 1;
                  const lunhuiBuffs = getLunhuiBuffs(newLunhuiCount);
                  const maxShenshiBonus = lunhuiBuffs?.maxShenshiBonus || 0;
                  const shouyuanBonus = lunhuiBuffs?.shouyuanBonus || 0;
                  const initialXiuweiBonus =
                    lunhuiBuffs?.initialXiuweiBonus || 0;
                  const xiulianbeilvBonus = lunhuiBuffs?.xiulianbeilvBonus || 0;
                  const nextActor = {
                    ...actor,
                    lv: 1,
                    xiuwei: initialXiuweiBonus,
                    max_xiuwei: 500,
                    shenshi: 100 + maxShenshiBonus,
                    max_shenshi: 100 + maxShenshiBonus,
                    shouyuan: 100 + shouyuanBonus,
                    max_shouyuan: 100 + shouyuanBonus,
                    jingjie: '练气',
                    jingjie1: '一阶',
                    jingjie2: '初期',
                    qixue: 1200,
                    gongji: 80,
                    fangyu: 40,
                    baoji: 2,
                    sudu: 20,
                    fashu: 0,
                    xiulianbeilv: 10 + xiulianbeilvBonus,
                    addAttr: {
                      qixue: 0,
                      gongji: 0,
                      fangyu: 0,
                      baoji: 0,
                      sudu: 0,
                      fashu: 0
                    },
                    fabao: {
                      手持武器: null,
                      头戴战盔: null,
                      身穿战甲: null,
                      腰带护具: null,
                      饰品加持: null,
                      鞋子护腿: null,
                      魂器镇魂: null,
                      本名法宝: null
                    },
                    cw: {
                      fb: [],
                      dy: [],
                      qt: [],
                      max: 30 + newLunhuiCount * 20
                    },
                    time1: Date.now(),
                    xiuxianStartAt: Date.now(),
                    shenshiTime: Date.now(),
                    xiulian: null,
                    qiandao: { count: 0, last: '', time: '', streak: 0 },
                    dongfu: {
                      lingchi: 1000,
                      lv: 1,
                      daolv: null,
                      daolvMarket: null,
                      shuangxiu: null
                    },
                    zd: { time: 0, df: '' },
                    liandan: {
                      chenghao: '丹徒',
                      exp: 0,
                      max_exp: 100,
                      danlu: null,
                      danyao: null,
                      danyun: 0,
                      time: 0,
                      completeTime: 0
                    },
                    danfang: [],
                    gongfa: { ls: [], current: null },
                    yaoyuan: {
                      lv: 1,
                      plots: Array.from({ length: 2 }, (_, i) => ({
                        id: i + 1,
                        lv: 1,
                        unlocked: true,
                        seed: null
                      })),
                      seeds: []
                    },
                    xianyuan: xianyuan + 30,
                    linggen,
                    zhongzu,
                    lunhuiCount: newLunhuiCount,
                    chengjiu: get('chengjiu') || undefined,
                    battleCount: get('battleCount') || 0,
                    winStreak: get('winStreak') || 0
                  } as ActorDataConfig;
                  useActorStore.getState().set(daohao, nextActor);
                  useStore.getState().set(daohao);
                  checkLunhuiAchievements(
                    get,
                    set,
                    nextActor as ActorDataConfig
                  );
                  JXToast(`轮回成功！当前第 ${newLunhuiCount} 世`).show();
                  setTimeout(
                    () => navigateTo('Main/index', { all: true }),
                    800
                  );
                }
              });
              return;
            }
            if (!tpdata) {
              JXToast(`天道压制，无法突破更高境界！`).show();
              return;
            }
            const realmToGrade: Record<string, string> = {
              练气: '三品',
              筑基: '四品',
              结丹: '五品',
              元婴: '六品',
              化神: '七品',
              返虚: '八品',
              合体: '八品'
            };
            const needGrade = realmToGrade[get('jingjie') as string] || '八品';
            const needGradeIdx = (dyGrades as readonly string[]).indexOf(
              needGrade
            );
            const cw = get('cw');
            const dyList = (cw?.dy || []) as { name: string; itype?: string }[];
            const matchedPill = dyList.find((p) => {
              let pGrade: string = p.itype || '';
              if (
                !pGrade ||
                !(dyGrades as readonly string[]).includes(pGrade)
              ) {
                const entry = (danfangData as Record<string, any>)
                  ? Object.values(danfangData as Record<string, any>).find(
                      (v: any) => v.name === p.name
                    )
                  : null;
                pGrade = (entry as any)?.itype || '';
              }
              const pIdx = (dyGrades as readonly string[]).indexOf(pGrade);
              return pIdx >= needGradeIdx;
            });
            if (!matchedPill) {
              JXToast(`缺少${needGrade}以上丹药，请先炼制对应丹药！`).show();
              return;
            }
            JXModal.confirm({
              title: '突破确认',
              content: (
                <JXSpace direction='vertical'>
                  <Text>即将突破至下一大境界，需消耗丹药：</Text>
                  <Text>{matchedPill.name} × 1</Text>
                </JXSpace>
              ),
              onConfirm() {
                chuwu.Remove({
                  name: matchedPill.name,
                  type: CWType.DY,
                  num: 1
                });
                const jj = JingJieTransform(get('jingjie'));
                const prevJingjie = get('jingjie');
                set('jingjie1', '一阶');
                set('jingjie2', '初期');
                set('jingjie', jj);
                if (
                  jj === '筑基' &&
                  prevJingjie === '练气' &&
                  !get('lingShou')
                ) {
                  set('lingShou', createDefaultLingShou(0));
                  JXToast('突破筑基，灵兽感应降临！').show();
                }
                const lv1 = get('lv') / 20 + 1;
                const calcGongji = Math.round(
                  get('gongji') * (1 + 0.08 * lv1) + tpdata.add.gongji * 0.5
                );
                const calcQixue = Math.round(
                  get('qixue') * (1 + 0.08 * lv1) + tpdata.add.qixue * 0.5
                );
                const calcFashu = Math.round(
                  get('fashu') * (1 + 0.08 * lv1) +
                    (tpdata.add.fashu ?? 0) * 0.5
                );
                const calcFangyu = Math.round(
                  get('fangyu') * (1 + 0.08 * lv1) +
                    ((tpdata as any).add.fangyu || 0) * 0.5
                );
                const calcBaoji = Math.min(
                  80,
                  Math.round((get('baoji') || 0) + 0.1 * lv1)
                );
                set('gongji', calcGongji);
                set('qixue', calcQixue);
                set('fashu', calcFashu);
                set('fangyu', calcFangyu);
                set('baoji', calcBaoji);
                const addShouyuan = get('max_shouyuan') + tpdata.add.shouyuan;
                set('max_shouyuan', addShouyuan);
                const newMax = (cw?.max || 30) + 10;
                set('cw', { ...cw, max: newMax });
                checkAchievements(
                  get,
                  set,
                  useActorStore.getState().actors[
                    useStore.getState().current
                  ] || actor
                );
                JXToast(
                  `突破至：${jj}，寿元：${addShouyuan}，储物上限：${newMax}\n气血：${calcQixue}，攻击：${calcGongji}，法术：${calcFashu}`
                ).show();
              }
            });
          } else {
            JXToast(`未达到大圆满，请先提升小境界！`).show();
          }
        }
      },
      {
        name: `法术(${get('fashu')})`,
        click() {
          const fashuTotal = get('fashu') + get('addAttr.fashu');
          JXModal.alert({
            title: '法术',
            content: (
              <JXSpace direction='vertical'>
                <Text>法术强度：{get('fashu')}</Text>
                <Text>加成（含装备）：{fashuTotal}</Text>
                <Box style={{ height: 4 }} />
                <Text size={14} bold>
                  法术效果
                </Text>
                <Text>战斗中每击附加法术伤害：{fashuTotal * 0.3}</Text>
              </JXSpace>
            ),
            confirmText: '知道了'
          });
        }
      },
      {
        name: '灵兽',
        click() {
          navigateTo('Main/pages/lingshou/index');
        }
      }
    ];
  const operaterOptions2: {
    name: string;
    click(): void;
    disabled?: boolean;
  }[] = [
    {
      name: '坊市',
      click() {
        navigateTo('Main/pages/fangshi/index');
      }
    },
    {
      name: '储物',
      click() {
        navigateTo('Main/pages/chuwu/index');
      }
    },

    {
      name: '药园',
      click() {
        navigateTo('Main/pages/yaoyuan/index');
      }
    },
    {
      name: '洞府',
      click() {
        navigateTo('Main/pages/dongfu/index');
      }
    },
    {
      name: '成就',
      click() {
        navigateTo('Main/pages/chengjiu/index');
      }
    },
    {
      name: '图鉴',
      click() {
        setTujianVisible(true);
      }
    }
  ];

  // 开始修炼
  const handleXiuLian = useCallback(() => {
    if (xiulian) return;
    set('xiulian', { time: Date.now() });
    set('shenshi', get('shenshi') - 10);
    JXToast('开始修炼！').show();
  }, [get, set, xiulian]);

  // 打开修炼弹窗
  const handleOpenXiuLian = () => {
    const needAddXiuWeiJJ = getLingQiForJingJie();

    const zhongzuRates: Record<string, number> = {
      人: 0.3,
      魔: 0.5,
      妖: 0.15,
      鬼: 0.25,
      灵: 0.6
    };
    const zhongzuRate = zhongzuRates[get('zhongzu') as string] ?? 0;
    const linggenRates: Record<string, number> = {
      金: 0.15,
      木: 0.2,
      水: 0.12,
      火: 0.18,
      土: 0.1,
      风: 0.22,
      雷: 0.25
    };
    const linggenRate = linggenRates[get('linggen') as string] ?? 0;

    const lvRate = round((get('lv') / 10) * 0.05, 2);

    const jjRate = 1 + (getLingQiToNumber() - 1) * 0.15;

    const gongfaCurrent = get('gongfa.current') as GongFaType | null;
    const gongfaXL =
      typeof gongfaCurrent?.xl === 'number'
        ? gongfaCurrent.xl
        : Number((gongfaCurrent?.xl || '').toString().replace('%', '')) || 0;
    const gongfaRate = Math.max(0, gongfaXL) / 100;
    const xlBeilv = ((get('xiulianbeilv') as number) || 10) / 10;

    const dfLingchi = get('dongfu') ? get('dongfu').lingchi : 0;

    const zhoutian = new TimeArray(
      Date.now() - (xiulian ? xiulian.time : Date.now())
    ).toZhouTian();

    const basePerHour = needAddXiuWeiJJ * 0.01;
    const shouldGetXiu = basePerHour * 24 * jjRate * xlBeilv;

    const zhotianByzhoutian =
      Math.round(shouldGetXiu) * (0.5 + zhongzuRate + linggenRate);

    const baseXiu = round(zhotianByzhoutian * zhoutian * (1 + gongfaRate), 2);
    const lingchiPerZhouTian = 24;
    const consumedLingchi = Math.min(
      dfLingchi,
      Math.floor(zhoutian * lingchiPerZhouTian)
    );
    const calcXiu = round(baseXiu + consumedLingchi, 2);
    const lingShiPerZhouTian = (getLingQiToNumber() + 1) * 24;
    const lingShiGain = Math.floor(zhoutian * lingShiPerZhouTian);

    const content = (
      <>
        等级增益系数：{lvRate}
        <br />
        境界增益系数：{jjRate}
        <br />
        修炼倍率：{xlBeilv.toFixed(2)}x
        <br />
        功法修炼增益：{(gongfaRate * 100).toFixed(2)}%
        <br />
        洞府增益：{consumedLingchi}/{dfLingchi}
        <br />
        已修炼小周天：{zhoutian.toFixed(2)}
        <br />
        总获取修为合计：{calcXiu.toFixed(2)}
        <br />
        灵石产出：+{lingShiGain}
      </>
    );
    const c = JXModal.show({
      title: '修炼',
      content,
      disableCancle: true,
      okText: '收功',
      onOk() {
        c.close();
        set('xiuwei', round(get('xiuwei') + calcXiu, 2));
        set('dongfu.lingchi', Math.max(0, dfLingchi - consumedLingchi));
        if (lingShiGain > 0) {
          chuwu.Add({
            name: '灵石',
            type: CWType.QT,
            isPile: true,
            num: lingShiGain
          });
        }
        set('xiulian', null);
      }
    });
  };

  const freshGet = useCallback((key: string) => {
    const { actors } = useActorStore.getState();
    const { current: curr } = useStore.getState();
    const ac = actors[curr];
    if (!ac) return null;
    return key
      .split('.')
      .reduce((obj: any, part: string) => obj?.[part] ?? null, ac);
  }, []);

  const rawSet = useCallback((key: string, val: any) => {
    const storeActor = useActorStore.getState();
    const curr = useStore.getState().current;
    const ac = storeActor.actors[curr];
    if (!ac) return;
    const updated = cloneDeep(ac);
    const parts = key.split('.');
    let target: any = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = val;
    useActorStore.setState((state) => ({
      ...state,
      actors: { ...state.actors, [curr]: updated }
    }));
  }, []);

  useEffect(() => {
    const tick = () => {
      const maxShenShi = freshGet('max_shenshi') || 0;
      const currentShenshi = freshGet('shenshi') || 0;
      if (currentShenshi < maxShenShi) {
        const passiveRecovery = Math.max(1, Math.round(maxShenShi / 360));
        const newShenshi = Math.min(
          maxShenShi,
          currentShenshi + passiveRecovery
        );
        rawSet('shenshi', newShenshi);
        rawSet('shenshiTime', Date.now());
      }

      const time1 = freshGet('time1') || Date.now();
      const elapsedHours = (Date.now() - time1) / TimeArray.Map.hour;
      const daysElapsed = Math.floor(elapsedHours / 24);
      if (daysElapsed >= 1) {
        const advance = time1 + daysElapsed * TimeArray.Map.hour * 24;
        rawSet('time1', Math.round(advance));
        const maxShouyuan = freshGet('max_shouyuan') || 0;
        let currentShouyuan = freshGet('shouyuan') || 0;
        for (let d = 0; d < daysElapsed && currentShouyuan > 0; d++) {
          currentShouyuan = Math.round(currentShouyuan - 1);
        }
        const newShouyuan = Math.max(0, Math.min(currentShouyuan, maxShouyuan));
        rawSet('shouyuan', newShouyuan);
        if (
          newShouyuan <= 0 &&
          (freshGet('shouyuan') || 0) <= 0 &&
          !rebirthPromptedRef.current
        ) {
          rebirthPromptedRef.current = true;
          JXModal.show({
            visible: true,
            title: '重生',
            closeOnMaskClick: false,
            content: (
              <JXSpace direction='vertical' gap={10}>
                <Text>你的寿元已到极限，修仙之路无法继续前进...</Text>
                <Text>请选择重生以继续你的修仙之旅</Text>
              </JXSpace>
            ),
            disableCancle: true,
            okText: '重生',
            onOk() {
              navigateTo('Main/pages/rebirth/index', { replace: true });
            },
            onCancel() {}
          });
        }
      }
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [freshGet, rawSet]);

  return (
    <View>
      <JXSpace className={styles.MainBox} direction='vertical'>
        <JXSpace className={styles.Title}>
          <Image
            width={120}
            src={title}
            onClick={() => navigateTo('Main/pages/actor-info/index')}
          />
        </JXSpace>
        {/* 属性 */}
        <JXSpace className={styles.Attr} direction='vertical'>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              道号：
            </Text>
            {get('daohao')}
            {((get('lunhuiCount') as number) || 0) > 0 && (
              <Text color='gold' size={12} inline>
                {' '}
                轮回第{get('lunhuiCount')}世
              </Text>
            )}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              修为：
            </Text>
            {get('xiuwei')}/{get('max_xiuwei')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              神识：
            </Text>
            {get('shenshi')}/{get('max_shenshi')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              寿元：
            </Text>
            {get('shouyuan')}/{get('max_shouyuan')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              境界：
            </Text>
            {get('jingjie')}
            {get('jingjie1')}
            {get('jingjie2')}
          </Text>
        </JXSpace>
        {/* 修炼 */}
        <JXSpace className={styles.XiuLianBox} center>
          {!xiulian && (
            <JXButton size='mini' transparent onClick={handleXiuLian}>
              <Text textShadow>修炼：</Text>
            </JXButton>
          )}
          {!xiulian && <Text> 未开始修炼</Text>}
          {xiulian && (
            <JXButton size='small' transparent onClick={handleOpenXiuLian}>
              已修炼{' '}
              {new TimeArray(Date.now() - xiulian.time).toZhouTian().toFixed(2)}{' '}
              个小周天
            </JXButton>
          )}
        </JXSpace>
        {/* 操作 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions.map((v) => (
            <JXGrid.Item key={v.name} align='center'>
              <JXButton
                disabled={v.disabled}
                size='mini'
                transparent
                onClick={v.click}
              >
                <Text
                  color={canRed && v.name === '升阶' ? 'red' : undefined}
                  textShadow
                >
                  {v.name}
                </Text>
              </JXButton>
            </JXGrid.Item>
          ))}
        </JXGrid>
        {/* 动态 */}
        <JXSpace
          className={styles.ContentBox}
          direction='vertical'
          style={{ paddingLeft: '5px' }}
        >
          <Text color='orange' bold>
            动态
          </Text>
          <Paragraph>
            当前
            {formatXiuxianCalendar(
              get('xiuxianStartAt'),
              get('xiuxianTimeScale') || XIUXIAN_TIME_SCALE_DEFAULT
            )}
          </Paragraph>
        </JXSpace>
        {/* 操作2 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions2.map((v, index) => (
            <JXGrid.Item key={v.name + index} align='center'>
              <JXButton
                disabled={v.disabled}
                size='mini'
                transparent
                onClick={v.click}
              >
                <Text textShadow>{v.name}</Text>
              </JXButton>
            </JXGrid.Item>
          ))}
        </JXGrid>
        {/* 修炼 */}
        <JXGrid className={styles.BottomBox} columns={4}>
          <JXGrid.Item align='center'>
            <JXButton
              size='mini'
              transparent
              onClick={() => {
                navigateTo('Home/pages/actor-list/index', { replace: true });
              }}
            >
              <Text textShadow>角色</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton
              size='mini'
              transparent
              onClick={() => {
                navigateTo('index/index', { replace: true });
              }}
            >
              <Text textShadow>主页</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton
              size='mini'
              transparent
              onClick={() => JXToast().show('开发中，敬请期待')}
            >
              <Text textShadow>插件</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text
                textShadow
                onClick={() => {
                  navigateTo('Main/pages/qiandao/index');
                }}
              >
                签到
              </Text>
            </JXButton>
          </JXGrid.Item>
        </JXGrid>
        <TujianModal
          visible={tujianVisible}
          onClose={() => setTujianVisible(false)}
          get={get}
          set={set}
          actor={actor}
        />
      </JXSpace>
    </View>
  );
}

export default Main;
