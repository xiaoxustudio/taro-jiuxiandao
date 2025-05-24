import { useMemo, useState } from 'react';
import fsAssets from '@/assets/fs.json';
import danfangData from '@/assets/danfang.json';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  Scroll,
  Text
} from '@/components';
import { ActorDataConfigForZhanDou, CWType } from '@/types';
import { AttrTransformChinese } from '@/utils';
import chuwu from '@/utils/chuwu';
import useContainer from '@/hooks/useContainer';
import './index.less';

export default function Fangshi() {
  const [type, setType] = useState(0);
  const container = useContainer();
  const list = useMemo(() => {
    let targetList: any;
    switch (type) {
      case 0:
        targetList = fsAssets.fb;
        break;
      case 1:
        targetList = fsAssets.dy.map((v) => ({
          ...danfangData[v],
          type: 1,
          ls: danfangData[v].ls * 0.9
        }));
        break;
      case 5:
        targetList = fsAssets.dy.map((v) => ({
          ...danfangData[v],
          name: `${danfangData[v].name}丹方`,
          id: v
        }));
        break;
    }
    return targetList.map((v, index) => ({
      ...v,
      title: (
        <Box>
          <Text>{v.name}</Text>
          <JXSpace between>
            <Text>灵石：{v.ls}</Text>
            <Text align='right'>{v.itype}</Text>
          </JXSpace>
        </Box>
      ),
      key: `${v.name}-${index}`,
      click() {
        const instance = JXModal.show({
          okText: '购买',
          content: (
            <JXSpace direction='vertical'>
              <Text size={20} bold>
                {v.name}
              </Text>
              {v.pj && <Text>品阶：{v.pj}</Text>}
              <Text>
                {[1, 5].includes(v.type) ? (
                  <>品阶：{v.itype}</>
                ) : (
                  <>类型：{v.itype}</>
                )}
              </Text>
              <Text>描述：{v.desc}</Text>
              <JXSpace direction='vertical' title='属性'>
                {Object.keys(v.attr).map((item) => (
                  <Text key={v.attr[item]}>
                    {AttrTransformChinese(
                      item as keyof ActorDataConfigForZhanDou
                    )}
                    ：
                    {v.attr[item] >= 0 ? (
                      <Text color='green' inline>
                        + {v.attr[item]}
                      </Text>
                    ) : (
                      <Text color='red' inline>
                        {v.attr[item]}
                      </Text>
                    )}
                  </Text>
                ))}
                <Text>售价：{v.ls}</Text>
              </JXSpace>
            </JXSpace>
          ),
          onOk() {
            instance.close();
            // eslint-disable-next-line no-bitwise
            if (~chuwu.Has(v) && !v.isPile) {
              JXToast('已拥有该物品！').show();
              return;
            }
            if (chuwu.LingShiThan(v.ls)) {
              switch (type) {
                case 0:
                  chuwu.Add(v);
                  JXToast(`购买物品：${v.name}`).show();
                  break;
                case 5:
                  chuwu.AddDanFang(v.id);
                  JXToast(`购买丹方：${v.name}`).show();
                  break;
              }
              chuwu.Remove({ name: '灵石', type: CWType.QT, num: v.ls });
            } else {
              const needLS = chuwu.Get({ name: '灵石', type: CWType.QT });
              JXToast(`灵石不足，还差${v.ls - needLS!.num!}`).show();
            }
          },
          onCancel() {
            instance.close();
          }
        });
      }
    }));
  }, [type]);
  return (
    <Container
      title='坊市'
      desc='云雾散开，寻路符渐渐失效，一座灵气浓郁，建筑华丽的坊市出现在你的面前…'
      context={container}
      scroll
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
      {[0, 1, 5].includes(type) && (
        <Scroll calc={container.calcHeight + 50}>
          <List list={list} noFlex />
        </Scroll>
      )}
    </Container>
  );
}
