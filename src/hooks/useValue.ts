import { useState, useRef, useMemo } from 'react';

export interface IUseValueNotState<T> {
  readonly value: T;
  set(value: T): void;
}

export type IUseValueState<T> = [T, IUseValueNotState<T>];

function useValue<T>(initialdata: T, state: true): IUseValueState<T>;
function useValue<T>(initialdata: T, state?: false): IUseValueNotState<T>;
function useValue<T>(
  initialdata: T,
  state = false
): IUseValueNotState<T> | IUseValueState<T> {
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

  if (state) return [data, obj];
  return obj;
}
export default useValue;
