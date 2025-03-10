import fsAssets from '@/assets/fs.json';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  Text
} from '@/components';
import { ActorDataConfigForZhanDou } from '@/types';
import { AttrTransformChinese } from '@/utils';
import chuwu from '@/utils/chuwu';
import { useMemo, useState } from 'react';
import { CWType } from '../../../../types';
import './index.less';

export default function Fangshi() {
  const [type, setType] = useState(0);
  const list = useMemo(() => {
    return fsAssets.fb.map((v, index) => ({
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
      value: v.name,
      click() {
        const instance = JXModal.show({
          okText: '购买',
          content: (
            <JXSpace direction='vertical'>
              <Text size={20} bold>
                {v.name}
              </Text>
              <Text>品阶：{v.pj}</Text>
              <Text>类型：{v.itype}</Text>
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
            if (~chuwu.Has(v) && !v.isPile) {
              JXToast('已拥有该物品！').show();
              return;
            }
            if (chuwu.LingShiThan(v.ls)) {
              chuwu.Add(v);
              chuwu.Remove({ name: '灵石', type: CWType.QT, num: v.ls });
              JXToast(`购买物品：${v.name}`).show();
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
  }, []);
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
      {type === 0 && <List list={list} />}
    </Container>
  );
}
