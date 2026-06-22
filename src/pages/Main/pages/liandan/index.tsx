import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  ListItemData,
  Text,
  ItemCounter
} from '@/components';
import useActorController from '@/hooks/useActorController';
import danfangData from '@/assets/danfang.json';
import chuwu from '@/utils/chuwu';
import { CWType } from '@/types';
import { currentTime, TimeArray } from '@/utils';
import './index.less';

export default function Liandan() {
  const { get, set } = useActorController();
  const [data, setData] = useState<any>(null);
  const [num, setNum] = useState(1);
  const customDanfang = useMemo(
    () => (get('danfangData') ?? {}) as Record<string, any>,
    [get]
  );

  const list = useMemo(
    () =>
      get('danfang')
        .map((v) => {
          const base =
            (danfangData as Record<string, any>)[v.id] || customDanfang[v.id];
          if (!base) return null;
          return {
            key: v.id,
            title: (
              <Box>
                {base.name}（经验: {v.exp}）
              </Box>
            ),
            value: base.desc,
            click() {
              setData({ ...base, id: v.id });
            }
          } as ListItemData;
        })
        .filter(Boolean) as ListItemData[],
    [get, customDanfang]
  );

  const complateInfo = useMemo(() => {
    const completeTime = get('liandan.completeTime') as number | undefined;
    if (!completeTime) return { done: false, text: '无' };

    const remainingMs = completeTime - currentTime();

    if (remainingMs <= 0) {
      return { done: true, text: '已完成' };
    }

    const last = new TimeArray(remainingMs);

    return {
      done: false,
      text: `${last.toString()}（${last.toZhouTian().toFixed(2)}周天）`
    };
  }, [get, customDanfang]);

  const getNum = (item: [string, number]) => {
    return chuwu.Get({ name: item[0], type: CWType.QT })?.num || 0;
  };

  const reset = useCallback(() => {
    set('liandan.danyao', null);
    set('liandan.time', 0);
    set('liandan.completeTime', 0);
    setData(null);
    setNum(1);
  }, [set]);

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
          {complateInfo.text}
        </Text>
        <Text>
          预计收获:
          {get('liandan.danyao') ? (
            <Text color='green' bold inline>
              {
                (
                  (danfangData as Record<string, any>)[
                    get('liandan.danyao.id')
                  ] || customDanfang[get('liandan.danyao.id')]
                ).name
              }{' '}
              X{get('liandan.danyao.num')}
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
            if (complateInfo.done) {
              const dy = get('liandan.danyao');
              if (dy) {
                const { id, num: dNum } = dy;
                const base =
                  (danfangData as Record<string, any>)[id] || customDanfang[id];
                const { name } = base;
                chuwu.Add({
                  name,
                  type: CWType.DY,
                  num: dNum,
                  isPile: true
                });
                JXToast().show(`获得丹药：${name} X ${dNum}`);
                reset();
              } else {
                JXToast().show('丹药尚未炼制完成！');
              }
            }
          }}
        >
          起炉收丹
        </JXButton>
      </JXSpace>
      <List list={list} noFlex />
      <JXModal
        visible={!!data}
        okText='炼制'
        content={
          data ? (
            <JXSpace direction='vertical'>
              <Text size={20} bold>
                {data.name}
              </Text>
              <Text>品阶：{data.itype}</Text>
              <Text>描述：{data.desc}</Text>
              <JXSpace direction='vertical' title='需要材料'>
                {data.cl.map((item) => (
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
                  <ItemCounter count={num} setCount={setNum} />
                </Text>
              </JXSpace>
            </JXSpace>
          ) : null
        }
        onOk={() => {
          const dy = get('liandan.danyao');
          const needItems = data.cl.map((v) => ({
            name: v[0],
            num: v[1] * num,
            type: CWType.QT,
            isPile: true
          }));
          const hasCl = chuwu.HasArr(needItems);
          if (dy) {
            JXToast().show('正则炼制丹药，不可重复炼制！');
          } else if (hasCl) {
            chuwu.RemoveArr(needItems);
            set('liandan.danyao.id', data.id);
            set('liandan.danyao.num', num);
            const totalMs = new TimeArray(data.time).milliseconds;
            set('liandan.completeTime', currentTime() + totalMs);
            set('liandan.time', currentTime());
            JXToast().show(`开始炼制丹药：${data.name}`);
          } else {
            JXToast().show('丹药材料缺少！');
          }
          setData(null);
          setNum(1);
        }}
        onCancel={() => {
          setNum(1);
          setData(null);
        }}
      />
    </Container>
  );
}
