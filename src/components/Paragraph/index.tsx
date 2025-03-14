import { View } from '@tarojs/components';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface ParagraphProps {
  className?: string;
  NoIndent?: boolean;
}

function Paragraph({
  children,
  className,
  NoIndent,
  ...props
}: PropsWithChildren<ParagraphProps>) {
  return (
    <View
      className={classNames(styles.ParagraphBox, className, {
        [styles.NoIndent]: NoIndent
      })}
      {...props}
    >
      {children}
    </View>
  );
}
export default Paragraph;
