import { View, ViewProps } from '@tarojs/components';
import { createSelectorQuery, useReady } from '@tarojs/taro';
import { PropsWithChildren, useRef, useState } from 'react';
import { CreateUniqueIndex } from '@/utils';
import styles from './index.module.less';

export interface ScrollProps extends ViewProps {}

function Scroll({ children }: PropsWithChildren<ScrollProps>) {
  const id = useRef(`Conatiner-Header-${CreateUniqueIndex()}`);
  const [height, setHeight] = useState(0);
  useReady(() => {
    createSelectorQuery()
      .select(`#${id.current}`)
      .boundingClientRect()
      .exec(([res]) => {
        setHeight(res.height);
      });
  });
  return (
    <View
      className={styles.Scroll}
      id={id.current}
      style={{ height: height ? `${height}px` : '' }}
    >
      {children}
    </View>
  );
}
export default Scroll;
