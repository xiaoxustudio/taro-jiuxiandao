import classNames from 'classnames';
import { ReactNode } from 'react';
import JXSpace, { JXSpaceProps } from '../Space';
import styles from './index.module.less';
import ListItem from './list-item';

export interface ListItemData {
  key: string;
  title: string | ReactNode;
  value: string;
  click?: (item: ListItemData) => void;
}

interface ListProps extends JXSpaceProps {
  item?: ReactNode;
  list: ListItemData[];
}

function List({ list }: ListProps) {
  return (
    <JXSpace className={classNames(styles.List)} direction='vertical'>
      {list.map((v, index) => (
        <ListItem
          key={`list-item__${v.key}-${index}`}
          title={v.title}
          click={() => v.click?.(v)}
        />
      ))}
    </JXSpace>
  );
}

export default List;
