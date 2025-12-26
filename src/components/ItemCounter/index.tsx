import { IUseValueNotState } from '@/hooks/useValue';
import Box from '../Box';
import JXButton from '../Button';
import JXSpace from '../Space';
import styles from './index.module.less';

interface ItemCounterProps {
  count: number;
  setCount:
    | React.Dispatch<React.SetStateAction<number>>
    | IUseValueNotState<number>;
  indicator?: number[];
}

function ItemCounter({
  count,
  indicator = [1, 10, 100],
  setCount
}: ItemCounterProps) {
  return (
    <JXSpace direction='vertical' className={styles.JXItemCounter}>
      <Box>
        {indicator.map((item) => (
          <JXButton
            className={styles.JXItemCounterButton}
            key={item}
            onClick={() =>
              typeof setCount === 'function'
                ? setCount(Math.max(count - item, 1))
                : setCount.set(Math.max(count - item, 1))
            }
          >
            -{item}
          </JXButton>
        ))}
      </Box>
      <Box>
        {indicator.map((item) => (
          <JXButton
            className={styles.JXItemCounterButton}
            key={item}
            onClick={() =>
              typeof setCount === 'function'
                ? setCount(count + item)
                : setCount.set(count + item)
            }
          >
            +{item}
          </JXButton>
        ))}
      </Box>
    </JXSpace>
  );
}
export default ItemCounter;
