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
  verticalText,
  ...props
}: PropsWithChildren<Partial<TextProps>>) {
  return (
    <View
      className={classNames(styles.Text, className, {
        [styles.FlexCenter]: center,
        [styles.TextVertical]: verticalText,
      })}
      style={{
        ...style,
        fontWeight: bold ? 'bold' : '',
        fontSize: size ? `${size}px` : '',
        color: color ? color : '',
        letterSpacing: space ? `${space}px` : '',
        display: inline ? `inline-block` : '',
      }}
      {...props}
    >
      {children}
    </View>
  );
}
export default Text;
