import { Container, JXButton, JXSpace } from '@/components';
import { useLoad } from '@tarojs/taro';
import './index.less';

export default function ShilianList() {
  useLoad(() => {
    console.log('Page loaded.');
  });

  return (
    <Container
      title='试炼大陆'
      desc='远古九神宗九位神尊以大修为在九界开辟了九座秘境，以供九界修士磨练，在这里将禁止一切术法，修士将面临强大的妖兽！'
    >
      <JXSpace direction='vertical' center>
        <JXButton color='white' style={{ background: '#aaa' }}>
          试炼之地（炼气期）
        </JXButton>
        <JXButton color='white' style={{ background: '#aaa' }}>
          血色祭炼（炼气期）
        </JXButton>
        <JXButton color='white' style={{ background: '#aaa' }}>
          云荒大漠（筑基期）
        </JXButton>
        <JXButton color='white' style={{ background: '#aaa' }}>
          魂殁残界（筑基期）
        </JXButton>
        <JXButton color='white' style={{ background: '#aaa' }}>
          尊者洞府（结丹期）
        </JXButton>
        <JXButton color='white' style={{ background: '#aaa' }}>
          南城古迹（元婴期）
        </JXButton>
      </JXSpace>
    </Container>
  );
}
