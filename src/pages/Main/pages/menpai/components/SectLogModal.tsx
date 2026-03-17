import { View } from '@tarojs/components';
import { JXModal, JXSpace, Paragraph, Text } from '@/components';
import '../index.less';

interface SectLogModalProps {
  visible: boolean;
  onClose: () => void;
  logs: { day: number; text: string }[];
}

function SectLogModal({ visible, onClose, logs }: SectLogModalProps) {
  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={10}>
        <Text bold>宗门日志</Text>
        <View className='menpai-modal-list'>
          {logs.map((log, index) => (
            <View key={`${log.day}-${index}`} className='menpai-log-row'>
              <Paragraph>
                {log?.text || `第${log?.day ?? 0}日，宗门平稳`}
              </Paragraph>
            </View>
          ))}
        </View>
      </JXSpace>
    </JXModal>
  );
}

export default SectLogModal;
