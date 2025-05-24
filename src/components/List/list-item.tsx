import classNames from 'classnames';
import { ReactNode } from 'react';
import Box, { BoxProps } from '../Box';
import Text from '../Text';
import styles from './list-item.module.less';

interface ListItemProps extends BoxProps {
  title: string | ReactNode;
  value: string | ReactNode;
  click: () => void;
}

function ListItem({ title, className, value, click }: ListItemProps) {
  return (
    <Box className={classNames(styles.ListItem, className)} onClick={click}>
      <Text>{title}</Text>
      <Text>{value}</Text>
    </Box>
  );
}
export default ListItem;
