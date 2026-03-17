import { View } from '@tarojs/components';
import { JXButton, JXModal, JXSpace, Paragraph, Text } from '@/components';
import { buildTaskRewardLabel, getRoleLevel } from '@/utils/zongmen';
import type { SectTaskConfig } from '@/utils/zongmen';
import '../index.less';

interface SectTaskModalProps {
  visible: boolean;
  onClose: () => void;
  taskList: SectTaskConfig[];
  taskDoneCount: number;
  maxTaskCount: number;
  taskRemaining: number;
  roleLevel: number;
  onTakeTask: (task: SectTaskConfig) => void;
}

function SectTaskModal({
  visible,
  onClose,
  taskList,
  taskDoneCount,
  maxTaskCount,
  taskRemaining,
  roleLevel,
  onTakeTask
}: SectTaskModalProps) {
  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={8}>
        <Text bold>宗门任务</Text>
        <Text>
          今日任务：已完成{taskDoneCount}/{maxTaskCount}（剩余{taskRemaining}）
        </Text>
        <View className='menpai-modal-list'>
          {taskList.map((task) => (
            <View key={task.key} className='menpai-member-row'>
              <View>
                <Text>{task.name}</Text>
                <Paragraph>{task.desc}</Paragraph>
                <Text>{buildTaskRewardLabel(task)}</Text>
                {roleLevel < getRoleLevel(task.minRole) ? (
                  <Text>需要职位：{task.minRole}</Text>
                ) : null}
              </View>
              <JXButton
                size='mini'
                disabled={
                  taskRemaining <= 0 || roleLevel < getRoleLevel(task.minRole)
                }
                onClick={() => onTakeTask(task)}
              >
                领取
              </JXButton>
            </View>
          ))}
        </View>
      </JXSpace>
    </JXModal>
  );
}

export default SectTaskModal;
