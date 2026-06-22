import { cloneDeep, round } from 'lodash-es';
import { Image } from 'antd-mobile';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import title from '@/assets/logo.png';
import {
  Box,
  JXButton,
  JXInput,
  JXModal,
  JXSpace,
  JXToast,
  Paragraph,
  Text
} from '@/components';
import JXGrid from '@/components/Grid';
import useActorController from '@/hooks/useActorController';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import useStorageStore from '@/services/storage';
import {
  getGradeColor,
  navigateTo,
  TimeArray,
  ZhouTian,
  formatXiuxianCalendar
} from '@/utils';
import {
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  JingJie2Transform,
  JingJieTransform,
  LUNHUI_BUFF_PER_COUNT
} from '@/utils/actor';
import TpData from '@/assets/tp.json';
import danfangData from '@/assets/danfang.json';
import { CWType } from '@/types';
import { GongFaType } from '@/types/gongfa';
import { dfGrades, XIUXIAN_TIME_SCALE_DEFAULT } from '@/assets/const';
import chuwu from '@/utils/chuwu';
import styles from './index.module.less';

function Main() {
  const { get, set, actor } = useActorController();
  const [tujianVisible, setTujianVisible] = useState(false);
  const [tujianTab, setTujianTab] = useState<'dy' | 'df' | 'gf'>('dy');
  const [tujianGrade, setTujianGrade] = useState('全部');
  const [tujianKeyword, setTujianKeyword] = useState('');
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
      Math.min(maxShenshi - currentShenshi, (maxShenshi * elapsedHours) / 24)
    );
    if (shenshiRecover > 0) {
      set('shenshi', currentShenshi + shenshiRecover);
      set('shenshiTime', Date.now());
      JXModal.show({
        title: '离线收益',
        content: (
          <JXSpace direction='vertical'>
            <Text>你离开了 {Math.round(elapsedHours)} 小时</Text>
            <Text>神识自动恢复：{shenshiRecover} 点</Text>
          </JXSpace>
        ),
        closeOnMaskClick: true,
        disableCancle: true,
        disableOk: true
      });
    }
  }, [get, set]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const xiulian = useMemo(() => get('xiulian' as any) ?? 0, [get]);
  const canRed = useMemo(
    () => get('xiuwei') >= get('max_xiuwei'),
    [get, actor] //eslint-disable-line
  );

  const operaterOptions = [
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
      name: '炼器',
      disabled: true,
      click() {}
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
        // 计算（对数曲线避免后期膨胀）
        const lv = get('lv');
        const jjBase = getLingQiForJingJie();
        const jjIdx = getLingQiToNumber();
        const logFactor = 1 + Math.log(Math.max(1, lv)) / 5;
        const calc = Math.ceil(
          jjBase * logFactor +
            (jjIdx + 1) *
              Math.max(jjBase * 0.5, get('max_xiuwei') * 0.4 * logFactor)
        );
        // 阶段境界
        if (get('jingjie2') === '大圆满') {
          JXToast(`目前已达到大圆满，请寻找机缘突破！`).show();
          return;
        }
        set('lv', get('lv') + 1);
        set('xiuwei', Math.ceil(get('xiuwei') - get('max_xiuwei')));
        set('max_xiuwei', calc);
        const lv1 = get('lv') / 20 + 1;
        if (get('jingjie') !== '练气') {
          const calcSudu = get('sudu') + 3 * lv1;
          set('sudu', calcSudu);
        }
        set('jingjie2', JingJie2Transform(get('jingjie2')));
        const calcGongji = get('gongji') + 10 * lv1;
        const calcQixue = get('qixue') + 100 * lv1;
        set('gongji', calcGongji);
        set('qixue', calcQixue);
        JXToast().show(`目前气血：${calcQixue}，攻击：${calcGongji}`);
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
        const tpdata = TpData[jingjie];
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
                    • 修炼倍率 +{LUNHUI_BUFF_PER_COUNT.xiulianbeilvBonus * 10}%
                  </Text>
                  <Text>
                    • 神识上限 +{LUNHUI_BUFF_PER_COUNT.maxShenshiBonus}
                  </Text>
                  <Text>• 寿元上限 +{LUNHUI_BUFF_PER_COUNT.shouyuanBonus}</Text>
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
                const {
                  maxShenshiBonus,
                  shouyuanBonus,
                  initialXiuweiBonus,
                  xiulianbeilvBonus
                } = LUNHUI_BUFF_PER_COUNT;
                const nextActor = {
                  ...(actor as any),
                  lv: 1,
                  xiuwei: initialXiuweiBonus * newLunhuiCount,
                  max_xiuwei: 500,
                  shenshi: 100 + maxShenshiBonus * newLunhuiCount,
                  max_shenshi: 100 + maxShenshiBonus * newLunhuiCount,
                  shouyuan: 100 + shouyuanBonus * newLunhuiCount,
                  max_shouyuan: 100 + shouyuanBonus * newLunhuiCount,
                  jingjie: '练气',
                  jingjie1: '一阶',
                  jingjie2: '初期',
                  qixue: 1200,
                  gongji: 80,
                  fangyu: 40,
                  baoji: 2,
                  sudu: 20,
                  fashu: 0,
                  xiulianbeilv: 10 + xiulianbeilvBonus * newLunhuiCount,
                  addAttr: {
                    qixue: 0,
                    gongji: 0,
                    fangyu: 0,
                    baoji: 0,
                    sudu: 0,
                    fashu: 0,
                    xianyuan: 0
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
                  cw: { fb: [], dy: [], qt: [], max: 30 },
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
                    time: 0
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
                  chengjiu: undefined,
                  battleCount: undefined,
                  winStreak: undefined
                };
                useActorStore.getState().set(daohao, nextActor as any);
                useStore.getState().set(daohao);
                JXToast(`轮回成功！当前第 ${newLunhuiCount} 世`).show();
                setTimeout(() => navigateTo('Main/index', { all: true }), 800);
              }
            });
            return;
          }
          if (!tpdata) {
            JXToast(`天道压制，无法突破更高境界！`).show();
            return;
          }
          const need = tpdata.cl.map((v: any) => ({
            name: v.name,
            type: CWType.DY,
            num: v.num,
            isPile: true
          }));
          const hasPill = need.length > 0 && chuwu.HasArr(need);
          if (hasPill) {
            chuwu.RemoveArr(need);
            const jj = JingJieTransform(get('jingjie'));
            set('jingjie1', '一阶');
            set('jingjie', jj);
            const lv1 = get('lv') / 20 + 1;
            const calcGongji =
              get('gongji') + 10 * lv1 + tpdata.add.gongji * 0.5;
            const calcQixue = get('qixue') + 100 * lv1 + tpdata.add.qixue * 0.5;
            set('gongji', calcGongji);
            set('qixue', calcQixue);
            const addShouyuan = get('max_shouyuan') + tpdata.add.shouyuan;
            set('max_shouyuan', addShouyuan);
            JXToast(
              `突破至：${jj}，寿元：${addShouyuan}\n目前气血：${calcQixue}，攻击：${calcGongji}`
            ).show();
          } else {
            JXToast(`缺少突破丹药，请先炼制对应丹药！`).show();
          }
        } else {
          JXToast(`未达到大圆满，请先提升小境界！`).show();
        }
      }
    },
    {
      name: '法术',
      disabled: true,
      click() {}
    }
  ];
  const operaterOptions2 = [
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
      name: '灵兽',
      disabled: true,
      click() {}
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

  useEffect(() => {
    if (!tujianVisible) return;
    const { get: load } = useStorageStore.getState();
    const run = async () => {
      const pool = get('danfangPoolByGrade') as
        | Record<string, any[]>
        | undefined;
      if (!pool) {
        const keys = get('danfangPoolStorageKeysByGrade') as
          | Record<string, string>
          | undefined;
        if (keys && Object.keys(keys).length) {
          const next: Record<string, any[]> = {};
          await Promise.all(
            Object.entries(keys).map(async ([grade, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[grade] = loaded as any[];
            })
          );
          if (Object.keys(next).length) {
            set('danfangPoolByGrade', next);
          }
        }
      }
      const gongfaPool = get('gongfaPoolByGrade') as
        | Record<string, any[]>
        | undefined;
      if (!gongfaPool) {
        const gongfaKeys = get('gongfaPoolStorageKeysByGrade') as
          | Record<string, string>
          | undefined;
        if (gongfaKeys && Object.keys(gongfaKeys).length) {
          const gongfaNext: Record<string, any[]> = {};
          await Promise.all(
            Object.entries(gongfaKeys).map(async ([grade, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              gongfaNext[grade] = loaded as any[];
            })
          );
          if (Object.keys(gongfaNext).length) {
            set('gongfaPoolByGrade', gongfaNext);
          }
        }
      }
    };
    run();
  }, [get, set, tujianVisible]);

  const danfangList = useMemo(() => {
    const pool = get('danfangPoolByGrade') as Record<string, any[]> | undefined;
    if (!pool) return [];
    const map = new Map<string, { name: string; itype?: string }>();
    Object.values(pool).forEach((items) => {
      items.forEach((item: any) => {
        const key = item?.id || item?.name;
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, { name: item.name, itype: item.itype });
        }
      });
    });
    return [...map.values()];
  }, [get]);

  const danyaoList = useMemo(() => {
    const pool = get('danfangPoolByGrade') as Record<string, any[]> | undefined;
    if (pool && Object.keys(pool).length) {
      const map = new Map<string, { name: string; itype?: string }>();
      Object.values(pool).forEach((items) => {
        items.forEach((item: any) => {
          const key = item?.id || item?.name;
          if (!key) return;
          const rawName = item?.name;
          const name =
            typeof rawName === 'string'
              ? rawName.replace(/丹方$/, '丹')
              : rawName;
          if (!map.has(key)) {
            map.set(key, { name, itype: item?.itype });
          }
        });
      });
      return [...map.values()];
    }
    const custom = (get('danfangData') ?? {}) as Record<string, any>;
    const map = new Map<string, { name: string; itype?: string }>();
    Object.entries(danfangData as Record<string, any>).forEach(([id, item]) => {
      if (!item?.name) return;
      map.set(id, { name: item.name, itype: item.itype });
    });
    Object.entries(custom).forEach(([id, item]) => {
      if (!item?.name) return;
      map.set(id, { name: item.name, itype: item.itype });
    });
    return [...map.values()];
  }, [get]);

  const gongfaList = useMemo(() => {
    const pool = get('gongfaPoolByGrade') as Record<string, any[]> | undefined;
    if (pool && Object.keys(pool).length) {
      const map = new Map<string, { name: string; itype?: string }>();
      Object.entries(pool).forEach(([grade, items]) => {
        items.forEach((item: any) => {
          const key = item?.id || item?.name;
          if (!key || map.has(key)) return;
          map.set(key, {
            name: item.name,
            itype: item?.pj || item?.itype || grade
          });
        });
      });
      return [...map.values()];
    }
    const list = (get('gongfa.ls') || []) as GongFaType[];
    const current = get('gongfa.current') as GongFaType | null;
    const map = new Map<string, { name: string; itype?: string }>();
    const addGongfa = (gf?: GongFaType | null) => {
      if (!gf?.name) return;
      const key = gf.id || gf.name;
      if (map.has(key)) return;
      map.set(key, { name: gf.name, itype: gf.pj });
    };
    list.forEach(addGongfa);
    addGongfa(current);
    return [...map.values()];
  }, [get]);

  const tujianList = useMemo(() => {
    if (tujianTab === 'dy') return danyaoList;
    if (tujianTab === 'df') return danfangList;
    return gongfaList;
  }, [danfangList, danyaoList, gongfaList, tujianTab]);
  const emptyTujianText = useMemo(() => {
    if (tujianTab === 'dy') return '暂无丹药数据';
    if (tujianTab === 'df') return '暂无丹方数据';
    return '暂无功法数据';
  }, [tujianTab]);
  const filteredTujianList = useMemo(() => {
    const keyword = tujianKeyword.trim();
    return tujianList.filter((item) => {
      if (tujianGrade !== '全部' && item.itype !== tujianGrade) return false;
      if (keyword && !item.name?.includes(keyword)) return false;
      return true;
    });
  }, [tujianGrade, tujianKeyword, tujianList]);

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

    const zhongzuRate = get('zhongzu') === '灵' ? 0.2 : 0; // 种族增益系数

    const rateOfLing = getLingQiForRate();

    const lvRate = round((get('lv') / 10) * 0.05, 2);

    const jjRate = 1 + (getLingQiToNumber() - 1) * 0.15;

    const gongfaCurrent = get('gongfa.current') as GongFaType | null;
    const gongfaXL =
      typeof gongfaCurrent?.xl === 'number'
        ? gongfaCurrent.xl
        : Number((gongfaCurrent?.xl || '').toString().replace('%', '')) || 0;
    const gongfaRate = Math.max(0, gongfaXL) / 100;
    const xlBeilv = ((get('xiulianbeilv') as number) || 0) / 10;

    const dfLingchi = get('dongfu') ? get('dongfu').lingchi : 0;

    const zhoutian = ZhouTian(xiulian.time);

    const shouldGetXiu =
      needAddXiuWeiJJ * 0.05 * rateOfLing * lvRate * jjRate * xlBeilv;

    const zhotianByzhoutian = Math.round(shouldGetXiu) * (0.5 + zhongzuRate);

    const baseXiu = round(zhotianByzhoutian * zhoutian * (1 + gongfaRate), 2);
    const lingchiPerZhouTian = 1;
    const consumedLingchi = Math.min(
      dfLingchi,
      Math.floor(zhoutian * lingchiPerZhouTian)
    );
    const calcXiu = round(baseXiu + consumedLingchi, 2);

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
        已修炼小周天：{ZhouTian(xiulian.time).toFixed(2)}
        <br />
        总获取修为合计：{calcXiu.toFixed(2)}
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
      const shenshiTime = freshGet('shenshiTime') || Date.now();
      const shenshiElapsed = (Date.now() - shenshiTime) / TimeArray.Map.hour;
      if (shenshiElapsed >= 1) {
        const maxShenShi = freshGet('max_shenshi') || 0;
        const currentShenshi = freshGet('shenshi') || 0;
        let newShenshi = currentShenshi + (maxShenShi * shenshiElapsed) / 24;
        if (newShenshi > maxShenShi) newShenshi = maxShenShi;
        rawSet('shenshi', Math.round(newShenshi));
        rawSet('shenshiTime', Date.now());
      }

      const time1 = freshGet('time1') || Date.now();
      const elapsedHours = (Date.now() - time1) / TimeArray.Map.hour;
      if (elapsedHours >= 24) {
        const advance =
          time1 + Math.floor(elapsedHours / 24) * TimeArray.Map.hour * 24;
        rawSet('time1', Math.round(advance));
        const currentShouyuan = freshGet('shouyuan') || 0;
        const maxShouyuan = freshGet('max_shouyuan') || 0;
        const newShouyuan = Math.round(currentShouyuan + 2);
        rawSet('shouyuan', Math.min(newShouyuan, maxShouyuan));
        if (newShouyuan >= maxShouyuan && currentShouyuan < maxShouyuan) {
          const { close } = JXModal.show({
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
              close();
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
              已修炼 {ZhouTian(xiulian.time).toFixed(2)} 个小周天
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
            <JXButton disabled size='mini' transparent>
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
        <JXModal
          visible={tujianVisible}
          cancleText='关闭'
          onCancel={() => setTujianVisible(false)}
          closeOnMaskClick
          disableOk
          content={
            <JXSpace direction='vertical' gap={10}>
              <JXSpace between>
                <Text size={18} bold>
                  图鉴
                </Text>
                <JXSpace gap={6}>
                  <JXButton
                    size='mini'
                    disabled={tujianTab === 'dy'}
                    onClick={() => setTujianTab('dy')}
                  >
                    丹药
                  </JXButton>
                  <JXButton
                    size='mini'
                    disabled={tujianTab === 'df'}
                    onClick={() => setTujianTab('df')}
                  >
                    丹方
                  </JXButton>
                  <JXButton
                    size='mini'
                    disabled={tujianTab === 'gf'}
                    onClick={() => setTujianTab('gf')}
                  >
                    功法
                  </JXButton>
                </JXSpace>
              </JXSpace>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['全部', ...dfGrades].map((grade) => (
                  <JXButton
                    key={grade}
                    size='mini'
                    disabled={tujianGrade === grade}
                    onClick={() => setTujianGrade(grade)}
                  >
                    {grade}
                  </JXButton>
                ))}
              </View>
              <JXInput
                placeholder='按名称搜索'
                value={tujianKeyword}
                onChange={(val) => setTujianKeyword(val)}
              />
              <View style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {filteredTujianList.length ? (
                  <JXGrid columns={4} gap={8} height={200}>
                    {filteredTujianList.map((item, index) => (
                      <JXGrid.Item
                        key={`${item.name}-${item.itype}-${index}`}
                        align='center'
                      >
                        <JXSpace direction='vertical' gap={2}>
                          <Text>{item.name}</Text>
                          <Text color={getGradeColor(item.itype) || '#888'}>
                            {item.itype}
                          </Text>
                        </JXSpace>
                      </JXGrid.Item>
                    ))}
                  </JXGrid>
                ) : (
                  <Text color='#888'>{emptyTujianText}</Text>
                )}
              </View>
            </JXSpace>
          }
        />
      </JXSpace>
    </View>
  );
}

export default Main;
