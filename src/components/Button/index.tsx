import { Button, ButtonProps } from 'antd-mobile';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface JXButtonProps extends Omit<ButtonProps, 'color'> {
  color?: string;
  width: number | string;
  height: number;
  className: string;
  shadow: boolean; // 阴影
  transparent: boolean; // 背景透明
}

function JXButton({
  width,
  height,
  children,
  style,
  className,
  transparent,
  shadow,
  color,
  ...props
}: PropsWithChildren<Partial<JXButtonProps>>) {
  return (
    <Button
      className={classNames(
        styles.JXButton,
        shadow && styles.JXButtonShadow,
        className
      )}
      style={{
        ...style,
        // eslint-disable-next-line no-nested-ternary
        width: width
          ? typeof width === 'number'
            ? `${width}px`
            : width
          : undefined,
        height: height && `${height}px`,
        color: color || undefined,
        ...(transparent ? { '--background-color': 'transparent' } : {})
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
export default JXButton;
