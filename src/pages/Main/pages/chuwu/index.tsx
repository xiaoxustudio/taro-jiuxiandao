import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  Scroll,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import {
  ActorDataConfigForZhanDou,
  BaseType,
  CWType,
  FBItemType
} from '@/types';
import { AttrTransformChinese } from '@/utils';
import { WearFaBao } from '@/utils/fabao';
import useScroll from '@/hooks/useScroll';
import './index.less';

export default function Chuwu() {
  const { get } = useActorController();
  const [list, setList] = useState<BaseType[]>([]); // 列表
  const scrollHook = useScroll();
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [select, setSelect] = useState<BaseType | null>(null);
  const [type, setType] = useState<CWType>(CWType.FB);

  const updateChuWu = useCallback(() => {
    setList([]);
    const target = get('cw');
    switch (type) {
      case CWType.FB:
        setList(target.fb);
        break;
      case CWType.QT:
        setList(target.qt);
        break;
      case CWType.DY:
        setList(target.dy);
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
        <JXButton
          width='100%'
          onClick={() => {
            setType(CWType.FB);
            setSelect(null);
          }}
        >
          法宝
        </JXButton>
        <JXButton
          width='100%'
          onClick={() => {
            setType(CWType.DY);
            setSelect(null);
          }}
        >
          丹药
        </JXButton>
        <JXButton
          width='100%'
          onClick={() => {
            setType(CWType.QT);
            setSelect(null);
          }}
        >
          其他
        </JXButton>
      </JXSpace>
      <Scroll Scroll={scrollHook} style={{ padding: '0 4px' }}>
        {list &&
          list.map((v, index) => {
            return (
              <Box
                className='m-chuwu-List__Item'
                key={`${v.name}${index}`}
                onClick={() => {
                  let content: ReactNode;
                  if (v.type === CWType.FB) {
                    const ReItem = v as FBItemType;
                    content = (
                      <>
                        <Text size={20} bold>
                          {ReItem.name}
                        </Text>
                        <JXSpace direction='vertical' title='属性'>
                          {Object.keys(ReItem.attr).map((item) => (
                            <Text key={ReItem.attr[item]}>
                              {AttrTransformChinese(
                                item as keyof ActorDataConfigForZhanDou
                              )}
                              ：
                              {ReItem.attr[item] >= 0 ? (
                                <Text color='green' inline>
                                  {ReItem.attr[item]}
                                </Text>
                              ) : (
                                <Text color='red' inline>
                                  {ReItem.attr[item]}
                                </Text>
                              )}
                            </Text>
                          ))}
                        </JXSpace>
                      </>
                    );
                    const { close } = JXModal.show({
                      content,
                      okText: '装备',
                      onOk() {
                        WearFaBao(index);
                        updateChuWu();
                        close();
                      },
                      onCancel() {
                        close();
                      }
                    });
                  }
                  setSelect(v);
                }}
                shadow
              >
                {v.name}
                <Text>数量：{v.num}</Text>
              </Box>
            );
          })}
      </Scroll>
    </Container>
  );
}
