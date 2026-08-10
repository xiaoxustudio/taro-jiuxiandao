import { useMemo } from 'react';
import dfList from '@/assets/df.json';
import { Container, JXButton, JXSpace } from '@/components';
import useActorController from '@/hooks/useActorController';
import { REALM_ORDER } from '@/assets/const';
import { DiFangType } from '@/types';
import { navigateTo } from '@/utils';
import './index.less';

export default function ShilianList() {
  const { get, set } = useActorController();
  const playerRealmIdx = useMemo(
    () => REALM_ORDER.indexOf(get('jingjie') as string),
    [get]
  );
  const handleNavigate = (item: DiFangType) => {
    set('zd.df', item.name);
    navigateTo('Main/pages/shilian/index', {
      events: {
        loader: item
      }
    });
  };
  return (
    <Container
      title='试炼大陆'
      desc='远古九神宗九位神尊以大修为在九界开辟了九座秘境，以供九界修士磨练，在这里将禁止一切术法，修士将面临强大的妖兽！'
    >
      <JXSpace direction='vertical' center>
        {dfList.map((v) => {
          const realmIdx = REALM_ORDER.indexOf(v.jingjie);
          const locked = realmIdx > playerRealmIdx;
          return (
            <JXButton
              key={v.name + v.jingjie}
              color='white'
              style={{ background: '#aaa' }}
              disabled={locked}
              onClick={() => handleNavigate(v)}
            >
              {v.name}（{v.jingjie}期）
              {locked ? '　境界不足' : ''}
            </JXButton>
          );
        })}
      </JXSpace>
    </Container>
  );
}
