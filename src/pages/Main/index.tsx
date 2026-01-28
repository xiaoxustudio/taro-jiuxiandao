import { round } from 'lodash-es';
import { Image } from 'antd-mobile';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import title from '@/assets/logo.png';
import {
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
import { getGradeColor, navigateTo, TimeArray, ZhouTian } from '@/utils';
import {
  getJingJieMaxDep,
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  JingJie1ToNumber,
  JingJie1Transform,
  JingJie2Transform,
  JingJieTransform
} from '@/utils/actor';
import TpData from '@/assets/tp.json';
import danfangData from '@/assets/danfang.json';
import { CWType } from '@/types';
import { GongFaType } from '@/types/gongfa';
import { dfGrades } from '@/assets/const';
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
  const xiulian = useMemo(() => get('xiulian') as any, [get]);
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
      disabeld: true,
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
        // 计算
        const calc = Math.ceil(
          getLingQiForJingJie() * get('lv') +
            (getLingQiToNumber() + 1) * get('max_xiuwei') * 0.7
        );
        set('lv', get('lv') + 1);
        set('xiuwei', Math.ceil(get('xiuwei') - get('max_xiuwei')));
        set('max_xiuwei', calc);
        const lv1 = get('lv') / 20 + 1;
        // 速度
        if (get('jingjie') !== '练气') {
          const calcSudu = get('sudu') + 3 * lv1;
          set('sudu', calcSudu);
        }
        // 气血和物理
        // 阶段境界
        if (get('jingjie2') === '大圆满') {
          JXToast().show(`目前已达到大圆满，请寻找机缘突破！`);
          return;
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
        const tpdata = TpData[get('jingjie')];
        const dfIdMap: Record<string, string> = {
          练气: '20001',
          筑基: '20002',
          结丹: '20003',
          元婴: '20004'
          // 化神: '20005',
          // 返虚: '20006',
          // 合体: '20007'
        };
        // 大阶段境界
        if (
          get('jingjie2') === '大圆满' &&
          JingJie1ToNumber(get('jingjie2')) === getJingJieMaxDep()
        ) {
          if (!tpdata) {
            JXToast().show(`天道压制，无法突破更高境界！`);
            return;
          }
          const cur = get('jingjie');
          const dfId = dfIdMap[cur];
          const df = dfId ? (danfangData as any)[dfId] : null;
          const need = df
            ? (df.cl as [string, number][]).map((v) => ({
                name: v[0],
                type: CWType.QT,
                num: v[1],
                isPile: true
              }))
            : [];
          const isCl = need.length > 0 && chuwu.HasArr(need);
          if (isCl) {
            const jj = JingJieTransform(get('jingjie'));
            set('jingjie1', JingJie1Transform(get('jingjie1')));
            set('jingjie', jj); // 大境界转换
            const lv1 = get('lv') / 20 + 1;
            const calcGongji =
              get('gongji') + 10 * lv1 + tpdata.add.gongji * 0.5;
            const calcQixue = get('qixue') + 100 * lv1 + tpdata.add.qixue * 0.5;
            set('gongji', calcGongji);
            set('qixue', calcQixue);
            chuwu.RemoveArr(need);
            const addShouyuan = get('max_shouyuan') + tpdata.add.shouyuan;
            set('max_shouyuan', addShouyuan);
            JXToast().show(
              `突破至：${jj}，寿元：${addShouyuan}\n目前气血：${calcQixue}，攻击：${calcGongji}`
            );
          } else {
            JXToast().show(`材料不足，无法突破！`);
          }
        } else {
          JXToast().show(`未达到大圆满，请先提升小境界！`);
        }
      }
    },
    {
      name: '法术',
      disabeld: true,
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
      disabeld: true,
      click() {}
    },
    {
      name: '门派',
      disabeld: true,
      click() {}
    },
    {
      name: '药园',
      disabeld: true,
      click() {}
    },
    {
      name: '洞府',
      click() {
        navigateTo('Main/pages/dongfu/index');
      }
    },
    {
      name: '成就',
      disabeld: true,
      click() {}
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
    const anyTaro = Taro as any;
    const load = async (key?: string) => {
      if (!key) return undefined;
      let raw: any;
      if (typeof anyTaro.getStorageSync === 'function') {
        raw = anyTaro.getStorageSync(key);
      } else if (typeof anyTaro.getStorage === 'function') {
        try {
          const res = await anyTaro.getStorage({ key });
          raw = res?.data;
        } catch (e) {
          String(e);
          return undefined;
        }
      } else {
        return undefined;
      }
      if (!raw) return undefined;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (e) {
          String(e);
          return raw;
        }
      }
      return raw;
    };
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

    const dfRate = get('dongfu') ? get('dongfu').lingchi : 0;

    const zhoutian = ZhouTian(xiulian.time);

    const shouldGetXiu =
      needAddXiuWeiJJ * 0.05 * rateOfLing * lvRate * jjRate + dfRate;

    const zhotianByzhoutian = Math.round(shouldGetXiu) * (0.5 + zhongzuRate); // 每小周天能获取修为

    const calcXiu = (zhotianByzhoutian * zhoutian).toFixed(2);

    const content = (
      <>
        等级增益系数：{lvRate}
        <br />
        境界增益系数：{jjRate}
        <br />
        洞府增益：{dfRate}
        <br />
        已修炼小周天：{ZhouTian(xiulian.time).toFixed(2)}
        <br />
        总获取修为合计：{calcXiu}
      </>
    );
    const c = JXModal.show({
      title: '修炼',
      content,
      disableCancle: true,
      okText: '收功',
      onOk() {
        c.close();
        set('xiuwei', round(get('xiuwei') + Number.parseFloat(calcXiu), 2));
        set('dongfu.lingchi', 0);
        set('xiulian', null);
      }
    });
  };

  useEffect(() => {
    // 寿元计算
    const time1 = get('time1');
    const calcShouYuan = (Date.now() - time1) / TimeArray.Map.hour;
    if (calcShouYuan >= 24) {
      const calcCache = (calcShouYuan / 24) * 2 + get('shouyuan');
      set('shouyuan', Math.round(calcCache));
      // 判断寿元是否到期
      if (calcCache >= get('max_shouyuan')) {
        JXToast().show('寿元已到极限');
        // 后续处理todo
      } else {
        const needAdd = time1 + (calcShouYuan / 24) * TimeArray.Map.hour * 24;
        // 计算应增加的时间
        set('time1', Math.round(needAdd));
      }
    }
    // 神识计算
    const shenshiTime = get('shenshiTime');
    const calcShenShi = (Date.now() - shenshiTime) / TimeArray.Map.hour;
    if (calcShenShi >= 1) {
      // 计算神识恢复程度
      const maxShenShi = get('max_shenshi');
      let data = get('shenshi') + (maxShenShi * calcShenShi) / 24;
      if (data > maxShenShi) {
        data = maxShenShi;
      }
      set('shenshi', Math.round(data));
      set('shenshiTime', Date.now());
    }
  }, []); //eslint-disable-line

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
                disabled={v.disabeld}
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
          <Paragraph>测试</Paragraph>
        </JXSpace>
        {/* 操作2 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions2.map((v, index) => (
            <JXGrid.Item key={v.name + index} align='center'>
              <JXButton
                disabled={v.disabeld}
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
              <Text textShadow>CDK</Text>
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
