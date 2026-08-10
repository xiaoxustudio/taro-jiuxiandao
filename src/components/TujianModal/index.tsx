import { View } from '@tarojs/components';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { JXButton, JXInput, JXModal, JXSpace, Text } from '@/components';
import JXGrid from '@/components/Grid';
import useStorageStore from '@/services/storage';
import { clGrades, dfGrades, SeedRegistryItem } from '@/assets/const';
import { getGradeColor } from '@/utils';
import { ActorDataConfig, DanfangPoolByGrade } from '@/types';
import { DanfangItem } from '@/types/danfang';
import { GongFaType } from '@/types/gongfa';
import styles from './index.module.less';

export interface TujianModalProps {
  visible: boolean;
  onClose: () => void;
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, val: unknown) => void;
  actor: ActorDataConfig;
  seeds?: SeedRegistryItem[];
}

type TujianTab = 'dy' | 'df' | 'gf';

type TujianDetailItem = {
  name: string;
  attr?: unknown;
  ls?: number;
  pj?: string;
  xl?: string;
  lg?: string;
  limit?: string;
  cl?: [string, number][];
  time?: unknown;
};

function TujianModal({
  visible,
  onClose,
  get,
  set,
  actor,
  seeds
}: TujianModalProps) {
  const isSeeds = Array.isArray(seeds);
  const [tab, setTab] = useState<TujianTab>('dy');
  const [grade, setGrade] = useState('全部');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!visible || isSeeds) return;
    const { get: load } = useStorageStore.getState();
    const run = async () => {
      const pool = get('danfangPoolByGrade') as DanfangPoolByGrade | undefined;
      if (!pool) {
        const keys = get('danfangPoolStorageKeysByGrade') as
          | Record<string, string>
          | undefined;
        if (keys && Object.keys(keys).length) {
          const next: DanfangPoolByGrade = {};
          await Promise.all(
            Object.entries(keys).map(async ([gradeKey, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[gradeKey] = loaded as DanfangItem[];
            })
          );
          if (Object.keys(next).length) {
            set('danfangPoolByGrade', next);
          }
        }
      }
      const gongfaPool = get('gongfaPoolByGrade') as
        | Record<string, GongFaType[]>
        | undefined;
      if (!gongfaPool) {
        const gongfaKeys = get('gongfaPoolStorageKeysByGrade') as
          | Record<string, string>
          | undefined;
        if (gongfaKeys && Object.keys(gongfaKeys).length) {
          const gongfaNext: Record<string, GongFaType[]> = {};
          await Promise.all(
            Object.entries(gongfaKeys).map(async ([gradeKey, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              gongfaNext[gradeKey] = loaded as GongFaType[];
            })
          );
          if (Object.keys(gongfaNext).length) {
            set('gongfaPoolByGrade', gongfaNext);
          }
        }
      }
    };
    run();
  }, [get, set, visible, isSeeds]);

  const danfangList = useMemo(() => {
    const pool = actor?.danfangPoolByGrade as DanfangPoolByGrade | undefined;
    if (!pool) return [];
    const map = new Map<string, { name: string; itype?: string }>();
    Object.values(pool).forEach((items) => {
      items.forEach((item: DanfangItem) => {
        const key = item?.name;
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, { name: item.name, itype: item.itype });
        }
      });
    });
    return [...map.values()];
  }, [actor]);

  const danyaoList = useMemo(() => {
    const cw = actor?.cw as
      | { dy: { name: string; itype?: string }[] }
      | undefined;
    if (cw?.dy?.length) {
      const map = new Map<string, { name: string; itype?: string }>();
      cw.dy.forEach((item) => {
        if (!item?.name) return;
        const key = `${item.name}|${item.itype || '一品'}`;
        if (!map.has(key)) {
          map.set(key, {
            name: item.name,
            itype: item.itype || '一品'
          });
        }
      });
      return [...map.values()];
    }
    return [];
  }, [actor]);

  const gongfaList = useMemo(() => {
    const pool = actor?.gongfaPoolByGrade;
    if (pool && Object.keys(pool).length) {
      const map = new Map<string, { name: string; itype?: string }>();
      Object.entries(pool).forEach(([gradeKey, items]) => {
        items.forEach((item: GongFaType) => {
          const key = item?.id || item?.name;
          if (!key || map.has(key)) return;
          map.set(key, {
            name: item.name,
            itype: item?.pj || gradeKey
          });
        });
      });
      return [...map.values()];
    }
    const list = (actor?.gongfa?.ls || []) as GongFaType[];
    const current = actor?.gongfa?.current as GongFaType | null;
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
  }, [actor]);

  const seedsList = useMemo(() => {
    if (!isSeeds) return [];
    return (seeds as SeedRegistryItem[]).map((item) => ({
      name: item.name,
      itype: item.itype
    }));
  }, [isSeeds, seeds]);

  const tujianList = useMemo(() => {
    if (isSeeds) return seedsList;
    if (tab === 'dy') return danyaoList;
    if (tab === 'df') return danfangList;
    return gongfaList;
  }, [danfangList, danyaoList, gongfaList, isSeeds, seedsList, tab]);

  const getEmptyText = () => {
    if (isSeeds) return '暂无种子数据';
    if (tab === 'dy') return '暂无丹药数据';
    if (tab === 'df') return '暂无丹方数据';
    return '暂无功法数据';
  };

  const grades = isSeeds ? clGrades : dfGrades;

  const filteredList = useMemo(() => {
    const kw = keyword.trim();
    return tujianList.filter((item) => {
      if (grade !== '全部' && item.itype !== grade) return false;
      if (kw && !item.name?.includes(kw)) return false;
      return true;
    });
  }, [grade, keyword, tujianList]);

  const handleItemClick = useCallback(
    (item: { name: string; itype?: string }) => {
      if (isSeeds) return;
      const pool = get(
        tab === 'gf' ? 'gongfaPoolByGrade' : 'danfangPoolByGrade'
      ) as DanfangPoolByGrade | Record<string, GongFaType[]> | undefined;
      const detail =
        pool &&
        Object.values(pool)
          .flat()
          .find((x: TujianDetailItem) => x.name === item.name);
      const details: ReactNode[] = [
        <Text key='name'>名称：{item.name}</Text>,
        <Text key='grade' color={getGradeColor(item.itype) || '#888'}>
          品阶：{item.itype || '未知'}
        </Text>
      ];
      if (tab === 'dy' && detail?.attr) {
        const attr = detail.attr as Record<string, number>;
        Object.entries(attr).forEach(([k, v]) => {
          details.push(
            <Text key={k}>
              {k === 'shenshi' ? '神识' : '修为'}：+{v}
            </Text>
          );
        });
        if (detail.ls) {
          details.push(<Text key='ls'>灵石：{detail.ls}</Text>);
        }
      }
      if (tab === 'gf' && detail) {
        if (detail.pj) {
          details.push(<Text key='pj'>品级：{detail.pj}</Text>);
        }
        if (detail.xl) {
          details.push(<Text key='xl'>修炼增益：{detail.xl}</Text>);
        }
        if (detail.lg) {
          details.push(<Text key='lg'>灵根要求：{detail.lg}</Text>);
        }
        if (detail.limit) {
          details.push(<Text key='limit'>限制：{detail.limit}</Text>);
        }
        if (detail.attr) {
          const attr = detail.attr as Record<string, number>;
          Object.entries(attr).forEach(([k, v]) => {
            if (v)
              details.push(
                <Text key={k}>
                  {k}：+{v}
                </Text>
              );
          });
        }
      }
      if (tab === 'df' && detail?.cl) {
        const cl = detail.cl as [string, number][];
        details.push(
          <Text key='cl-title' bold>
            配方材料：
          </Text>
        );
        cl.forEach(([name, num], i) => {
          details.push(
            <Text key={`cl-${i}`}>
              {' '}
              {name} ×{num}
            </Text>
          );
        });
        if (detail.time) {
          const t = detail.time as number[];
          details.push(
            <Text key='time'>
              炼制时间：{t[0] || 0}天 {t[1] || 0}时 {t[2] || 0}分
            </Text>
          );
        }
      }
      JXModal.show({
        title: item.name,
        content: <JXSpace direction='vertical'>{details}</JXSpace>,
        disableCancle: true,
        disableOk: true,
        closeOnMaskClick: true
      });
    },
    [get, isSeeds, tab]
  );

  return (
    <JXModal
      visible={visible}
      cancleText='关闭'
      onCancel={onClose}
      closeOnMaskClick
      disableOk
      content={
        <JXSpace direction='vertical' gap={10}>
          <JXSpace between>
            <Text size={18} bold>
              {isSeeds ? '种子图鉴' : '图鉴'}
            </Text>
            {!isSeeds && (
              <JXSpace gap={6}>
                <JXButton
                  size='mini'
                  disabled={tab === 'dy'}
                  onClick={() => setTab('dy')}
                >
                  丹药
                </JXButton>
                <JXButton
                  size='mini'
                  disabled={tab === 'df'}
                  onClick={() => setTab('df')}
                >
                  丹方
                </JXButton>
                <JXButton
                  size='mini'
                  disabled={tab === 'gf'}
                  onClick={() => setTab('gf')}
                >
                  功法
                </JXButton>
              </JXSpace>
            )}
          </JXSpace>
          <View className={styles.GradeWrap}>
            {['全部', ...grades].map((g) => (
              <JXButton
                key={g}
                size='mini'
                disabled={grade === g}
                onClick={() => setGrade(g)}
              >
                {g}
              </JXButton>
            ))}
          </View>
          <JXInput
            placeholder='按名称搜索'
            value={keyword}
            onChange={(val) => setKeyword(val)}
          />
          <View className={styles.ListWrap}>
            {filteredList.length ? (
              <JXGrid columns={4} gap={8} height={200}>
                {filteredList.map((item, index) => (
                  <JXGrid.Item
                    key={`${item.name}-${item.itype}-${index}`}
                    align='center'
                  >
                    {isSeeds ? (
                      <JXSpace direction='vertical' gap={2}>
                        <Text>{item.name}</Text>
                        <Text color={getGradeColor(item.itype) || '#888'}>
                          {item.itype}
                        </Text>
                      </JXSpace>
                    ) : (
                      <JXButton
                        size='mini'
                        transparent
                        onClick={() => handleItemClick(item)}
                      >
                        <JXSpace direction='vertical' gap={2}>
                          <Text>{item.name}</Text>
                          <Text color={getGradeColor(item.itype) || '#888'}>
                            {item.itype}
                          </Text>
                        </JXSpace>
                      </JXButton>
                    )}
                  </JXGrid.Item>
                ))}
              </JXGrid>
            ) : (
              <Text color='#888'>{getEmptyText()}</Text>
            )}
          </View>
        </JXSpace>
      }
    />
  );
}

export default TujianModal;
