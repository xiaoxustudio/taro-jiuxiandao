import { useMemo, useState } from 'react';
import { fangshiCategories, FangshiCategoryKey } from '@/assets/fangshi';
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
  const [type, setType] = useState<FangshiCategoryKey>(
    fangshiCategories[0].key
  );
  const container = useContainer();
  const currentCategory = useMemo(
    () => fangshiCategories.find((item) => item.key === type),
    [type]
  );
  const list = useMemo(() => {
    const targetList = currentCategory?.list() ?? [];
    const action = currentCategory?.action;
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
      value: '',
      key: `${v.name}-${index}`,
      click() {
        const attr = v.attr ?? {};
        const attrKeys = Object.keys(attr);
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
              {attrKeys.length ? (
                <JXSpace direction='vertical' title='属性'>
                  {attrKeys.map((item) => (
                    <Text key={attr[item]}>
                      {AttrTransformChinese(
                        item as keyof ActorDataConfigForZhanDou
                      )}
                      ：
                      {attr[item] >= 0 ? (
                        <Text color='green' inline>
                          + {attr[item]}
                        </Text>
                      ) : (
                        <Text color='red' inline>
                          {attr[item]}
                        </Text>
                      )}
                    </Text>
                  ))}
                  <Text>售价：{v.ls}</Text>
                </JXSpace>
              ) : (
                <Text>售价：{v.ls}</Text>
              )}
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
              if (action === 'danfang') {
                if (v.id) {
                  chuwu.AddDanFang(v.id);
                  JXToast(`购买丹方：${v.name}`).show();
                } else {
                  JXToast('丹方数据异常').show();
                  return;
                }
              } else {
                chuwu.Add(v);
                JXToast(`购买物品：${v.name}`).show();
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
  }, [currentCategory]);
  const lsMemo = useMemo(
    () => chuwu.Get({ name: '灵石', type: CWType.QT }),
    []
  );

  return (
    <Container
      title='坊市'
      desc='云雾散开，寻路符渐渐失效，一座灵气浓郁，建筑华丽的坊市出现在你的面前…'
      context={container}
      scroll
    >
      <Text style={{ width: '100%', marginBottom: '10px' }}>
        灵石：{lsMemo?.num || 0}
      </Text>
      <JXSpace gap={10} style={{ width: '100%' }} hscroll>
        {fangshiCategories.map((item) => (
          <JXButton
            key={item.key}
            width='100px'
            onClick={() => setType(item.key)}
          >
            {item.label}
          </JXButton>
        ))}
      </JXSpace>
      {currentCategory && (
        <Scroll calc={container.calcHeight + 50}>
          <List list={list} noFlex />
        </Scroll>
      )}
    </Container>
  );
}
