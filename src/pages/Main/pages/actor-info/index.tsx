import { View } from '@tarojs/components';
import { useCallback } from 'react';
import { JXSpace, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { getLunhuiBuffs } from '@/utils/actor';
import { navigateBack } from '@/utils';
import './index.less';

export default function ActorInfo() {
  const { get } = useActorController();
  const handleBack = useCallback(() => navigateBack(), []);
  const lunhuiCount = (get('lunhuiCount') as number) || 0;
  const lunhuiBuffs = getLunhuiBuffs(lunhuiCount);
  return (
    <View className='actor-info'>
      <View className='back-btn' onClick={handleBack}>
        ← 返回
      </View>
      <View className='head'>
        <Text textShadow size={20} bold>
          {get('daohao')}
        </Text>
        {lunhuiCount > 0 && (
          <Text color='gold' size={14}>
            【轮回第{lunhuiCount}世】
          </Text>
        )}
      </View>
      <JXSpace
        style={{ background: 'white', marginBottom: '10px' }}
        direction='vertical'
        flexOne
      >
        <Text className='item' size={16} bold>
          等级：{get('lv')}
        </Text>
        <Text className='item' size={16} bold>
          境界：{get('jingjie')}
          {get('jingjie1')}
          {get('jingjie2')}
        </Text>
        <Text className='item' size={16} bold>
          神识：{get('shenshi')}/{get('max_shenshi')}
        </Text>
        <Text className='item' size={16} bold>
          气血：{get('qixue') + get('addAttr.qixue')}
        </Text>
        <Text className='item' size={16} bold>
          总攻击：{get('gongji') + get('addAttr.gongji')}
        </Text>
        <Text className='item' size={16} bold>
          总防御：{get('fangyu') + get('addAttr.fangyu')}
        </Text>
        <Text className='item' size={16} bold>
          攻速：{get('sudu') + get('addAttr.sudu')}
        </Text>
        <Text className='item' size={16} bold>
          仙缘：{get('xianyuan')}
        </Text>
        <Text className='item' size={16} bold>
          暴击：{get('baoji') + get('addAttr.baoji')}
        </Text>
        <Text className='item' size={16} bold>
          灵根：{get('linggen')}灵根
        </Text>
        <Text className='item' size={16} bold>
          种族：{get('zhongzu')}
        </Text>
        <Text className='item' size={14} color='#888'>
          {{
            人: '人族增益：修炼+10%',
            魔: '魔族增益：修炼+15%',
            妖: '妖族增益：修炼+5%',
            鬼: '鬼族增益：修炼+8%',
            灵: '灵族增益：修炼+20%'
          }[get('zhongzu') as string] || ''}
        </Text>
        <Text className='item' size={16} bold>
          寿元：{get('shouyuan')}/{get('max_shouyuan')}
        </Text>
      </JXSpace>
      {lunhuiBuffs && (
        <JXSpace
          style={{
            background: '#fff8e1',
            marginBottom: '10px',
            padding: '8px'
          }}
          direction='vertical'
        >
          <Text size={14} bold color='orange'>
            轮回印记（{lunhuiCount}层）
          </Text>
          <Text>修炼倍率 +{lunhuiBuffs.xiulianbeilvBonus * 10}%</Text>
          <Text>神识上限 +{lunhuiBuffs.maxShenshiBonus}</Text>
          <Text>寿元上限 +{lunhuiBuffs.shouyuanBonus}</Text>
          <Text>初始修为 +{lunhuiBuffs.initialXiuweiBonus}</Text>
          <Text>全属性 +{lunhuiBuffs.shangxianBonus}%</Text>
        </JXSpace>
      )}
      <JXSpace style={{ background: 'white' }} direction='vertical'>
        <Text className='item' size={16} bold>
          修仙约吗？道友！
        </Text>
        <Text className='item' size={16} bold>
          Go，我在九仙道等你！
        </Text>
      </JXSpace>
    </View>
  );
}
