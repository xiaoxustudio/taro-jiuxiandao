import { Container, JXButton, JXSpace } from '@/components';
import './index.less';

export default function Shilian() {
  return (
    <Container>
      <JXSpace gap={5}>
        <JXButton>探索</JXButton>
        <JXButton>挂机</JXButton>
        <JXButton>挂机详情</JXButton>
        <JXButton>停挂</JXButton>
        <JXButton>主页</JXButton>
      </JXSpace>
      <JXSpace gap={5}>
        <JXButton>战斗</JXButton>
        <JXButton>查看</JXButton>
        <JXButton>副本</JXButton>
        <JXButton>材料</JXButton>
        <JXButton>战况</JXButton>
      </JXSpace>
    </Container>
  );
}
