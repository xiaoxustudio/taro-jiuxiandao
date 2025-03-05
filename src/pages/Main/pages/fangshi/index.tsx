import { Container, JXButton, JXSpace } from '@/components';
import { useState } from 'react';
import './index.less';

export default function Fangshi() {
  const [type, setType] = useState(0);
  return (
    <Container
      title='坊市'
      desc='云雾散开，寻路符渐渐失效，一座灵气浓郁，建筑华丽的坊市出现在你的面前…'
    >
      <JXSpace gap={10} style={{ width: '100%' }} hscroll>
        <JXButton width='100px' onClick={() => setType(0)}>
          法宝
        </JXButton>
        <JXButton width='100px' onClick={() => setType(1)}>
          丹药
        </JXButton>
        <JXButton width='100px' onClick={() => setType(2)}>
          材料
        </JXButton>
        <JXButton width='100px' onClick={() => setType(3)}>
          道具
        </JXButton>
        <JXButton width='100px' onClick={() => setType(4)}>
          其他
        </JXButton>
        <JXButton width='100px' onClick={() => setType(5)}>
          丹方
        </JXButton>
      </JXSpace>
    </Container>
  );
}
