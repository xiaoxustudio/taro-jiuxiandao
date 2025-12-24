import { useCallback, useEffect, useState } from 'react';
import { Container, JXButton, JXSpace, Text } from '@/components';
import { FabaoType, FBItemType } from '@/types';
import { getFaBao, TakeOffFaBao } from '@/utils/fabao';
import './index.less';

export default function Fabao() {
  const [type, setType] = useState(FabaoType.头戴战盔);
  const [targetFB, setTargetFB] = useState<FBItemType | null>(null);

  const updateInfo = useCallback(() => {
    setTargetFB(getFaBao(type));
  }, [type]);

  const handleTakeOffFaBao = useCallback(() => {
    TakeOffFaBao(type);
    updateInfo();
  }, [type, updateInfo]);

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
          攻击：{targetFB?.attr.gongji || 0}
        </Text>
        <Text className='item' color='#888' bold>
          防御：{targetFB?.attr.fangyu || 0}
        </Text>
        <Text className='item' color='#888' bold>
          气血：{targetFB?.attr.qixue || 0}
        </Text>
        <Text className='item' color='#888' bold>
          攻速：{targetFB?.attr.sudu || 0}
        </Text>
        <Text className='item' color='#888' bold>
          暴击：{targetFB?.attr.baoji || 0}
        </Text>
        <Text className='item' color='#888' bold>
          仙缘：{targetFB?.attr.xianyuan || 0}
        </Text>
      </JXSpace>
      <JXSpace flexOne>
        <JXButton disabled={!targetFB} width='100%'>
          强化
        </JXButton>
        <JXButton disabled={!targetFB} width='100%'>
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
