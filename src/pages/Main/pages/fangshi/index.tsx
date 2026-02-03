import { useEffect, useMemo, useState } from 'react';
import {
  fangshiCategories,
  FangshiCategoryKey,
  FangshiSnapshot,
  FANGSHI_REFRESH_INTERVAL,
  resolveFangshiSnapshot
} from '@/utils/fangshi';
import danfangData from '@/assets/danfang.json';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  Scroll,
  Text
} from '@/components';
import { ActorDataConfigForZhanDou, CWType, YaoyuanData } from '@/types';
import {
  AttrTransformChinese,
  getGradeColor,
  resolveDanfangPoolByGrade,
  resolveMaterialPoolByGrade,
  resolveSeedRegistry
} from '@/utils';
import chuwu from '@/utils/chuwu';
import useContainer from '@/hooks/useContainer';
import useActorController from '@/hooks/useActorController';
import useStorageStore from '@/store/storage';
import './index.less';

export default function Fangshi() {
  const [type, setType] = useState<FangshiCategoryKey>(
    fangshiCategories[0].key
  );
  const container = useContainer();
  const { get, set } = useActorController();
  const [snapshot, setSnapshot] = useState<FangshiSnapshot | null>(() =>
    get('fangshi')
  );
  const [refreshLeft, setRefreshLeft] = useState<number>(() => {
    const current = get('fangshi') as FangshiSnapshot | null;
    const updatedAt = current?.updatedAt ?? Date.now();
    return Math.max(0, FANGSHI_REFRESH_INTERVAL - (Date.now() - updatedAt));
  });
  const currentCategory = useMemo(
    () => fangshiCategories.find((item) => item.key === type),
    [type]
  );
  const currentList = useMemo(
    () => snapshot?.items[type] ?? [],
    [snapshot, type]
  );
  const list = useMemo(() => {
    const targetList = currentList;
    const action = currentCategory?.action;
    return targetList.map((v, index) => ({
      ...v,
      title: (
        <Box>
          <Text>{v.name}</Text>
          <JXSpace between>
            <Text>灵石：{v.ls}</Text>
            <Text align='right' color={getGradeColor(v.itype) || undefined}>
              {v.itype}
            </Text>
          </JXSpace>
        </Box>
      ),
      value: '',
      key: `${v.name}-${index}`,
      click() {
        const attr = v.attr ?? {};
        const attrKeys = Object.keys(attr);
        const instance = JXModal.show({
          okText: '购买',
          content: (
            <JXSpace direction='vertical'>
              <Text size={20} bold>
                {v.name}
              </Text>
              {v.pj && (
                <Text color={getGradeColor(v.pj) || undefined}>
                  品阶：{v.pj}
                </Text>
              )}
              <Text>
                {[1, 5].includes(v.type) ? (
                  <>
                    品阶：
                    <Text inline color={getGradeColor(v.itype) || undefined}>
                      {v.itype}
                    </Text>
                  </>
                ) : (
                  <>类型：{v.itype}</>
                )}
              </Text>
              <Text>描述：{v.desc}</Text>
              {attrKeys.length ? (
                <JXSpace direction='vertical' title='属性'>
                  {attrKeys.map((item) => (
                    <Text key={attr[item]}>
                      {AttrTransformChinese(
                        item as keyof ActorDataConfigForZhanDou
                      )}
                      ：
                      {attr[item] >= 0 ? (
                        <Text color='green' inline>
                          + {attr[item]}
                        </Text>
                      ) : (
                        <Text color='red' inline>
                          {attr[item]}
                        </Text>
                      )}
                    </Text>
                  ))}
                  <Text>售价：{v.ls}</Text>
                </JXSpace>
              ) : (
                <Text>售价：{v.ls}</Text>
              )}
            </JXSpace>
          ),
          onOk() {
            instance.close();
            // eslint-disable-next-line no-bitwise
            if (~chuwu.Has(v) && !v.isPile) {
              JXToast('已拥有该物品！').show();
              return;
            }
            if (chuwu.LingShiThan(v.ls)) {
              if (action === 'danfang') {
                if (v.id) {
                  if (!(danfangData as Record<string, any>)[v.id]) {
                    if (v.cl && v.time) {
                      const baseName = v.name.endsWith('丹方')
                        ? v.name.slice(0, -2)
                        : v.name;
                      const current = (get('danfangData') ?? {}) as Record<
                        string,
                        any
                      >;
                      if (!current[v.id]) {
                        set('danfangData', {
                          ...current,
                          [v.id]: {
                            name: baseName,
                            type: v.type,
                            attr: v.attr ?? {},
                            cl: v.cl,
                            time: v.time,
                            itype: v.itype,
                            isPile: true,
                            desc: v.desc,
                            ls: v.baseLs ?? v.ls
                          }
                        });
                      }
                    }
                  }
                  chuwu.AddDanFang(v.id);
                  JXToast(`购买丹方：${v.name}`).show();
                } else {
                  JXToast('丹方数据异常').show();
                  return;
                }
              } else {
                const isSeed = v.name.endsWith('种子') && Array.isArray(v.time);
                if (isSeed) {
                  const currentYaoyuan = get('yaoyuan') as YaoyuanData | null;
                  if (currentYaoyuan) {
                    const nextSeeds = currentYaoyuan.seeds ?? [];
                    const existing = nextSeeds.find(
                      (item) => item.name === v.name
                    );
                    const seedBase = {
                      name: v.name,
                      material: v.material || v.name.replace(/种子$/, ''),
                      itype: v.itype,
                      time: v.time
                    };
                    const updatedSeeds = existing
                      ? nextSeeds.map((item) =>
                          item.name === v.name
                            ? { ...item, num: item.num + 1 }
                            : item
                        )
                      : [...nextSeeds, { ...seedBase, num: 1 }];
                    set('yaoyuan', { ...currentYaoyuan, seeds: updatedSeeds });
                  } else {
                    chuwu.Add(v);
                  }
                  JXToast(`购买种子：${v.name}`).show();
                } else {
                  chuwu.Add(v);
                  JXToast(`购买物品：${v.name}`).show();
                }
              }
              chuwu.Remove({ name: '灵石', type: CWType.QT, num: v.ls });
            } else {
              const needLS = chuwu.Get({ name: '灵石', type: CWType.QT });
              JXToast(`灵石不足，还差${v.ls - needLS!.num!}`).show();
            }
          },
          onCancel() {
            instance.close();
          }
        });
      }
    }));
  }, [currentCategory, currentList, get, set]);
  const lsMemo = useMemo(
    () => chuwu.Get({ name: '灵石', type: CWType.QT }),
    []
  );
  const refreshLeftText = useMemo(() => {
    const total = Math.max(0, Math.ceil(refreshLeft / 1000));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [refreshLeft]);

  useEffect(() => {
    const refresh = () => {
      const realm = get('jingjie') as string;
      const current = get('fangshi') as FangshiSnapshot | null;
      const { getSync: storageGetSync } = useStorageStore.getState();
      const materialPoolByGrade = resolveMaterialPoolByGrade({
        get,
        set,
        storageGetSync
      });
      const danfangPoolByGrade = resolveDanfangPoolByGrade({
        get,
        set,
        storageGetSync
      });
      const seedRegistry = resolveSeedRegistry({ get, set, storageGetSync });
      const next = resolveFangshiSnapshot(
        current,
        realm,
        Date.now(),
        materialPoolByGrade,
        danfangPoolByGrade,
        seedRegistry
      );
      if (current !== next) {
        set('fangshi', next);
      }
      setSnapshot(next);
    };
    refresh();
    const timer = setInterval(refresh, 60 * 1000);
    return () => {
      clearInterval(timer);
    };
  }, [get, set]);
  useEffect(() => {
    const tick = () => {
      const updatedAt = snapshot?.updatedAt ?? Date.now();
      const left = Math.max(
        0,
        FANGSHI_REFRESH_INTERVAL - (Date.now() - updatedAt)
      );
      setRefreshLeft(left);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [snapshot?.updatedAt]);

  return (
    <Container
      title='坊市'
      desc='云雾散开，寻路符渐渐失效，一座灵气浓郁，建筑华丽的坊市出现在你的面前…'
      context={container}
      scroll
    >
      <JXSpace between style={{ width: '100%', marginBottom: '10px' }}>
        <Text>灵石：{lsMemo?.num || 0}</Text>
        <Text align='right'>刷新：{refreshLeftText}</Text>
      </JXSpace>
      <JXSpace gap={10} style={{ width: '100%' }} hscroll>
        {fangshiCategories.map((item) => (
          <JXButton
            key={item.key}
            width='100px'
            onClick={() => setType(item.key)}
          >
            {item.label}
          </JXButton>
        ))}
      </JXSpace>
      {currentCategory && (
        <Scroll calc={container.calcHeight + 50}>
          <List list={list} noFlex />
        </Scroll>
      )}
    </Container>
  );
}
