import { Button, ButtonProps } from 'antd-mobile';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface JXButtonProps extends ButtonProps {
  width: number;
  height: number;
  className: string;
  transparent: boolean; // 背景透明
}

function JXButton({
  width,
  height,
  children,
  style,
  className,
  transparent,
  ...props
}: PropsWithChildren<Partial<JXButtonProps>>) {
  return (
    <Button
      className={classNames(styles.JXButton, className)}
      style={{
        ...style,
        width: width && `${width}px`,
        height: height && `${height}px`,
        ...(transparent ? { '--background-color': 'transparent' } : {}),
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
export default JXButton;
