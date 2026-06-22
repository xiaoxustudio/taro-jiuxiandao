import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  Scroll,
  Text,
  JXToast
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
import chuwu from '@/utils/chuwu';
import useScroll from '@/hooks/useScroll';
import './index.less';

export default function Chuwu() {
  const { get } = useActorController();
  const [list, setList] = useState<BaseType[]>([]); // 列表
  const scrollHook = useScroll();
  const [type, setType] = useState<CWType>(CWType.FB);

  const cw = get('cw');
  const totalSlots =
    (cw?.fb?.length || 0) + (cw?.dy?.length || 0) + (cw?.qt?.length || 0);
  const maxSlots = cw?.max || 30;

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
      <JXSpace
        direction='vertical'
        style={{ width: '100%', marginBottom: '6px' }}
      >
        <Text>
          容量：{totalSlots}/{maxSlots}
        </Text>
        <JXSpace gap={10} style={{ width: '100%' }} center flexOne>
          <JXButton
            width='100%'
            onClick={() => {
              setType(CWType.FB);
            }}
          >
            法宝({cw?.fb?.length || 0})
          </JXButton>
          <JXButton
            width='100%'
            onClick={() => {
              setType(CWType.DY);
            }}
          >
            丹药({cw?.dy?.length || 0})
          </JXButton>
          <JXButton
            width='100%'
            onClick={() => {
              setType(CWType.QT);
            }}
          >
            其他({cw?.qt?.length || 0})
          </JXButton>
        </JXSpace>
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
                          {(
                            Object.keys(
                              ReItem.attr
                            ) as (keyof ActorDataConfigForZhanDou)[]
                          ).map((item) => (
                            <Text key={String(ReItem.attr[item])}>
                              {AttrTransformChinese(item)}：
                              {(ReItem.attr[item] ?? 0) >= 0 ? (
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
                  } else if (v.type === CWType.DY) {
                    content = (
                      <>
                        <Text size={20} bold>
                          {v.name}
                        </Text>
                        <Text>数量：{v.num}</Text>
                      </>
                    );
                    const { close } = JXModal.show({
                      content,
                      okText: '使用',
                      onOk() {
                        const ok = chuwu.UsePill(v.name);
                        if (ok) {
                          JXToast(`使用${v.name}成功！`).show();
                          updateChuWu();
                        } else {
                          JXToast('使用失败！').show();
                        }
                        close();
                      },
                      onCancel() {
                        close();
                      }
                    });
                  }
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
