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
import useActorController from '@/hooks/useActorController';
import useValue, { IUseValueNotState } from '@/hooks/useValue';
import { putCurrentGongfa, setCurrentGongFa } from '@/utils/gongfa';
import { TimeArray } from '@/utils';
import './index.less';

function XiuXiContent({ select }: { select: IUseValueNotState<string> }) {
  const { get } = useActorController();
  const list = useMemo<GongFaType[]>(() => get('gongfa.ls'), [get]);
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
      {list.map((v: GongFaType) => (
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
          <Text inline>{v.id === select.value && <Text>已选中</Text>}</Text>
        </JXSpace>
      ))}
    </>
  );
}

export default function Gongfa() {
  const { get, set, actor } = useActorController();
  const [selectState, select] = useValue('', true);
  const current = useMemo<GongFaType | null>(
    () => get('gongfa.current'),
    [actor, get, set, selectState] // eslint-disable-line
  );

  const shouldGetExp = useMemo(() => {
    const timeArr = current?.time
      ? new TimeArray(current.time)
      : new TimeArray(Date.now());
    return timeArr.toZhouTian() * 1000;
  }, [current]);

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
    current.exp += shouldGetExp;
    if (current.exp >= current.max_exp) {
      current.exp = current.max_exp;
      current.lv += 1;
      current.max_exp += 1000;
      const keys = Object.keys(current.attr);
      keys.forEach((key) => {
        if (current.attr[key]) current.attr[key] += 0.1 * current.lv;
      });
      current.time = Date.now();
    }
    set('gongfa.current', current);
    JXToast(`冲击功法${current.name}：+${shouldGetExp}`).show();
  }, [current, shouldGetExp, set, get]); // eslint-disable-line

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
            await putCurrentGongfa().then((s) =>
              s ? JXToast('卸下成功').show() : JXToast('未穿戴功法').show()
            );
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
          属性：<Text inline>无</Text>
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
