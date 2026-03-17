import { JXButton, JXModal, JXSpace, Text } from '@/components';
import { numberToChinese } from '@/utils';
import type { SectBuilding } from '@/types';
import '../index.less';

interface SectBuildingModalProps {
  visible: boolean;
  onClose: () => void;
  building: SectBuilding | null;
  lingshi: number;
  sectRank: number;
  buildingCosts: {
    unlockCost: number;
    repairCost: number;
    upgradeCost: number;
  } | null;
  onUnlock: () => void;
  onRepair: () => void;
  onUpgrade: () => void;
}

function SectBuildingModal({
  visible,
  onClose,
  building,
  lingshi,
  sectRank,
  buildingCosts,
  onUnlock,
  onRepair,
  onUpgrade
}: SectBuildingModalProps) {
  if (!building) return null;

  return (
    <JXModal visible={visible} okText='关闭' disableCancle onOk={onClose}>
      <JXSpace direction='vertical' gap={6}>
        <Text bold>{building.name}</Text>
        <Text>等级：{building.level > 0 ? building.level : '未建'}</Text>
        <Text>状态：{building.status}</Text>
        <Text>功能：{building.desc}</Text>
        <Text>效果：{building.effect}</Text>
        {building.unlockRank && (
          <Text>解锁：{numberToChinese(building.unlockRank)}品</Text>
        )}
        <Text>当前灵石：{lingshi}</Text>
        {buildingCosts && (
          <JXSpace direction='vertical' gap={6}>
            {building.status === '未建' ? (
              <JXButton
                onClick={onUnlock}
                disabled={(building.unlockRank ?? 1) > sectRank}
              >
                解锁建筑（{buildingCosts.unlockCost}灵石）
              </JXButton>
            ) : (
              <>
                <JXButton
                  onClick={onRepair}
                  disabled={building.status === '正常'}
                >
                  修缮建筑（{buildingCosts.repairCost}灵石）
                </JXButton>
                <JXButton
                  onClick={onUpgrade}
                  disabled={building.status !== '正常' || building.level >= 5}
                >
                  升级建筑（{buildingCosts.upgradeCost}灵石）
                </JXButton>
              </>
            )}
          </JXSpace>
        )}
      </JXSpace>
    </JXModal>
  );
}

export default SectBuildingModal;
