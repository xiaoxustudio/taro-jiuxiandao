import { View, ViewProps } from '@tarojs/components';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface TextProps extends ViewProps {
  size?: number;
  bold?: boolean;
  center?: boolean;
  color?: string;
  className?: string;
  verticalText?: boolean;
  space?: number;
  inline?: boolean;
  noWrap?: boolean;
  textShadow?: boolean;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}

function Text({
  bold,
  size,
  style,
  color,
  children,
  space,
  center,
  className,
  inline,
  textShadow,
  verticalText,
  align,
  noWrap,
  ...props
}: PropsWithChildren<Partial<TextProps>>) {
  return (
    <View
      className={classNames(styles.Text, className, {
        [styles.FlexCenter]: center,
        [styles.TextVertical]: verticalText,
        [styles.TextNoWrap]: noWrap
      })}
      style={{
        ...style,
        fontWeight: bold ? 'bold' : '',
        fontSize: size ? `${size}px` : '',
        color: color || '',
        letterSpacing: space ? `${space}px` : '',
        display: inline ? `inline-block` : '',
        textShadow: textShadow ? `2px 2px 2px grey` : '',
        textAlign: align || undefined
      }}
      {...props}
    >
      {children}
    </View>
  );
}
export default Text;
