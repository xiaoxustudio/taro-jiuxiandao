import { View } from '@tarojs/components';
import { DotLoading, Selector } from 'antd-mobile';
import { useCallback, useMemo, useState } from 'react';
import {
  JXButton,
  JXInput,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { ActorDataConfig } from '@/types';
import { UUID, navigateBack } from '@/utils';
import { HasActor } from '@/utils/actor';
import { initAchievements } from '@/utils/chengjiu';
import {
  createDefaultYaoyuanPlots,
  generateActorData,
  getYaoyuanTotalSlots
} from '@/services/actorGenerator';
import { XIUXIAN_TIME_SCALE_DEFAULT } from '@/assets/const';
import styles from './index.module.less';

const options = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        金灵根
      </Text>
    ),
    value: '金'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        木灵根
      </Text>
    ),
    value: '木'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        水灵根
      </Text>
    ),
    value: '水'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        火灵根
      </Text>
    ),
    value: '火'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        土灵根
      </Text>
    ),
    value: '土'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        风灵根
      </Text>
    ),
    value: '风'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        雷灵根
      </Text>
    ),
    value: '雷'
  }
];

const races = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        人族
      </Text>
    ),
    value: '人'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        魔族
      </Text>
    ),
    value: '魔'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        妖族
      </Text>
    ),
    value: '妖'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        鬼族
      </Text>
    ),
    value: '鬼'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        灵族
      </Text>
    ),
    value: '灵'
  }
];

function Index() {
  const { set: setStore } = useStore();
  const { set: setActorStore } = useActorStore();
  const [genState, setGenState] = useState<{
    visible: boolean;
    phase: '材料' | '丹方' | '功法';
    done: number;
    total: number;
    name: string;
  }>({ visible: false, phase: '材料', done: 0, total: 0, name: '' });
  const [actor, setActor] = useState<ActorDataConfig>({
    uuid: UUID(),
    daohao: '',
    linggen: '金',
    zhongzu: '人',
    lv: 1,
    xiuwei: 0, // 修为
    max_xiuwei: 500,
    xianyuan: 10, // 仙缘
    jingjie: '练气',
    jingjie1: '一阶',
    jingjie2: '初期',
    xiulianbeilv: 10, // 修炼倍率
    qixue: 1200, // 气血
    gongji: 80, // 攻击
    fangyu: 40, // 防御
    baoji: 2, // 暴击
    sudu: 20, // 速度
    fashu: 0, // 法术
    shouyuan: 60, // 寿元
    max_shouyuan: 100,
    shenshi: 100, // 神识
    max_shenshi: 100,
    addAttr: {
      qixue: 0,
      gongji: 0,
      fangyu: 0,
      baoji: 0,
      sudu: 0,
      fashu: 0
    },
    fabao: {
      手持武器: null,
      头戴战盔: null,
      身穿战甲: null,
      腰带护具: null,
      饰品加持: null,
      鞋子护腿: null,
      魂器镇魂: null,
      本名法宝: null
    },
    cw: {
      fb: [],
      dy: [],
      qt: [],
      max: 30 // 容量
    },
    time1: Date.now(), // 时间1 （计算寿元）
    xiuxianStartAt: Date.now(),
    xiuxianTimeScale: XIUXIAN_TIME_SCALE_DEFAULT,
    shenshiTime: Date.now(), // 计算神识
    qiandao: {
      count: 0,
      last: '',
      time: '',
      streak: 0
    },
    xiulian: null,
    dongfu: {
      lingchi: 1000,
      lv: 1,
      daolv: null,
      daolvMarket: null,
      shuangxiu: null
    },
    // dongfu: null,
    zd: {
      time: 0,
      df: ''
    },
    liandan: {
      chenghao: '丹徒',
      exp: 0,
      max_exp: 100,
      danlu: null,
      danyao: null,
      danyun: 0,
      completeTime: 0,
      time: 0
    },
    danfang: [],
    gongfa: {
      ls: [],
      current: null
    },
    yaoyuan: {
      lv: 1,
      plots: createDefaultYaoyuanPlots(getYaoyuanTotalSlots(1)),
      seeds: []
    },
    chengjiu: initAchievements()
  });

  const progressText = useMemo(() => {
    const total = Math.max(1, genState.total);
    const done = Math.min(total, Math.max(0, genState.done));
    const pct = Math.floor((done / total) * 100);
    return `${genState.phase}生成中：${done}/${total}（${pct}%）`;
  }, [genState.done, genState.phase, genState.total]);

  const handleRegister = useCallback(async () => {
    if (actor.daohao.length === 0) {
      JXToast('请输入你的道号').show();
      return;
    }
    if (HasActor(actor.daohao)) {
      JXToast('已有该道号的角色').show();
      return;
    }

    try {
      const result = await generateActorData(actor, (progress) =>
        setGenState(progress)
      );
      if (!result.ok) {
        JXToast(result.message).show();
        setGenState((s) => ({ ...s, visible: false }));
        return;
      }

      const nextActor = result.actor;

      setActorStore(actor.daohao, nextActor);
      setStore(actor.daohao);
      JXToast().show('创建角色成功');
      setTimeout(() => {
        navigateBack({ delta: 1 });
      }, 1000);
    } catch (e: any) {
      JXToast(e?.message || '创建角色失败').show();
    } finally {
      setGenState((s) => ({ ...s, visible: false }));
    }
  }, [actor, setActorStore, setStore]);

  return (
    <View className={styles.Container}>
      <JXSpace className={styles.Container} direction='vertical'>
        <View className={styles.Title}>
          创建角色
          <Text size={14} color='#ccc' inline>
            ({actor.daohao.length}/10)
          </Text>
        </View>
        <View>
          <JXInput
            className={styles.Input}
            placeholder='请输入你的角色名称'
            value={actor.daohao}
            maxLength={10}
            onChange={(v) => setActor({ ...actor, daohao: v })}
          />
        </View>
        {/* 灵根 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你的角色
          </Text>
          <JXSpace>
            <Selector
              options={options}
              defaultValue={[actor.linggen]}
              onChange={(arr) => setActor({ ...actor, linggen: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        {/* 种族 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你出身种族
          </Text>
          <JXSpace>
            <Selector
              options={races}
              defaultValue={[actor.zhongzu]}
              onChange={(arr) => setActor({ ...actor, zhongzu: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        <JXSpace className={styles.Bottom} gap={20}>
          <JXButton width={200} onClick={handleRegister}>
            创建角色
          </JXButton>
        </JXSpace>
      </JXSpace>
      <JXModal
        visible={genState.visible}
        disableOk
        disableCancle
        closeOnMaskClick={false}
        closeOnAction={false}
      >
        <JXSpace direction='vertical'>
          <JXSpace align='center' gap={8}>
            <DotLoading />
            <Text>{progressText}</Text>
          </JXSpace>
          <Text>当前：{genState.name || '准备中'}</Text>
        </JXSpace>
      </JXModal>
    </View>
  );
}
export default Index;
