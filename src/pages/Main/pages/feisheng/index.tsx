import { View } from '@tarojs/components';
import { useCallback } from 'react';
import {
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import { REALM_ORDER } from '@/assets/const';
import { CWType } from '@/types';
import chuwu from '@/utils/chuwu';
import { getTotalAttr } from '@/utils';
import './index.less';

const MAX_LEVEL = 9;
const SHENSHI_COST = 20;
const EXP_GAIN = 150;
const XIANYUAN_COST = 100;
const LINGSHI_COST = 100000;
const PER_LEVEL_BONUS = {
  qixue: 200,
  gongji: 20,
  fangyu: 15,
  sudu: 8,
  baoji: 1
};

function Feisheng() {
  const { get, set, actor } = useActorController();
  const feisheng = actor?.feisheng ?? null;

  const lastRealm = REALM_ORDER[REALM_ORDER.length - 1];
  const jingjie = get('jingjie') as string;
  const xiuwei = get('xiuwei') || 0;
  const maxXiuwei = get('max_xiuwei') || 1;
  const realmOk = jingjie === lastRealm;
  const xiuweiOk = xiuwei >= maxXiuwei * 0.9;
  const canFeisheng = realmOk && xiuweiOk;

  const calcPower = useCallback(
    (
      level: number,
      bonus: {
        qixue: number;
        gongji: number;
        fangyu: number;
        sudu: number;
        baoji: number;
      }
    ) => {
      const total = getTotalAttr(get);
      const qixue = total.qixue + bonus.qixue;
      const gongji = total.gongji + bonus.gongji;
      const fangyu = total.fangyu + bonus.fangyu;
      const sudu = total.sudu + bonus.sudu;
      const baoji = total.baoji + bonus.baoji;
      return (
        Math.round(
          qixue / 10 + gongji * 2 + fangyu * 2 + sudu * 5 + baoji * 10
        ) +
        level * 1000
      );
    },
    [get]
  );

  const doFeisheng = useCallback(() => {
    const addAttr = get('addAttr') || {};
    set('addAttr', {
      ...addAttr,
      qixue: (addAttr.qixue || 0) + PER_LEVEL_BONUS.qixue,
      gongji: (addAttr.gongji || 0) + PER_LEVEL_BONUS.gongji,
      fangyu: (addAttr.fangyu || 0) + PER_LEVEL_BONUS.fangyu,
      sudu: (addAttr.sudu || 0) + PER_LEVEL_BONUS.sudu,
      baoji: (addAttr.baoji || 0) + PER_LEVEL_BONUS.baoji
    });
    set('feisheng', {
      realm: '仙界',
      level: 1,
      exp: 0,
      maxExp: 1000,
      power: calcPower(1, PER_LEVEL_BONUS)
    });
    JXToast('飞升成功！踏入仙界').show();
  }, [calcPower, get, set]);

  const handleFeisheng = () => {
    const xianyuan = get('xianyuan') || 0;
    const hasLingShi = chuwu.Has({ name: '灵石', type: CWType.QT }) !== -1;
    const lingShi = hasLingShi
      ? chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0
      : 0;
    const instance = JXModal.show({
      title: '飞升',
      content: (
        <JXSpace direction='vertical'>
          <Text>大乘圆满，感应仙界召唤，可举霞飞升！</Text>
          <Text>请选择飞升消耗：</Text>
          <JXButton
            block
            disabled={xianyuan < XIANYUAN_COST}
            onClick={() => {
              instance.close();
              if (xianyuan < XIANYUAN_COST) {
                JXToast(`仙缘不足，还差${XIANYUAN_COST - xianyuan}`).show();
                return;
              }
              set('xianyuan', xianyuan - XIANYUAN_COST);
              doFeisheng();
            }}
          >
            消耗仙缘 {XIANYUAN_COST}
          </JXButton>
          <JXButton
            block
            disabled={lingShi < LINGSHI_COST}
            onClick={() => {
              instance.close();
              if (lingShi < LINGSHI_COST) {
                JXToast(`灵石不足，还差${LINGSHI_COST - lingShi}`).show();
                return;
              }
              chuwu.Remove({
                name: '灵石',
                type: CWType.QT,
                num: LINGSHI_COST
              });
              doFeisheng();
            }}
          >
            消耗灵石 {LINGSHI_COST}
          </JXButton>
        </JXSpace>
      ),
      disableCancle: true,
      disableOk: true
    });
  };

  const handleAbsorb = () => {
    if (!feisheng) return;
    const shenshi = get('shenshi') || 0;
    if (shenshi < SHENSHI_COST) {
      JXToast(`神识不足，汲取仙气需要 ${SHENSHI_COST} 神识`).show();
      return;
    }
    if (feisheng.level >= MAX_LEVEL) {
      JXToast('仙力已达满级').show();
      return;
    }
    let { level } = feisheng;
    let exp = feisheng.exp + EXP_GAIN;
    let { maxExp } = feisheng;
    let leveled = false;
    while (exp >= maxExp && level < MAX_LEVEL) {
      exp -= maxExp;
      level += 1;
      maxExp = level * 1000;
      leveled = true;
    }
    if (leveled) {
      const addAttr = get('addAttr') || {};
      set('addAttr', {
        ...addAttr,
        qixue: (addAttr.qixue || 0) + PER_LEVEL_BONUS.qixue,
        gongji: (addAttr.gongji || 0) + PER_LEVEL_BONUS.gongji,
        fangyu: (addAttr.fangyu || 0) + PER_LEVEL_BONUS.fangyu,
        sudu: (addAttr.sudu || 0) + PER_LEVEL_BONUS.sudu,
        baoji: (addAttr.baoji || 0) + PER_LEVEL_BONUS.baoji
      });
    }
    set('shenshi', shenshi - SHENSHI_COST);
    set('feisheng', {
      realm: feisheng.realm,
      level,
      exp: level >= MAX_LEVEL ? Math.min(exp, maxExp) : exp,
      maxExp,
      power: calcPower(
        level,
        leveled
          ? PER_LEVEL_BONUS
          : { qixue: 0, gongji: 0, fangyu: 0, sudu: 0, baoji: 0 }
      )
    });
    JXToast(
      leveled
        ? `仙力提升至 ${level} 级！全属性增强`
        : `汲取仙气成功，仙力经验 +${EXP_GAIN}`
    ).show();
  };

  if (!feisheng) {
    return (
      <Container title='飞升' desc='大乘圆满，天地交感，可举霞飞升，踏入仙界。'>
        <JXSpace direction='vertical' gap={8} style={{ padding: '0 10px' }}>
          <Text size={16} bold>
            尚未飞升
          </Text>
          <Text>飞升条件：</Text>
          <Text color={realmOk ? 'green' : 'red'}>
            境界：{jingjie}（需达到「{lastRealm}」）{realmOk ? '已满足' : ''}
          </Text>
          <View className='feisheng-progress'>
            <View
              className='feisheng-progress__bar'
              style={{
                width: `${Math.min(100, (xiuwei / maxXiuwei) * 100)}%`
              }}
            />
          </View>
          <Text>
            修为：{Math.round(xiuwei)}/{Math.round(maxXiuwei)}（需达到
            {Math.round(maxXiuwei * 0.9)}）
          </Text>
          <Text color={xiuweiOk ? 'green' : 'red'}>
            修为进度：{xiuweiOk ? '已满足' : '尚未达到'}
          </Text>
          {!canFeisheng && <Text color='#888'>尚未达到飞升条件</Text>}
          <JXSpace center>
            <JXButton
              width={200}
              disabled={!canFeisheng}
              onClick={handleFeisheng}
            >
              飞升仙界
            </JXButton>
          </JXSpace>
          {canFeisheng && (
            <Text color='#888' size={13}>
              飞升消耗仙缘 {XIANYUAN_COST} 或灵石 {LINGSHI_COST}
            </Text>
          )}
        </JXSpace>
      </Container>
    );
  }

  const expPercent = Math.min(100, (feisheng.exp / feisheng.maxExp) * 100);

  return (
    <Container title='仙界' desc='已飞升至仙界，此为仙人修炼之地。'>
      <JXSpace direction='vertical' gap={8} style={{ padding: '0 10px' }}>
        <JXSpace between>
          <Text size={20} bold>
            仙域：{feisheng.realm}
          </Text>
          <Text color='#7b68ee'>
            仙力 Lv.{feisheng.level}/{MAX_LEVEL}
          </Text>
        </JXSpace>
        <Text>
          仙力经验：{feisheng.exp}/{feisheng.maxExp}
        </Text>
        <View className='feisheng-progress'>
          <View
            className='feisheng-progress__bar'
            style={{ width: `${expPercent}%` }}
          />
        </View>
        <Text color='gold'>仙力战力：{feisheng.power}</Text>
        <JXSpace style={{ margin: '10px 0' }}>
          <JXButton
            style={{ flex: 1 }}
            disabled={feisheng.level >= MAX_LEVEL}
            onClick={handleAbsorb}
          >
            汲取仙气
          </JXButton>
        </JXSpace>
        <Text bold>每级加成（当前已获 {feisheng.level} 级）</Text>
        <Text>气血 +{PER_LEVEL_BONUS.qixue}/级</Text>
        <Text>攻击 +{PER_LEVEL_BONUS.gongji}/级</Text>
        <Text>防御 +{PER_LEVEL_BONUS.fangyu}/级</Text>
        <Text>速度 +{PER_LEVEL_BONUS.sudu}/级</Text>
        <Text>暴击 +{PER_LEVEL_BONUS.baoji}/级</Text>
        <Text color='#888' size={13}>
          汲取仙气：消耗 {SHENSHI_COST} 神识，获得 {EXP_GAIN} 仙力经验，满级{' '}
          {MAX_LEVEL} 级
        </Text>
      </JXSpace>
    </Container>
  );
}

export default Feisheng;
