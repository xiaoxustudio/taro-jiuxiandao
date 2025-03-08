import { Container, JXButton, JXSpace, Text } from '@/components';
import { FabaoType } from '@/types';
import { getFaBao } from '@/utils/fabao';
import { useMemo, useState } from 'react';
import './index.less';

export default function Fabao() {
  const [type, setType] = useState(FabaoType.头戴战盔);
  const targetFB = useMemo(() => getFaBao(type), [type]);

  return (
    <Container
      title='法宝'
      desc='修仙之道，在于内外，内修元神，外修法宝！法宝有灵，以元神之火锻造，可撼天地…'
    >
      <JXSpace gap={10} style={{ width: '100%' }} hscroll>
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
          名称：{targetFB?.name || '空'}（+{}）
        </Text>
        <Text className='item' color='#888' bold>
          类型：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          品阶：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          攻击：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          防御：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          气血：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          攻速：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          暴击：{targetFB?.name || '空'}
        </Text>
        <Text className='item' color='#888' bold>
          仙缘：{targetFB?.name || '空'}
        </Text>
      </JXSpace>
    </Container>
  );
}
