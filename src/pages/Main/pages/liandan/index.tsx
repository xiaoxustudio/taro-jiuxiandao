import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  List,
  ListItemData,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import danfangData from '@/assets/danfang.json';
import { ActorDataConfigForZhanDou } from '@/types';
import { AttrTransformChinese } from '@/utils';
import './index.less';

function ModalContent({ name, itype, desc, attr }: any) {
  const [num, setNum] = useState(1);
  return (
    <JXSpace direction='vertical'>
      <Text size={20} bold>
        {name}
      </Text>
      <Text>品阶：{itype}</Text>
      <Text>描述：{desc}</Text>
      <JXSpace direction='vertical' title='属性'>
        {Object.keys(attr).map((item) => (
          <Text key={attr[item]}>
            {AttrTransformChinese(item as keyof ActorDataConfigForZhanDou)}：
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
        <Text>
          炼制数量：{num}
          <JXSpace direction='vertical'>
            <Box>
              <JXButton onClick={() => setNum(Math.max(num - 1, 1))}>
                -1
              </JXButton>
              <JXButton onClick={() => setNum(Math.max(num - 10, 1))}>
                -10
              </JXButton>
              <JXButton onClick={() => setNum(Math.max(num - 100, 1))}>
                -100
              </JXButton>
            </Box>
            <Box>
              <JXButton onClick={() => setNum(num + 1)}>+1</JXButton>
              <JXButton onClick={() => setNum(num + 10)}>+10</JXButton>
              <JXButton onClick={() => setNum(num + 100)}>+100</JXButton>
            </Box>
          </JXSpace>
        </Text>
      </JXSpace>
    </JXSpace>
  );
}

export default function Liandan() {
  const { get } = useActorController();
  const list = useMemo(
    () =>
      get('danfang').map(
        (v) =>
          ({
            key: danfangData[v.id],
            title: (
              <Box>
                {danfangData[v.id].name}（经验: {v.exp}）
              </Box>
            ),
            value: danfangData[v.id].desc,
            click() {
              const data = danfangData[v.id];
              const instance = JXModal.show({
                content: <ModalContent {...data} />,
                okText: '炼制',
                onOk() {
                  instance.close();
                },
                onCancel() {
                  instance.close();
                }
              });
            }
          }) as ListItemData
      ),
    [get]
  );
  return (
    <Container
      title='炼丹'
      desc='丹心，丹魂，丹尘。要想登上那天师之阶，只有找到自己的路，唉，不要，只看到那丹方，蒙蔽了丹心……未来，还是要看自己啊！'
    >
      <JXSpace className='attr' direction='vertical'>
        <Text>称号: {get('liandan.chenghao')}</Text>
        <Text>丹韵: {get('liandan.danyun')}</Text>
        <Text>丹炉: {get('liandan.danlu.name', '无')}</Text>
        <Text>丹名: {get('liandan.danyao.id', '无')}</Text>
        <Text>
          炼丹经验: {get('liandan.exp')}/{get('liandan.max_exp')}
        </Text>
        <Text>剩余时间: {get('liandan.shengyuTime')}</Text>
        <Text>
          预计收获: {get('liandan.danyao') ? get('liandan.danyao.num') : '无'}
        </Text>
      </JXSpace>
      <List list={list} />
    </Container>
  );
}
