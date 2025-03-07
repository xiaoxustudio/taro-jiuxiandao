import classNames from 'classnames';
import { ReactNode } from 'react';
import Box, { BoxProps } from '../Box';
import styles from './list-item.module.less';

interface ListItemProps extends BoxProps {
  title: string | ReactNode;
  click: () => void;
}

function ListItem({ title, className, click }: ListItemProps) {
  return (
    <Box className={classNames(styles.ListItem, className)} onClick={click}>
      {title}
    </Box>
  );
}
export default ListItem;
