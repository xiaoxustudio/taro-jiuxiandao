import { View } from '@tarojs/components';
import { JXModal, JXSpace, Text } from '@/components';
import type { SectMember } from '@/types';
import '../index.less';

interface SectMemberDetailModalProps {
  visible: boolean;
  onClose: () => void;
  member: SectMember | null;
}

function SectMemberDetailModal({
  visible,
  onClose,
  member
}: SectMemberDetailModalProps) {
  if (!member) return null;

  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={6}>
        <Text bold>
          {member.name}（{member.role}）
        </Text>
        <Text>
          境界：{member.jingjie}
          {member.jingjie1}
          {member.jingjie2}
        </Text>
        <Text>关系：{member.relation}</Text>
        <Text>亲密度：{member.intimacy}</Text>
        <Text>入门日：第{member.joinDay}日</Text>
        <Text>气血：{member.attr.qixue || 0}</Text>
        <Text>攻击：{member.attr.gongji || 0}</Text>
        <Text>防御：{member.attr.fangyu || 0}</Text>
        <Text>速度：{member.attr.sudu || 0}</Text>
        <Text>暴击：{member.attr.baoji || 0}</Text>
        <View className='menpai-bag'>
          <Text bold>储物袋</Text>
          <Text>
            容量：
            {member.cw.fb.length + member.cw.dy.length + member.cw.qt.length}/
            {member.cw.max}
          </Text>
          <View className='menpai-bag-section'>
            <Text className='menpai-bag-title'>法宝</Text>
            <View className='menpai-bag-items'>
              {member.cw.fb.length ? (
                member.cw.fb.map((item, index) => (
                  <Text
                    key={`fb-${member.id}-${index}`}
                    className='menpai-bag-item'
                  >
                    {item.name}
                    {item.num ? `×${item.num}` : ''}
                  </Text>
                ))
              ) : (
                <Text className='menpai-bag-empty'>暂无</Text>
              )}
            </View>
          </View>
          <View className='menpai-bag-section'>
            <Text className='menpai-bag-title'>丹药</Text>
            <View className='menpai-bag-items'>
              {member.cw.dy.length ? (
                member.cw.dy.map((item, index) => (
                  <Text
                    key={`dy-${member.id}-${index}`}
                    className='menpai-bag-item'
                  >
                    {item.name}
                    {item.num ? `×${item.num}` : ''}
                  </Text>
                ))
              ) : (
                <Text className='menpai-bag-empty'>暂无</Text>
              )}
            </View>
          </View>
          <View className='menpai-bag-section'>
            <Text className='menpai-bag-title'>其他</Text>
            <View className='menpai-bag-items'>
              {member.cw.qt.length ? (
                member.cw.qt.map((item, index) => (
                  <Text
                    key={`qt-${member.id}-${index}`}
                    className='menpai-bag-item'
                  >
                    {item.name}
                    {item.num ? `×${item.num}` : ''}
                  </Text>
                ))
              ) : (
                <Text className='menpai-bag-empty'>暂无</Text>
              )}
            </View>
          </View>
        </View>
      </JXSpace>
    </JXModal>
  );
}

export default SectMemberDetailModal;
