import { Text } from '@tarojs/components';
import { useMemo } from 'react';
import { Box, Container, JXSpace, List } from '@/components';
import useActorController from '@/hooks/useActorController';
import danfangData from '@/assets/danfang.json';
import './index.less';

export default function Liandan() {
  const { get } = useActorController();
  const list = useMemo(
    () =>
      get('danfang').map((v) => ({
        key: danfangData[v.id],
        title: (
          <Box>
            {danfangData[v.id].name}（经验: {v.exp}）
          </Box>
        ),
        value: danfangData[v.id].desc
      })),
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
