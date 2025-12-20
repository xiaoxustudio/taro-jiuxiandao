import Box from '../Box';
import JXButton from '../Button';
import JXSpace from '../Space';
import styles from './index.module.less';

interface ItemCounterProps {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
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
            onClick={() => setCount(Math.max(count - item, 1))}
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
            onClick={() => setCount(count + item)}
          >
            +{item}
          </JXButton>
        ))}
      </Box>
    </JXSpace>
  );
}
export default ItemCounter;
