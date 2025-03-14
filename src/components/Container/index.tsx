import { View, ViewProps } from '@tarojs/components';
import classNames from 'classnames';
import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { useReady, createSelectorQuery } from '@tarojs/taro';
import { CreateUniqueIndex } from '@/utils';
import JXDivider from '../Divider';
import JXSpace from '../Space';
import Text from '../Text';
import styles from './index.module.less';
import useContainer from '../../hooks/useContainer';

interface ContainerProps extends ViewProps {
  title: string | ReactNode;
  desc: string | ReactNode;
  className: string;
  scroll?: boolean;
  context?: ReturnType<typeof useContainer>;
}

function Container({
  title,
  desc,
  children,
  className,
  scroll,
  context,
  ...props
}: PropsWithChildren<Partial<ContainerProps>>) {
  const id = useRef(`Conatiner-Header-${CreateUniqueIndex()}`);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    context?.setCalcHeight(height);
  }, [context, height]);

  useReady(() => {
    createSelectorQuery()
      .select(`#${id.current}`)
      .boundingClientRect()
      .exec(([res]) => {
        setHeight(res.height);
      });
  });
  return (
    <View className={classNames(styles.Container, className)} {...props}>
      <View id={id.current}>
        <JXSpace direction='vertical'>
          <Text className={styles.Title} textShadow size={25}>
            {title}
          </Text>
          {desc && (
            <Text className={styles.Desc} size={14}>
              {desc}
            </Text>
          )}
        </JXSpace>
        <JXDivider />
      </View>
      {children}
    </View>
  );
}
export default Container;
