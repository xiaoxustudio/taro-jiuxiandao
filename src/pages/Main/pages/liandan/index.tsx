import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  ListItemData,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import danfangData from '@/assets/danfang.json';
import chuwu from '@/utils/chuwu';
import { CWType } from '@/types';
import { currentTime, TimeArray } from '@/utils';
import './index.less';

function ModalContent({ name, itype, desc, cl }: any) {
  const [num, setNum] = useState(1);
  const getNum = (item: [string, number]) => {
    return chuwu.Get({ name: item[0], type: CWType.QT })?.num || 0;
  };
  return (
    <JXSpace direction='vertical'>
      <Text size={20} bold>
        {name}
      </Text>
      <Text>品阶：{itype}</Text>
      <Text>描述：{desc}</Text>
      <JXSpace direction='vertical' title='需要材料'>
        {cl.map((item) => (
          <Text key={item[0]}>
            {item[0]} X &nbsp;
            <Text
              color={getNum(item) >= item[1] * num ? 'green' : 'red'}
              inline
            >
              {getNum(item)}/{item[1] * num}
            </Text>
          </Text>
        ))}
        <Text bold>
          炼制数量：{num}
          <JXSpace direction='vertical'>
            <Box>
              <JXButton onClick={() => setNum(Math.max(num - 1, 1))}>
                -1
              </JXButton>
              <JXButton onClick={() => setNum(Math.max(num - 10, 1))}>
                -10
              </JXButton>
              <JXButton onClick={() => setNum(Math.max(num - 100, 1))}>
                -100
              </JXButton>
            </Box>
            <Box>
              <JXButton onClick={() => setNum(num + 1)}>+1</JXButton>
              <JXButton onClick={() => setNum(num + 10)}>+10</JXButton>
              <JXButton onClick={() => setNum(num + 100)}>+100</JXButton>
            </Box>
          </JXSpace>
        </Text>
      </JXSpace>
    </JXSpace>
  );
}

export default function Liandan() {
  const { get, set } = useActorController();
  const [data, setData] = useState<any>(null);
  const list = useMemo(
    () =>
      get('danfang').map(
        (v) =>
          ({
            key: danfangData[v.id],
            title: (
              <Box>
                {danfangData[v.id].name}（经验: {v.exp}）
              </Box>
            ),
            value: danfangData[v.id].desc,
            click() {
              setData({ ...danfangData[v.id], id: v.id });
            }
          }) as ListItemData
      ),
    [get]
  );

  const isComplate = useMemo(() => {
    if (!get('liandan.time')) return false;
    const startTime = get('liandan.time') as number;
    const danTimeArray = danfangData[get('liandan.danyao.id')].time as number[];

    const totalNeededMs = new TimeArray(danTimeArray).milliseconds;
    const endTime = startTime + totalNeededMs;

    const remainingMs = endTime - currentTime();

    if (remainingMs <= 0) {
      return '已完成';
    }

    const last = new TimeArray(remainingMs);

    return `${last.toString()}（${last.toZhouTian().toFixed(2)}周天）`;
  }, [get]);

  return (
    <Container
      title='炼丹'
      desc='丹心，丹魂，丹尘。要想登上那天师之阶，只有找到自己的路，唉，不要，只看到那丹方，蒙蔽了丹心……未来，还是要看自己啊！'
    >
      <JXSpace className='attr' direction='vertical'>
        <Text>称号: {get('liandan.chenghao')}</Text>
        <Text>丹韵: {get('liandan.danyun')}</Text>
        <Text>丹炉: {get('liandan.danlu.name', '无')}</Text>
        <Text>丹名: {get('liandan.danyao.id', '无')}</Text>
        <Text>
          炼丹经验: {get('liandan.exp')}/{get('liandan.max_exp')}
        </Text>
        <Text>
          剩余时间:
          {isComplate || '无'}
        </Text>
        <Text>
          预计收获:
          {get('liandan.danyao') ? (
            <Text color='green' bold inline>
              {danfangData[get('liandan.danyao.id')].name} X
              {get('liandan.danyao.num')}
            </Text>
          ) : (
            '无'
          )}
        </Text>
      </JXSpace>
      <JXSpace style={{ margin: '.5em 0.25em' }} align='center' gap={5}>
        <JXButton>称号</JXButton>
        <JXButton>升阶丹炉</JXButton>
        <JXButton
          onClick={() => {
            if (isComplate) {
              const dy = get('liandan.danyao');
              if (dy) {
                const { id, num } = dy;
                const { name } = danfangData[id];
                set('liandan.danyao', null);
                set('liandan.time', 0);
                chuwu.Add({
                  name,
                  type: CWType.DY,
                  num,
                  isPile: true
                });
                JXToast().show(`获得丹药：${name} X ${num}`);
              } else {
                JXToast().show('丹药尚未炼制完成！');
              }
            }
          }}
        >
          起炉收丹
        </JXButton>
      </JXSpace>
      <List list={list} />
      <JXModal
        visible={!!data}
        okText='炼制'
        content={data ? <ModalContent {...data} /> : null}
        onOk={() => {
          const dy = get('liandan.danyao');
          if (dy) {
            set('liandan.danyao', null);
            set('liandan.time', 0);
            JXToast().show('正则炼制丹药，不可重复炼制！');
          } else {
            set('liandan.danyao.id', data.id);
            set('liandan.danyao.num', 1);
            set('liandan.time', currentTime());
            JXToast().show(`开始炼制丹药：${data.name}`);
          }
          setData(null);
        }}
        onCancel={() => setData(null)}
      />
    </Container>
  );
}
