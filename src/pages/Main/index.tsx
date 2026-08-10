import { cloneDeep } from 'lodash-es';
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
  navigateTo,
  TimeArray,
  formatXiuxianCalendar,
  getRealmText,
  getTotalAttr
} from '@/utils';

import { XIUXIAN_TIME_SCALE_DEFAULT } from '@/assets/const';
import styles from './index.module.less';
import { calcShengjie, calcTupo, openXiulianDialog } from './operates';

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
        name: '飞升',
        click() {
          navigateTo('Main/pages/feisheng/index');
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
          calcShengjie(actor, get, set);
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
          calcTupo(actor, get, set);
        }
      },
      {
        name: `法术(${get('fashu')})`,
        click() {
          const fashuTotal = getTotalAttr(get).fashu;
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
    openXiulianDialog(actor, get, set);
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
            {getRealmText(get)}
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
