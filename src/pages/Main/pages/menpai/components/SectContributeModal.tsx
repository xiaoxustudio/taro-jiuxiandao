import { ItemCounter, JXModal, JXSpace, Text } from '@/components';

interface SectContributeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lingshi: number;
  contributeAmount: number;
  setContributeAmount: (val: number) => void;
  canContribute: boolean;
}

function SectContributeModal({
  visible,
  onClose,
  onConfirm,
  lingshi,
  contributeAmount,
  setContributeAmount,
  canContribute
}: SectContributeModalProps) {
  return (
    <JXModal
      visible={visible}
      title='宗门贡献'
      okText='确认贡献'
      cancleText='取消'
      onOk={onConfirm}
      onCancel={onClose}
    >
      <JXSpace direction='vertical' gap={6}>
        <Text>当前灵石：{lingshi}</Text>
        <Text>
          贡献数量：{Math.max(1, Math.min(contributeAmount, lingshi))}
        </Text>
        <Text>今日可贡献：{canContribute ? '可贡献' : '已完成'}</Text>
        <ItemCounter count={contributeAmount} setCount={setContributeAmount} />
        <Text>
          声望提升：
          {Math.max(
            1,
            Math.floor(Math.max(1, Math.min(contributeAmount, lingshi)) / 200)
          )}
        </Text>
      </JXSpace>
    </JXModal>
  );
}

export default SectContributeModal;
