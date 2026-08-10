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
import { CWType } from '@/types';
import { getCurrentDate } from '@/utils';
import chuwu from '@/utils/chuwu';
import './index.less';

const FAKE_MEMBERS = ['云中子', '青木真人', '紫霞仙子', '白鹤上人', '玄机道尊'];

function Zongmen() {
  const { get, set, actor } = useActorController();
  const [name, setName] = useState('');

  const zongmen = actor?.zongmen ?? null;

  const isTaskDone = useMemo(
    () => zongmen?.lastTaskDate === getCurrentDate(),
    [zongmen]
  );

  const expPercent = useMemo(
    () => (zongmen ? Math.min(100, (zongmen.exp / zongmen.maxExp) * 100) : 0),
    [zongmen]
  );

  const buff = zongmen ? zongmen.level * 2 : 0;

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      JXToast().show('请输入宗门名称');
      return;
    }
    if (chuwu.Has({ name: '灵石', type: CWType.QT }) === -1) {
      JXToast().show('灵石不足');
      return;
    }
    const ls = chuwu.Get({ name: '灵石', type: CWType.QT });
    if (!ls || (ls.num || 0) < 5000) {
      JXToast().show('创建宗门需要 5000 灵石');
      return;
    }
    chuwu.Remove({ name: '灵石', type: CWType.QT, num: 5000 });
    set('zongmen', {
      name: trimmed,
      level: 1,
      exp: 0,
      maxExp: 500,
      members: [get('daohao'), ...FAKE_MEMBERS],
      gongxian: 0
    });
    setName('');
    JXToast().show(`宗门【${trimmed}】创建成功！`);
  };

  const handleTask = () => {
    if (!zongmen) return;
    if (isTaskDone) {
      JXToast().show('今日宗门任务已完成！');
      return;
    }
    const shenshi = get('shenshi') || 0;
    if (shenshi < 20) {
      JXToast().show('神识不足，宗门任务需要 20 神识');
      return;
    }
    set('shenshi', shenshi - 20);
    const expGain = zongmen.level * 100 + 200;
    const gongxianGain = zongmen.level * 10 + 10;
    const lingShiGain = zongmen.level * 50 + 100;
    chuwu.Add({
      name: '灵石',
      type: CWType.QT,
      isPile: true,
      num: lingShiGain
    });
    let { level } = zongmen;
    let exp = zongmen.exp + expGain;
    let { maxExp } = zongmen;
    let leveled = false;
    while (exp >= maxExp && level < 10) {
      exp -= maxExp;
      level += 1;
      maxExp = level * 500;
      leveled = true;
    }
    if (level >= 10) exp = Math.min(exp, maxExp);
    set('zongmen', {
      ...zongmen,
      level,
      exp,
      maxExp,
      gongxian: zongmen.gongxian + gongxianGain,
      lastTaskDate: getCurrentDate()
    });
    JXToast().show(
      leveled
        ? `任务完成！宗门升至 ${level} 级，贡献 +${gongxianGain}，灵石 +${lingShiGain}`
        : `任务完成！宗门经验 +${expGain}，贡献 +${gongxianGain}，灵石 +${lingShiGain}`
    );
  };

  const handleExit = () => {
    if (!zongmen) return;
    JXModal.confirm({
      title: '退出宗门',
      content: `确定要退出宗门【${zongmen.name}】吗？宗门数据将清空。`,
      confirmText: '退出',
      onConfirm() {
        set('zongmen', null);
        JXToast().show('已退出宗门');
      }
    });
  };

  if (!zongmen) {
    return (
      <Container title='宗门' desc='开宗立派，广纳门徒，共参大道。'>
        <JXSpace direction='vertical' gap={8} style={{ padding: '0 10px' }}>
          <JXSpace center className='zongmen-empty'>
            <Text color='#888'>尚未加入任何宗门</Text>
          </JXSpace>
          <JXInput
            placeholder='请输入宗门名称'
            value={name}
            maxLength={8}
            onChange={(v) => setName(v)}
          />
          <JXSpace center>
            <JXButton width={200} onClick={handleCreate}>
              创建宗门（5000 灵石）
            </JXButton>
          </JXSpace>
          <Text color='#888' size={13}>
            创建宗门消耗 5000 灵石，初始 1 级
          </Text>
        </JXSpace>
      </Container>
    );
  }

  return (
    <Container title='宗门' desc='开宗立派，广纳门徒，共参大道。'>
      <JXSpace direction='vertical' gap={8} style={{ padding: '0 10px' }}>
        <JXSpace between>
          <Text size={20} bold>
            {zongmen.name}
          </Text>
          <Text color='#7b68ee'>Lv.{zongmen.level}</Text>
        </JXSpace>
        <Text>
          经验：{zongmen.exp}/{zongmen.maxExp}
        </Text>
        <View className='zongmen-progress'>
          <View
            className='zongmen-progress__bar'
            style={{ width: `${expPercent}%` }}
          />
        </View>
        <Text>贡献点：{zongmen.gongxian}</Text>
        <Text color='#888' size={13}>
          宗门加成：修炼倍率 +{buff}%（每级 +2%）
        </Text>
        <JXSpace style={{ margin: '10px 0' }}>
          <JXButton
            style={{ flex: 1 }}
            disabled={isTaskDone}
            onClick={handleTask}
          >
            {isTaskDone ? '今日已完成' : '宗门任务'}
          </JXButton>
          <JXButton style={{ flex: 1 }} onClick={handleExit}>
            退出宗门
          </JXButton>
        </JXSpace>
        <Text bold>宗门成员</Text>
        {zongmen.members.map((member, index) => (
          <Text key={`${member}-${index}`}>
            {index === 0 ? '宗主' : '弟子'}：{member}
          </Text>
        ))}
        <Text color='#888' size={13}>
          宗门任务：每日消耗 20 神识，获得宗门经验、贡献点与灵石，宗门最高 10 级
        </Text>
      </JXSpace>
    </Container>
  );
}

export default Zongmen;
