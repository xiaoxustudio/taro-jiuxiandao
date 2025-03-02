import { Divider, DividerProps } from 'antd-mobile';
import classNames from 'classnames';
import styles from './index.module.less';

interface JXDividerProps extends DividerProps {
  margin: string;
}

function JXDivider({ className, margin, ...props }: Partial<JXDividerProps>) {
  return (
    <Divider
      className={classNames(className, styles.Divider)}
      style={{
        margin,
      }}
      {...props}
    />
  );
}
export default JXDivider;
