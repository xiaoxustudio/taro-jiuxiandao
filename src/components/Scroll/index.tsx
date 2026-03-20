import { View, ViewProps } from '@tarojs/components';
import { createSelectorQuery, useReady } from '@tarojs/taro';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import classNames from 'classnames';
import { CreateUniqueIndex } from '@/utils';
import useScroll from '@/hooks/useScroll';
import styles from './index.module.less';

export interface ScrollProps extends ViewProps {
  calc?: number; // 手动传入已使用的高度
  Scroll?: ReturnType<typeof useScroll>; // 操作hook
  bottomBlankSpace?: number; // 底部空白区域
}

function Scroll({
  className,
  children,
  calc,
  Scroll: ScrollHook,
  bottomBlankSpace = 0,
  ...props
}: PropsWithChildren<ScrollProps>) {
  const ScrollRef = useRef(null);
  const id = useRef(`Conatiner-Header-${CreateUniqueIndex()}`);
  const [height, setHeight] = useState(0);

  const computeHeight = useCallback(
    (used: number) => {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
      return Math.max(0, vh - used - bottomBlankSpace);
    },
    [bottomBlankSpace]
  );

  useEffect(() => {
    if (calc) setHeight(computeHeight(calc));
  }, [calc, computeHeight]);

  useReady(() => {
    if (calc) {
      setHeight(computeHeight(calc));
      return;
    }
    if (ScrollRef.current && ScrollHook) {
      ScrollHook.scrollRef.current = ScrollRef.current;
    }
    const select = createSelectorQuery().select(`#${id.current}`);
    select.boundingClientRect().exec(([res]) => {
      const top = (res?.top as number) || 0;
      setHeight(computeHeight(top));
    });
  });

  useEffect(() => {
    const handler = () => {
      if (calc) {
        setHeight(computeHeight(calc));
        return;
      }
      const select = createSelectorQuery().select(`#${id.current}`);
      select.boundingClientRect().exec(([res]) => {
        const top = (res?.top as number) || 0;
        setHeight(computeHeight(top));
      });
    };
    handler();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handler);
      }
    };
  }, [calc, computeHeight]);
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
