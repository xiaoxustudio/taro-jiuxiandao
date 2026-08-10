import { useMemo } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  Scroll,
  Text
} from '@/components';
import {
  ActorDataConfigForZhanDou,
  CWType,
  FabaoType,
  FabaoPinjie,
  FBItemType
} from '@/types';
import { getGradeColor, AttrTransformChinese } from '@/utils';
import chuwu from '@/utils/chuwu';
import useActorController from '@/hooks/useActorController';
import useContainer from '@/hooks/useContainer';
import { getRealmIndex } from '@/utils/fangshi';
import { dyGrades } from '@/assets/const';
import PageHeader from '@/components/PageHeader';
import './index.less';

const LINGGEN_OPTIONS = ['金', '木', '水', '火', '土', '风', '雷'];

const REALM_TO_GRADE: Record<string, string> = {
  练气: '三品',
  筑基: '四品',
  结丹: '五品',
  元婴: '六品',
  化神: '七品',
  返虚: '八品',
  合体: '八品',
  大乘: '八品'
};

const PILL_ATTR: Record<string, { xiuwei: number; shenshi: number }> = {
  三品: { xiuwei: 100, shenshi: 30 },
  四品: { xiuwei: 300, shenshi: 80 },
  五品: { xiuwei: 1000, shenshi: 200 },
  六品: { xiuwei: 3000, shenshi: 500 },
  七品: { xiuwei: 8000, shenshi: 1200 },
  八品: { xiuwei: 20000, shenshi: 3000 }
};

const XIANYUAN_PRICE: Record<string, number> = {
  三品: 30,
  四品: 40,
  五品: 55,
  六品: 75,
  七品: 100,
  八品: 130
};

type XianYuanItem = {
  key: string;
  name: string;
  price: number;
  type: 'linggen' | 'fabao' | 'pill';
  desc: string;
  itype?: string;
  pj?: string;
  attr?: Record<string, number>;
};

const FABAO_ITEMS: FBItemType[] = [
  {
    name: '碧水灵珠',
    type: CWType.FB,
    isPile: false,
    itype: FabaoType.饰品加持,
    pj: FabaoPinjie.筑基,
    attr: { xianyuan: 10, sudu: 3 },
    lv: 0,
    num: 1
  },
  {
    name: '青云剑',
    type: CWType.FB,
    isPile: false,
    itype: FabaoType.手持武器,
    pj: FabaoPinjie.筑基,
    attr: { gongji: 30, baoji: 2 },
    lv: 0,
    num: 1
  },
  {
    name: '护心镜',
    type: CWType.FB,
    isPile: false,
    itype: FabaoType.身穿战甲,
    pj: FabaoPinjie.筑基,
    attr: { fangyu: 25, qixue: 100 },
    lv: 0,
    num: 1
  }
];

export default function XianYuan() {
  const { get, set, actor } = useActorController();
  const container = useContainer();
  const realm = get('jingjie') as string;
  const realmIndex = getRealmIndex(realm);
  const needGrade = REALM_TO_GRADE[realm] || '三品';
  const needGradeIdx = Math.max(
    0,
    (dyGrades as readonly string[]).indexOf(needGrade)
  );

  const xianyuan = actor.xianyuan || 0;

  const goods = useMemo<XianYuanItem[]>(() => {
    const list: XianYuanItem[] = [
      {
        key: 'linggen',
        name: '洗灵根符',
        price: 50,
        type: 'linggen',
        desc: '使用后可随机/选择更换一次灵根',
        itype: '道具'
      }
    ];
    FABAO_ITEMS.forEach((fb) => {
      list.push({
        key: `fabao-${fb.name}`,
        name: fb.name,
        price: 30,
        type: 'fabao',
        desc: '仙缘商店专属珍稀法宝，兑换后进入储物',
        itype: fb.pj,
        pj: fb.pj,
        attr: fb.attr
      });
    });
    const pillList: XianYuanItem[] = [];
    const maxGradeIdx = Math.min(dyGrades.length - 1, needGradeIdx + 1);
    for (
      let i = Math.min(needGradeIdx, maxGradeIdx);
      i <= maxGradeIdx;
      i += 1
    ) {
      const grade = dyGrades[i];
      pillList.push({
        key: `pill-${grade}`,
        name: `${grade}突破丹`,
        price: XIANYUAN_PRICE[grade] || 30,
        type: 'pill',
        desc: `高品阶${grade}突破丹，服用后可获得大量修为，助力突破`,
        itype: grade,
        attr: PILL_ATTR[grade]
      });
    }
    return [...list, ...pillList];
  }, [needGradeIdx]);

  const list = useMemo(
    () =>
      goods.map((v, index) => ({
        ...v,
        title: (
          <Box>
            <Text>{v.name}</Text>
            <JXSpace between>
              <Text>仙缘：{v.price}</Text>
              <Text align='right' color={getGradeColor(v.itype) || undefined}>
                {v.itype}
              </Text>
            </JXSpace>
          </Box>
        ),
        value: '',
        key: `${v.key}-${index}`,
        click() {
          const attr = v.attr ?? {};
          const attrKeys = Object.keys(attr);
          const instance = JXModal.show({
            okText: '兑换',
            content: (
              <JXSpace direction='vertical'>
                <Text size={20} bold>
                  {v.name}
                </Text>
                {v.pj && (
                  <Text color={getGradeColor(v.pj) || undefined}>
                    品阶：{v.pj}
                  </Text>
                )}
                <Text>描述：{v.desc}</Text>
                {attrKeys.length ? (
                  <JXSpace direction='vertical' title='属性'>
                    {attrKeys.map((item) => (
                      <Text key={attr[item]}>
                        {AttrTransformChinese(
                          item as keyof ActorDataConfigForZhanDou
                        )}
                        ：
                        {attr[item] >= 0 ? (
                          <Text color='green' inline>
                            + {attr[item]}
                          </Text>
                        ) : (
                          <Text color='red' inline>
                            {attr[item]}
                          </Text>
                        )}
                      </Text>
                    ))}
                  </JXSpace>
                ) : null}
                <Text>所需仙缘：{v.price}</Text>
              </JXSpace>
            ),
            onOk() {
              instance.close();
              const curXY = get('xianyuan') || 0;
              if (curXY < v.price) {
                JXToast(`仙缘不足，还差${v.price - curXY}`).show();
                return;
              }
              if (v.type === 'linggen') {
                const lingGenInstance = JXModal.show({
                  okText: '随机灵根',
                  cancleText: '取消',
                  content: (
                    <JXSpace direction='vertical'>
                      <Text>选择你要更换的灵根</Text>
                      <JXSpace gap={10} style={{ flexWrap: 'wrap' }}>
                        {LINGGEN_OPTIONS.filter(
                          (lg) => lg !== get('linggen')
                        ).map((lg) => (
                          <JXButton
                            key={lg}
                            size='small'
                            onClick={() => {
                              set('xianyuan', curXY - v.price);
                              set('linggen', lg);
                              lingGenInstance.close();
                              JXToast(`灵根已更换为【${lg}灵根】`).show();
                            }}
                          >
                            {lg}灵根
                          </JXButton>
                        ))}
                      </JXSpace>
                    </JXSpace>
                  ),
                  onOk() {
                    const options = LINGGEN_OPTIONS.filter(
                      (lg) => lg !== get('linggen')
                    );
                    const picked =
                      options[Math.floor(Math.random() * options.length)];
                    set('xianyuan', curXY - v.price);
                    set('linggen', picked);
                    lingGenInstance.close();
                    JXToast(`天机逆转，灵根已重塑为【${picked}灵根】！`).show();
                  },
                  onCancel() {
                    lingGenInstance.close();
                  }
                });
                return;
              }
              if (v.type === 'fabao') {
                const fb = FABAO_ITEMS.find((f) => f.name === v.name);
                if (fb) {
                  if (chuwu.Has(fb) !== -1) {
                    JXToast('已拥有该法宝！').show();
                    return;
                  }
                  set('xianyuan', curXY - v.price);
                  chuwu.Add(fb);
                  JXToast(`兑换成功：${v.name}`).show();
                }
                return;
              }
              set('xianyuan', curXY - v.price);
              chuwu.Add({
                name: v.name,
                type: CWType.DY,
                isPile: true,
                itype: v.itype,
                attr: v.attr,
                desc: v.desc,
                num: 1
              });
              JXToast(`兑换成功：${v.name}`).show();
            },
            onCancel() {
              instance.close();
            }
          });
        }
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goods, get, set, realmIndex]
  );

  return (
    <Container
      title='仙缘商店'
      desc='仙缘难得，有缘者得之。此地售卖诸多天材地宝，惟仙缘可换…'
      context={container}
      scroll
    >
      <PageHeader
        left={<Text>仙缘：{xianyuan}</Text>}
        right={<Text align='right'>当前境界：{realm}</Text>}
      />
      <Scroll calc={container.calcHeight + 50} bottomBlankSpace={30}>
        {list.length ? <List list={list} noFlex /> : <Text>暂无商品</Text>}
      </Scroll>
    </Container>
  );
}
