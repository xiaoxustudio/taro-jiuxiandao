import { useCallback, useEffect, useState } from 'react';
import { Container, JXButton, JXSpace, JXToast, Text } from '@/components';
import { FabaoType, FBItemType, CWType } from '@/types';
import { getFaBao, TakeOffFaBao } from '@/utils/fabao';
import useActorController from '@/hooks/useActorController';
import chuwu from '@/utils/chuwu';
import './index.less';

export default function Fabao() {
  const { get, set } = useActorController();
  const [type, setType] = useState(FabaoType.头戴战盔);
  const [targetFB, setTargetFB] = useState<FBItemType | null>(null);

  const updateInfo = useCallback(() => {
    setTargetFB(getFaBao(type));
  }, [type]);

  const handleTakeOffFaBao = useCallback(() => {
    TakeOffFaBao(type);
    updateInfo();
  }, [type, updateInfo]);

  const handleStrengthen = useCallback(() => {
    if (!targetFB) return;
    const costLs = (targetFB.lv + 1) * 500 + 500;
    const currentLs = chuwu.getLingshi();
    if (currentLs < costLs) {
      JXToast(`灵石不足，需要${costLs}灵石`).show();
      return;
    }
    const successRate = Math.max(0.05, 1 - targetFB.lv * 0.05);
    if (Math.random() < successRate) {
      chuwu.payLingshi(costLs);
      const updatedFB: FBItemType = { ...targetFB, lv: targetFB.lv + 1 };
      const slotName = targetFB.itype;
      const currentFabao = get('fabao');
      set('fabao', { ...currentFabao, [slotName]: updatedFB });
      JXToast(`强化成功！${targetFB.name} 提升至 +${updatedFB.lv}`).show();
    } else {
      chuwu.payLingshi(Math.floor(costLs * 0.5));
      JXToast(`强化失败，消耗${Math.floor(costLs * 0.5)}灵石`).show();
    }
    updateInfo();
  }, [targetFB, updateInfo, get, set]);

  const handleUpgrade = useCallback(() => {
    if (!targetFB) return;
    const tierOrder = [
      '法器',
      '灵器',
      '法宝',
      '古宝',
      '灵宝',
      '后天灵宝',
      '先天灵宝',
      '通天灵宝'
    ];
    const curIdx = tierOrder.indexOf(targetFB.pj);
    if (curIdx < 0 || curIdx >= tierOrder.length - 1) {
      JXToast('已达最高品阶，无法继续升阶').show();
      return;
    }
    const costLs = (curIdx + 1) * 3000;
    const currentLs = chuwu.getLingshi();
    if (currentLs < costLs) {
      JXToast(`灵石不足，需要${costLs}灵石`).show();
      return;
    }
    chuwu.payLingshi(costLs);
    const nextPj = tierOrder[curIdx + 1];
    const updatedFB: FBItemType = {
      ...targetFB,
      pj: nextPj,
      attr: { ...targetFB.attr }
    };
    Object.keys(updatedFB.attr).forEach((k) => {
      const key = k as keyof typeof updatedFB.attr;
      const val = updatedFB.attr[key];
      if (typeof val === 'number') {
        updatedFB.attr[key] = Math.round(
          val >= 0 ? val * 1.3 : val / 1.3
        ) as any;
      }
    });
    TakeOffFaBao(type);
    chuwu.Remove({ name: targetFB.name, type: CWType.FB });
    chuwu.Add({ ...updatedFB, type: CWType.FB });
    JXToast(`升阶成功！${targetFB.name} 晋升为${nextPj}`).show();
    updateInfo();
  }, [targetFB, updateInfo, type]);

  useEffect(() => {
    updateInfo();
  }, [type, updateInfo]);

  return (
    <Container
      title='法宝'
      desc='修仙之道，在于内外，内修元神，外修法宝！法宝有灵，以元神之火锻造，可撼天地…'
    >
      <JXSpace gap={10} style={{ width: '100%', marginBottom: '10px' }} hscroll>
        <JXButton width='100px' onClick={() => setType(FabaoType.手持武器)}>
          手持武器
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.头戴战盔)}>
          头戴战盔
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.身穿战甲)}>
          身穿战甲
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.腰带护具)}>
          腰带护具
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.饰品加持)}>
          饰品加持
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.鞋子护腿)}>
          鞋子护腿
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.魂器镇魂)}>
          魂器镇魂
        </JXButton>
        <JXButton width='100px' onClick={() => setType(FabaoType.本名法宝)}>
          本名法宝
        </JXButton>
      </JXSpace>
      <JXSpace
        style={{ background: 'white', marginBottom: '10px', padding: '10px' }}
        direction='vertical'
        flexOne
      >
        <Text className='item' color='#888' bold>
          名称：{targetFB?.name ? `${targetFB.name}（+${targetFB.lv}）` : '空'}
        </Text>
        <Text className='item' color='#888' bold>
          类型：{targetFB?.itype || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          品阶：{targetFB?.pj || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          攻击：{targetFB?.attr?.gongji || 0}
        </Text>
        <Text className='item' color='#888' bold>
          防御：{targetFB?.attr?.fangyu || 0}
        </Text>
        <Text className='item' color='#888' bold>
          气血：{targetFB?.attr?.qixue || 0}
        </Text>
        <Text className='item' color='#888' bold>
          攻速：{targetFB?.attr?.sudu || 0}
        </Text>
        <Text className='item' color='#888' bold>
          暴击：{targetFB?.attr?.baoji || 0}
        </Text>
        <Text className='item' color='#888' bold>
          仙缘：{targetFB?.attr?.xianyuan || 0}
        </Text>
      </JXSpace>
      <JXSpace flexOne>
        <JXButton disabled={!targetFB} width='100%' onClick={handleStrengthen}>
          强化
        </JXButton>
        <JXButton disabled={!targetFB} width='100%' onClick={handleUpgrade}>
          升阶
        </JXButton>
        <JXButton
          disabled={!targetFB}
          width='100%'
          onClick={handleTakeOffFaBao}
        >
          卸下
        </JXButton>
      </JXSpace>
    </Container>
  );
}
