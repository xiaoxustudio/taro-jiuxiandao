import classNames from 'classnames';
import { ReactNode } from 'react';
import JXSpace, { JXSpaceProps } from '../Space';
import Text from '../Text';
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
  emptyText?: string;
}

function List({
  list,
  noFlex,
  emptyText = '暂无数据',
  className,
  style,
  ...props
}: ListProps) {
  return (
    <JXSpace
      className={classNames(
        styles.List,
        noFlex && styles.ListNoFlex,
        className
      )}
      direction='vertical'
      style={style}
      {...props}
    >
      {list.length ? (
        list.map((v, index) => (
          <ListItem
            key={`list-item__${v.key}-${index}`}
            title={v.title}
            value={v.value}
            click={() => v.click?.(v)}
          />
        ))
      ) : (
        <Text color='#999'>{emptyText}</Text>
      )}
    </JXSpace>
  );
}

export default List;
