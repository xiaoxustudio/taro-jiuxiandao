export type OperateAction = 'shengjie' | 'tupo' | 'fashu' | 'tujian';

export interface OperateItem {
  name: string;
  page?: string;
  action?: OperateAction;
  disabled?: boolean;
}

export const operateOptions: OperateItem[] = [
  { name: '试炼', page: 'Main/pages/shilian-list/index' },
  { name: '炼丹', page: 'Main/pages/liandan/index' },
  { name: '仙缘', page: 'Main/pages/xianyuan/index' },
  { name: '宗门', page: 'Main/pages/zongmen/index' },
  { name: '飞升', page: 'Main/pages/feisheng/index' },
  { name: '炼器', page: 'Main/pages/lianqi/index' },
  { name: '法宝', page: 'Main/pages/fabao/index' },
  { name: '升阶', action: 'shengjie' },
  { name: '功法', page: 'Main/pages/gongfa/index' },
  { name: '突破', action: 'tupo' },
  { name: '法术', action: 'fashu' },
  { name: '灵兽', page: 'Main/pages/lingshou/index' }
];

export const operateOptions2: OperateItem[] = [
  { name: '坊市', page: 'Main/pages/fangshi/index' },
  { name: '储物', page: 'Main/pages/chuwu/index' },
  { name: '药园', page: 'Main/pages/yaoyuan/index' },
  { name: '洞府', page: 'Main/pages/dongfu/index' },
  { name: '成就', page: 'Main/pages/chengjiu/index' },
  { name: '图鉴', action: 'tujian' }
];
