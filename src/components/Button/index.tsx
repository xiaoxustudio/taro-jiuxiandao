import { Button, ButtonProps } from 'antd-mobile';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface JXButtonProps extends ButtonProps {
  width: number;
  className: string;
}

function JXButton({
  width,
  children,
  style,
  className,
  ...props
}: PropsWithChildren<Partial<JXButtonProps>>) {
  return (
    <Button
      className={classNames(styles.JXButton, className)}
      style={{ ...style, width: width && `${width}px` }}
      {...props}
    >
      {children}
    </Button>
  );
}
export default JXButton;
