import { Text } from '@tarojs/components';
import { Container, JXSpace } from '@/components';
import './index.less';

export default function Liandan() {
  return (
    <Container
      title='炼丹'
      desc='丹心，丹魂，丹尘。要想登上那天师之阶，只有找到自己的路，唉，不要，只看到那丹方，蒙蔽了丹心……未来，还是要看自己啊！'
    >
      <JXSpace className='attr' direction='vertical'>
        <Text>称号: XXX</Text>
        <Text>丹韵: XXX</Text>
        <Text>丹炉: XXX</Text>
        <Text>丹名: XXX</Text>
        <Text>剩余时间: XXX</Text>
        <Text>预计收获: XXX</Text>
      </JXSpace>
    </Container>
  );
}
