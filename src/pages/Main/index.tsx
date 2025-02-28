import title from '@/assets/logo.png';
import {
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Paragraph,
  Text,
} from '@/components';
import JXGrid from '@/components/Grid';
import useActorController from '@/hooks/useActorController';
import { ZhouTian } from '@/utils';
import {
  getJingJieMaxDep,
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  JingJie1ToNumber,
  JingJie1Transform,
  JingJieTransform,
} from '@/utils/actor';
import { View } from '@tarojs/components';
import { Image } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import styles from './index.module.less';

function Main() {
  const { get, set, actor } = useActorController();
  const xiulian = useMemo(() => get('xiulian') as any, [get]);
  const canRed = useMemo(
    () => get('xiuwei') >= get('max_xiuwei'),
    [get, actor] //eslint-disable-line
  );

  const operaterOptions = [
    {
      name: '试炼',
      click() {},
    },
    {
      name: '炼丹',
      click() {},
    },
    {
      name: '炼器',
      click() {},
    },
    {
      name: '法宝',
      click() {},
    },
    {
      name: '升阶',
      click() {
        if (get('xiuwei') < get('max_xiuwei')) {
          JXToast('修为不足，无法突破！');
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
        if (JingJie1ToNumber(get('max_jingjie')) === getJingJieMaxDep()) {
          set('jingjie', JingJieTransform(get('jingjie')));
          set('max_jingjie', JingJie1Transform(get('max_jingjie')));
        } else {
          set('max_jingjie', JingJie1Transform(get('max_jingjie')));
        }
      },
    },
    {
      name: '功法',
      click() {},
    },
    {
      name: '突破',
      click() {},
    },
    {
      name: '法术',
      click() {},
    },
  ];
  const operaterOptions2 = [
    {
      name: '坊市',
      click() {},
    },
    {
      name: '储物',
      click() {},
    },
    {
      name: '灵兽',
      click() {},
    },
    {
      name: '门派',
      click() {},
    },
    {
      name: '药园',
      click() {},
    },
    {
      name: '洞府',
      click() {},
    },
    {
      name: '成就',
      click() {},
    },
    {
      name: '赌场',
      click() {},
    },
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
    const _add = get('lv') + getLingQiForJingJie();
    const cwcalc = Math.round(
      getLingQiForRate() * ZhouTian(xiulian.time) + _add
    );
    const content = (
      <>
        阶段增益：{get('lv') / 10}
        <br />
        境界增益：{getLingQiToNumber() / 10}
        <br />
        洞府增益：{get('dongfu') ? get('dongfu').lingchi : 0}
        <br />
        总修炼小周天合计：{ZhouTian(xiulian.time).toFixed(2)}
        <br />
        总获取修为合计：{cwcalc}
      </>
    );
    const c = JXModal.show({
      title: '修炼',
      content,
      disableCancle: true,
      okText: '收功',
      onOk() {
        c.close();
        set('xiuwei', get('xiuwei') + cwcalc);
        set('xiulian', null);
      },
    });
  };

  return (
    <View>
      <JXSpace className={styles.MainBox} direction='vertical'>
        <JXSpace className={styles.Title}>
          <Image width={120} src={title} />
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
            {get('max_jingjie')}
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
              <JXButton size='mini' transparent onClick={v.click}>
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
        <JXSpace className={styles.ContentBox} direction='vertical'>
          <Text color='orange' bold>
            动态
          </Text>
          <Paragraph>测试</Paragraph>
        </JXSpace>
        {/* 操作2 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions2.map((v, index) => (
            <JXGrid.Item key={v.name + index} align='center'>
              <JXButton size='mini' transparent onClick={v.click}>
                <Text textShadow>{v.name}</Text>
              </JXButton>
            </JXGrid.Item>
          ))}
        </JXGrid>
        {/* 修炼 */}
        <JXGrid className={styles.BottomBox} columns={4}>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>角色</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>社区</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>CDK</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>签到</Text>
            </JXButton>
          </JXGrid.Item>
        </JXGrid>
      </JXSpace>
    </View>
  );
}

export default Main;
