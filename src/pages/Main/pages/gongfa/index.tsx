import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Text,
  JXButton,
  JXSpace,
  JXDivider,
  JXModal,
  JXToast
} from '@/components';
import { GongFaType } from '@/types/gongfa';
import { AddAttrType, ActorDataConfigForZhanDou } from '@/types/actor';
import useActorController from '@/hooks/useActorController';
import useValue, { IUseValueNotState } from '@/hooks/useValue';
import {
  getEffectiveAttr,
  getLingGenExpRate,
  getLingGenMatch,
  putCurrentGongfa,
  setCurrentGongFa
} from '@/utils/gongfa';
import { AttrTransformChinese, TimeArray } from '@/utils';
import './index.less';

function XiuXiContent({ select }: { select: IUseValueNotState<string> }) {
  const { actor } = useActorController();
  const list = useMemo<GongFaType[]>(() => actor?.gongfa?.ls ?? [], [actor]);
  const linggen = (actor?.linggen as string) || '';
  const [, setSelectCache] = useState(''); // 添加状态用于刷新视图
  const selectGongfa = (id: string) => {
    if (id === select.value) {
      select.set('');
      setSelectCache('');
      return;
    }
    select.set(id);
    setSelectCache(id);
  };

  return (
    <>
      {list.map((v: GongFaType) => {
        const match = getLingGenMatch(v, linggen);
        const matchMap: Record<string, { label: string; color: string }> = {
          match: { label: '契合', color: '#4caf50' },
          conflict: { label: '冲突', color: '#999' },
          common: { label: '通用', color: '#1890ff' }
        };
        const matchInfo = matchMap[match] || matchMap.common;
        return (
          <JXSpace
            flexOne
            key={v.id}
            data-id={v.id}
            data-state={v.id === select.value}
            onClick={() => selectGongfa(v.id)}
          >
            <Text inline bold={v.id === select.value}>
              {v.name}({v.pj})
            </Text>
            <Text inline color={matchInfo.color}>
              {matchInfo.label}
            </Text>
            <Text inline>{v.id === select.value && <Text>已选中</Text>}</Text>
          </JXSpace>
        );
      })}
    </>
  );
}

export default function Gongfa() {
  const { get, set, actor } = useActorController();
  const select = useValue('');
  const linggen = (actor?.linggen as string) || '';
  const current = useMemo<GongFaType | null>(
    () => actor?.gongfa?.current ?? null,
    [actor]
  );

  const shouldGetExp = useMemo(() => {
    if (!current?.time) return 0;
    const elapsedMs = Math.max(0, Date.now() - current.time);
    return (
      new TimeArray(elapsedMs).toZhouTian() *
      1000 *
      getLingGenExpRate(current, linggen)
    );
  }, [current, linggen]);

  const xiuxi = () => {
    JXModal.confirm({
      title: '修习功法',
      content: <XiuXiContent select={select} />,
      onConfirm() {
        setCurrentGongFa(select.value as string);
        select.set('-1');
      }
    });
  };

  const chongji = useCallback(async () => {
    if (!current) {
      JXToast('未穿戴功法').show();
      return;
    }
    const updatedGongfa = JSON.parse(JSON.stringify(current)) as GongFaType;
    updatedGongfa.exp += shouldGetExp;
    if (updatedGongfa.exp >= updatedGongfa.max_exp) {
      updatedGongfa.exp = updatedGongfa.max_exp;
      updatedGongfa.lv += 1;
      updatedGongfa.max_exp = Math.round(updatedGongfa.max_exp * 1.5);
      const keys = Object.keys(
        updatedGongfa.attr || {}
      ) as (keyof ActorDataConfigForZhanDou)[];
      const oldAttr = getEffectiveAttr(updatedGongfa, linggen);
      keys.forEach((key) => {
        if (updatedGongfa.attr[key]) {
          const increment =
            Math.round(Math.max(0.1, 5 / (1 + updatedGongfa.lv * 0.1)) * 10) /
            10;
          updatedGongfa.attr[key]! += increment;
        }
      });
      const currentAddAttr = get('addAttr') || ({} as AddAttrType);
      const nextAddAttr = { ...currentAddAttr };
      const nextAttr = getEffectiveAttr(updatedGongfa, linggen);
      keys.forEach((key) => {
        const delta = (nextAttr[key] || 0) - (oldAttr[key] || 0);
        const k = key as keyof AddAttrType;
        nextAddAttr[k] = (nextAddAttr[k] || 0) + delta;
      });
      set('addAttr', nextAddAttr);
    }
    updatedGongfa.time = Date.now();
    set('gongfa.current', updatedGongfa);
    JXToast(`冲击功法${updatedGongfa.name}：+${shouldGetExp}`).show();
  }, [current, shouldGetExp, set, get, linggen]); // eslint-disable-line

  return (
    <Container
      title='功法'
      desc='功法，乃是修仙之本，炼精化气，炼气化神，炼神返虚，合虚成道。纳天地灵气以己用，破天地壁障以成仙……'
    >
      <JXSpace gap={10} center>
        <JXButton onClick={xiuxi}>修习</JXButton>
        <JXButton
          disabled={!current}
          onClick={async () => {
            await putCurrentGongfa().then((s) => {
              if (s) {
                JXToast('卸下成功').show();
              } else {
                JXToast('未穿戴功法').show();
              }
            });
            select.set('');
          }}
        >
          卸下
        </JXButton>
        <JXButton disabled={!current || !shouldGetExp} onClick={chongji}>
          冲击
        </JXButton>
        <JXButton disabled>经脉</JXButton>
      </JXSpace>
      <JXDivider />
      <JXSpace
        direction='vertical'
        between
        gap={5}
        style={{ fontWeight: 'bold', fontSize: '16px' }}
      >
        <Box>
          功法：<Text inline>{current?.name || '无'}</Text>
        </Box>
        <Box>
          品阶：<Text inline>{current?.pj || '无'}</Text>
        </Box>
        <Box>
          层级：<Text inline>{current?.lv || '无'}</Text>
        </Box>
        <Box>
          功法进度：
          <Text inline>
            {current ? `${current?.exp}/${current?.max_exp}` : '无'}
          </Text>
        </Box>
        <Box>
          属性：
          <Text inline>
            {current?.attr
              ? Object.entries(current.attr)
                  .map(
                    ([k, v]) =>
                      `${AttrTransformChinese(
                        k as keyof ActorDataConfigForZhanDou
                      )}: ${v}`
                  )
                  .join(' ')
              : '无'}
          </Text>
        </Box>
        <Box>
          限制境界：<Text inline>{current?.limit || '无'}</Text>
        </Box>
        <Box>
          修炼增益：<Text inline>{current?.xl || '无'}</Text>
        </Box>
        <Box>
          攻击：<Text inline>{current?.attr?.gongji || '无'}</Text>
        </Box>
        <Box>
          防御：<Text inline>{current?.attr?.fangyu || '无'}</Text>
        </Box>
        <Box>
          气血：<Text inline>{current?.attr?.qixue || '无'}</Text>
        </Box>
        <Box>
          攻速：<Text inline>{current?.attr?.sudu || '无'}</Text>
        </Box>
        <Box>
          累计经验：<Text inline>{shouldGetExp}</Text>
        </Box>
      </JXSpace>
    </Container>
  );
}
