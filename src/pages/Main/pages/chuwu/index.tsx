import { Container, JXButton, JXSpace, Paragraph } from '@/components';
import useActorController from '@/hooks/useActorController';
import { BaseType, CWType } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import './index.less';

export default function Chuwu() {
  const { get } = useActorController();
  const [list, setList] = useState<BaseType[]>([]); // 列表
  const [type, setType] = useState<CWType>(CWType.FB);
  const updateChuWu = useCallback(() => {
    setList([]);
    const target = get('cw');
    switch (type) {
      case CWType.FB:
        setList(target['fb']);
        break;
      case CWType.QT:
        setList(target['qt']);
        break;
      case CWType.DY:
        setList(target['dy']);
        break;
    }
  }, [get, type]);
  useEffect(() => {
    updateChuWu();
  }, [type, updateChuWu]);

  return (
    <Container
      title='储物'
      desc='储物空间，可纳世间万物，大神通者，一袖乾坤，可纳山岳….'
    >
      <JXSpace gap={10} style={{ width: '100%' }} center flexOne>
        <JXButton width='100%' onClick={() => setType(CWType.FB)}>
          法宝
        </JXButton>
        <JXButton width='100%' onClick={() => setType(CWType.DY)}>
          丹药
        </JXButton>
        <JXButton width='100%' onClick={() => setType(CWType.QT)}>
          其他
        </JXButton>
      </JXSpace>
      <JXSpace flexOne>
        {list &&
          list.map((v, index) => {
            return (
              <Paragraph
                className='m-chuwu-List__Item'
                key={`${v.name}${index}`}
              >
                {v.name}
              </Paragraph>
            );
          })}
      </JXSpace>
    </Container>
  );
}
