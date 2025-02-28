import { View } from '@tarojs/components';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface TextProps {
  size: number; // 文字大小
  bold: boolean; // 加粗
  center: boolean; // 居中对齐
  color: string;
  className: string;
  verticalText: boolean; // 垂直排列
  space: number; // 文字间距
  inline: boolean; // 行
  noWrap: boolean; // 不换行
  textShadow: boolean; // 文字阴影
  style: CSSProperties;
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
  noWrap,
  ...props
}: PropsWithChildren<Partial<TextProps>>) {
  return (
    <View
      className={classNames(styles.Text, className, {
        [styles.FlexCenter]: center,
        [styles.TextVertical]: verticalText,
        [styles.TextNoWrap]: noWrap,
      })}
      style={{
        ...style,
        fontWeight: bold ? 'bold' : '',
        fontSize: size ? `${size}px` : '',
        color: color ? color : '',
        letterSpacing: space ? `${space}px` : '',
        display: inline ? `inline-block` : '',
        textShadow: textShadow ? `2px 2px 2px grey` : '',
      }}
      {...props}
    >
      {children}
    </View>
  );
}
export default Text;
