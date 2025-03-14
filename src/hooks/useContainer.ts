import { Dispatch, SetStateAction, useState } from 'react';

export interface useContainerProps {
  calcHeight: number;
  setCalcHeight: Dispatch<SetStateAction<number>>;
}

function useContainer(): useContainerProps {
  const [calcHeight, setCalcHeight] = useState(0);
  return { calcHeight, setCalcHeight };
}
export default useContainer;
