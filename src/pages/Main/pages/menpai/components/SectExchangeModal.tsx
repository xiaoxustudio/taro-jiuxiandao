import { View } from '@tarojs/components';
import { JXButton, JXModal, JXSpace, Paragraph, Text } from '@/components';
import { buildExchangeRewardLabel } from '@/utils/zongmen';
import type { SectExchangeConfig } from '@/utils/zongmen';
import '../index.less';

interface SectExchangeModalProps {
  visible: boolean;
  onClose: () => void;
  exchangeList: SectExchangeConfig[];
  reputation: number;
  onExchange: (item: SectExchangeConfig) => void;
}

function SectExchangeModal({
  visible,
  onClose,
  exchangeList,
  reputation,
  onExchange
}: SectExchangeModalProps) {
  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={8}>
        <Text bold>宗门兑换</Text>
        <Text>宗门声望：{reputation}</Text>
        <View className='menpai-modal-list'>
          {exchangeList.map((item) => (
            <View key={item.key} className='menpai-member-row'>
              <View>
                <Text>{item.name}</Text>
                <Paragraph>{item.desc}</Paragraph>
                <Text>
                  消耗声望：{item.cost}，{buildExchangeRewardLabel(item)}
                </Text>
              </View>
              <JXButton
                size='mini'
                onClick={() => onExchange(item)}
                disabled={reputation < item.cost}
              >
                兑换
              </JXButton>
            </View>
          ))}
        </View>
      </JXSpace>
    </JXModal>
  );
}

export default SectExchangeModal;
