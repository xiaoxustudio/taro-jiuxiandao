import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Selector } from 'antd-mobile';
import { useCallback, useState } from 'react';
import { JXButton, JXInput, JXSpace, JXToast, Text } from '@/components';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { ActorDataConfig, CWType } from '@/types';
import { UUID } from '@/utils';
import { HasActor } from '@/utils/actor';
import chuwu from '@/utils/chuwu';
import { GongFaPinJie } from '@/types/gongfa';
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
  const [actor, setActor] = useState<ActorDataConfig>({
    uuid: UUID(),
    daohao: '',
    linggen: '金',
    zhongzu: '人',
    lv: 1,
    xiuwei: 0, // 修为
    max_xiuwei: 500,
    xuanyuan: 10, // 仙缘
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
    xianyuan: 0,
    shouyuan: 13, // 寿元
    max_shouyuan: 100,
    shenshi: 100, // 神识
    max_shenshi: 100,
    addAttr: {
      // 加成属性
      qixue: 0, // 气血
      gongji: 0, // 攻击
      fangyu: 0, // 防御
      baoji: 0, // 暴击
      sudu: 0, // 速度
      fashu: 0,
      xianyuan: 0 // 仙缘
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
    shenshiTime: Date.now(), // 计算神识
    qiandao: {
      count: 0,
      last: '',
      time: ''
    },
    xiulian: null,
    dongfu: {
      lingchi: 1000,
      lv: 1,
      daolv: null
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
      time: 0
    },
    danfang: [],
    gongfa: {
      ls: [
        {
          id: UUID(),
          name: '锻体诀',
          pj: GongFaPinJie.一品, // 品阶
          lv: 0, // 层级
          exp: 0, // 进度
          max_exp: 1000, // 最大进度
          lg: '0', // 灵根
          limit: '0', // 限制
          xl: '0', // 修炼增益
          attr: {
            gongji: 10
          } // 其他属性
        }
      ],
      current: null
    }
  });

  const handleRegister = useCallback(() => {
    if (actor.daohao.length === 0) {
      JXToast('请输入你的道号').show();
      return;
    }
    if (HasActor(actor.daohao)) {
      JXToast('已有该道号的角色').show();
      return;
    }
    setStore(actor.daohao);
    setActorStore(actor.daohao, actor);
    chuwu.Add({ name: '灵石', type: CWType.QT, isPile: true, num: 30000 });
    JXToast().show('创建角色成功');
    setTimeout(() => {
      Taro.navigateBack({ delta: 1 });
    }, 1000);
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
        {/* 种猪 */}
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
    </View>
  );
}
export default Index;
