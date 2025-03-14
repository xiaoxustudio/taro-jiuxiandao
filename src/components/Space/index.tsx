import { Space, SpaceProps } from 'antd-mobile';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren, useMemo, useRef } from 'react';
import { CreateUniqueIndex } from '@/utils';
import { Text } from '@/components';
import styles from './index.module.less';

export interface JXSpaceProps extends SpaceProps {
  title?: string;
  gap?: number;
  center?: boolean;
  between?: boolean;
  flexOne?: boolean; // 子项设置flex:1
  hscroll?: boolean; // 横向滚动（可能和其他属性冲突）
  noFlex?: boolean; // 取消Flex使用block
}

function JXSpace({
  gap,
  center,
  children,
  className,
  style,
  between,
  flexOne,
  hscroll,
  noFlex,
  title,
  ...props
}: PropsWithChildren<JXSpaceProps>) {
  const id = useRef(`Space-${CreateUniqueIndex()}`);
  const gapStyle = useMemo(
    () =>
      ({
        '--gap': gap ? `${gap}px` : undefined,
        '--gap-horizontal': gap ? `${gap}px` : undefined,
        display: noFlex && 'block'
      }) as CSSProperties & {
        [k: string]: string;
      },
    [gap, noFlex]
  );

  return (
    <Space
      data-id={id.current}
      className={classNames(
        className,
        styles.Space,
        center && styles.FlexCenter,
        between && styles.FlexBetween,
        flexOne && styles.FlexOne,
        hscroll && styles.HScroll
      )}
      style={{ ...style, ...gapStyle }}
      {...props}
    >
      {title && (
        <Text className={styles.SpaceTitle} size={18}>
          {title}
        </Text>
      )}
      {children}
    </Space>
  );
}
export default JXSpace;
