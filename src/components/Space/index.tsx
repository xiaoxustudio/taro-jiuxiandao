import { Space, SpaceProps } from 'antd-mobile';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren, useMemo } from 'react';
import styles from './index.module.less';

export interface JXSpaceProps extends SpaceProps {
  gap?: number;
  center?: boolean;
}

function JXSpace({
  gap,
  center,
  children,
  className,
  style,
  ...props
}: PropsWithChildren<JXSpaceProps>) {
  const gapStyle = useMemo(
    () =>
      ({ '--gap': gap ? `${gap}px` : undefined }) as CSSProperties & {
        [k: string]: string;
      },
    [gap]
  );
  return (
    <Space
      className={classNames(className, center && styles.FlexCenter)}
      style={{ ...style, ...gapStyle }}
      {...props}
    >
      {children}
    </Space>
  );
}
export default JXSpace;
