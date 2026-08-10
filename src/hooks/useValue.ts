import { useState, useRef, useMemo } from 'react';

export interface IUseValueNotState<T> {
  readonly value: T;
  set(value: T): void;
}

function useValue<T>(initialdata: T): IUseValueNotState<T> {
  const [data, setData] = useState(initialdata);
  const ref = useRef(data);
  ref.current = data;

  const obj = useMemo<IUseValueNotState<T>>(
    () => ({
      get value() {
        return ref.current;
      },
      set(value: T) {
        ref.current = value;
        setData(value);
      }
    }),
    []
  );

  return obj;
}
export default useValue;
