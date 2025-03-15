import { View, ViewProps } from '@tarojs/components';
import { createSelectorQuery, useReady } from '@tarojs/taro';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { CreateUniqueIndex } from '@/utils';
import useScroll from '@/hooks/useScroll';
import styles from './index.module.less';

export interface ScrollProps extends ViewProps {
  calc?: number; // 手动传入已使用的高度
  Scroll?: ReturnType<typeof useScroll>; // 操作hook
}

function Scroll({
  className,
  children,
  calc,
  Scroll: ScrollHook,
  ...props
}: PropsWithChildren<ScrollProps>) {
  const ScrollRef = useRef(null);
  const id = useRef(`Conatiner-Header-${CreateUniqueIndex()}`);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (calc) setHeight(window.screen.height - calc);
  }, [calc]);

  useReady(() => {
    if (calc) {
      setHeight(window.screen.height - calc);
      return;
    }
    if (ScrollRef.current && ScrollHook) {
      ScrollHook.scrollRef.current = ScrollRef.current;
    }
    const select = createSelectorQuery().select(`#${id.current}`);
    select.boundingClientRect().exec(([res]) => {
      setHeight(res.height);
    });
  });
  return (
    <View
      ref={ScrollRef}
      className={classNames(styles.Scroll, className)}
      id={id.current}
      {...props}
      style={{ height: height ? `${height}px` : '' }}
    >
      {children}
    </View>
  );
}
export default Scroll;
