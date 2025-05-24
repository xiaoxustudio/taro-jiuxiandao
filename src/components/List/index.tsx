import classNames from 'classnames';
import { ReactNode } from 'react';
import JXSpace, { JXSpaceProps } from '../Space';
import styles from './index.module.less';
import ListItem from './list-item';

export interface ListItemData {
  key: string;
  title: string | ReactNode;
  value: string;
  // eslint-disable-next-line no-unused-vars
  click?: (item: ListItemData) => void;
}

interface ListProps extends JXSpaceProps {
  list: ListItemData[];
  noFlex?: boolean;
}

function List({ list, noFlex }: ListProps) {
  return (
    <JXSpace
      className={classNames(styles.List, noFlex && styles.ListNoFlex)}
      direction='vertical'
    >
      {list.map((v, index) => (
        <ListItem
          key={`list-item__${v.key}-${index}`}
          title={v.title}
          value={v.value}
          click={() => v.click?.(v)}
        />
      ))}
    </JXSpace>
  );
}

export default List;
