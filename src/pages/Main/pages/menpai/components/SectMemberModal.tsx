import { View } from '@tarojs/components';
import { JXButton, JXModal, JXSpace, Text } from '@/components';
import type { SectMember } from '@/types';
import '../index.less';

interface SectMemberModalProps {
  visible: boolean;
  onClose: () => void;
  members: SectMember[];
  onOpenMember: (member: SectMember) => void;
}

function SectMemberModal({
  visible,
  onClose,
  members,
  onOpenMember
}: SectMemberModalProps) {
  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={10}>
        <Text bold>宗门成员</Text>
        <View className='menpai-modal-list'>
          {members.map((member) => (
            <View key={member.id} className='menpai-member-row'>
              <Text>
                {member.name}（{member.role}·{member.jingjie}
                {member.jingjie1}
                {member.jingjie2}）
              </Text>
              <JXButton size='mini' onClick={() => onOpenMember(member)}>
                详情
              </JXButton>
            </View>
          ))}
        </View>
      </JXSpace>
    </JXModal>
  );
}

export default SectMemberModal;
