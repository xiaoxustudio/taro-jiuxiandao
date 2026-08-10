import { View } from '@tarojs/components';
import { useMemo, useState } from 'react';
import {
  Container,
  JXButton,
  JXInput,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import useModal from '@/hooks/useModal';
import chuwu from '@/utils/chuwu';
import { checkLingShouAchievements } from '@/utils/chengjiuHelper';
import {
  addLingShouExp,
  getLingShouBonus,
  LINGSHOU_BONUS_RATE
} from '@/utils/lingshou';
import { CWType } from '@/types';
import './index.less';

export default function LingShou() {
  const { get, set, actor } = useActorController();
  const { state: stateRename } = useModal();
  const [newName, setNewName] = useState('');

  const lingShou = actor?.lingShou ?? null;
  const shenglingNum = chuwu.Get({ name: '升灵石', type: CWType.QT })?.num || 0;

  const bonus = useMemo(
    () => (lingShou ? getLingShouBonus(lingShou) : null),
    [lingShou]
  );

  if (!lingShou) {
    return (
      <Container title='灵兽养成' desc='灵兽相伴，同修大道。'>
        <JXSpace center className='lingshou-empty'>
          <Text color='#888'>尚未获得灵兽</Text>
        </JXSpace>
      </Container>
    );
  }

  const expPercent = Math.min(100, (lingShou.exp / lingShou.maxExp) * 100);

  const handleToggleActive = () => {
    const nextActive = !lingShou.active;
    set('lingShou.active', nextActive);
    JXToast().show(nextActive ? '灵兽已出战' : '灵兽已休息');
  };

  const handleFeed = () => {
    if (chuwu.Has({ name: '升灵石', type: CWType.QT }) === -1) {
      JXToast().show('升灵石不足');
      return;
    }
    chuwu.Remove({ name: '升灵石', type: CWType.QT, num: 1 });
    const next = addLingShouExp(lingShou, 100);
    set('lingShou', next);
    checkLingShouAchievements(get, set, actor);
    JXToast().show(
      next.lv > lingShou.lv
        ? `${lingShou.name}升级至${next.lv}级！`
        : `${lingShou.name}获得100经验`
    );
  };

  const handleRename = () => {
    const name = newName.trim();
    if (!name) {
      JXToast().show('名称不能为空');
      return;
    }
    set('lingShou.name', name);
    setNewName('');
    stateRename.setVisiableModal(false);
    JXToast().show(`改名成功：${name}`);
  };

  return (
    <Container title='灵兽养成' desc='灵兽相伴，同修大道。'>
      <JXSpace direction='vertical' gap={8} style={{ padding: '0 10px' }}>
        <JXSpace between>
          <Text size={20} bold>
            {lingShou.name}
          </Text>
          <Text color={lingShou.active ? 'green' : '#999'}>
            {lingShou.active ? '出战' : '休息'}
          </Text>
        </JXSpace>
        <Text>等级：{lingShou.lv}</Text>
        <Text>
          经验：{lingShou.exp}/{lingShou.maxExp}
        </Text>
        <View className='lingshou-progress'>
          <View
            className='lingshou-progress__bar'
            style={{ width: `${expPercent}%` }}
          />
        </View>
        <JXSpace between>
          <Text>气血：{lingShou.qixue}</Text>
          <Text>攻击：{lingShou.gongji}</Text>
          <Text>防御：{lingShou.fangyu}</Text>
        </JXSpace>
        {bonus && (
          <Text color='#888' size={13}>
            出战加成（{LINGSHOU_BONUS_RATE} 倍）：气血 +{bonus.qixue}，攻击 +
            {bonus.gongji}，防御 +{bonus.fangyu}
          </Text>
        )}
        <Text color='#888' size={13}>
          喂养消耗 1 个升灵石（当前 X{shenglingNum}），增加 100 经验
        </Text>
        <JXSpace style={{ margin: '10px 0' }}>
          <JXButton style={{ flex: 1 }} onClick={handleToggleActive}>
            {lingShou.active ? '休息' : '出战'}
          </JXButton>
          <JXButton style={{ flex: 1 }} onClick={handleFeed}>
            喂养
          </JXButton>
          <JXButton
            style={{ flex: 1 }}
            onClick={() => {
              setNewName(lingShou.name);
              stateRename.setVisiableModal(true);
            }}
          >
            改名
          </JXButton>
        </JXSpace>
      </JXSpace>
      <JXModal
        controller={stateRename}
        title='灵兽改名'
        okText='确认'
        disableOk={!newName.trim()}
        onOk={handleRename}
        onCancel={() => stateRename.setVisiableModal(false)}
      >
        <JXSpace direction='vertical' gap={6}>
          <JXInput
            placeholder='请输入新名字'
            value={newName}
            maxLength={8}
            onChange={(v) => setNewName(v)}
          />
        </JXSpace>
      </JXModal>
    </Container>
  );
}
