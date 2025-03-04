import { Space, SpaceProps } from 'antd-mobile';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren, useMemo } from 'react';
import styles from './index.module.less';

export interface JXSpaceProps extends SpaceProps {
  gap?: number;
  center?: boolean;
  between?: boolean;
  flexOne?: boolean;
}

function JXSpace({
  gap,
  center,
  children,
  className,
  style,
  between,
  flexOne,
  ...props
}: PropsWithChildren<JXSpaceProps>) {
  const gapStyle = useMemo(
    () =>
      ({
        '--gap': gap ? `${gap}px` : undefined,
        '--gap-horizontal': gap ? `${gap}px` : undefined,
      }) as CSSProperties & {
        [k: string]: string;
      },
    [gap]
  );

  return (
    <Space
      className={classNames(
        className,
        styles.Space,
        center && styles.FlexCenter,
        between && styles.FlexBetween,
        flexOne && styles.FlexOne
      )}
      style={{ ...style, ...gapStyle }}
      {...props}
    >
      {children}
    </Space>
  );
}
export default JXSpace;
