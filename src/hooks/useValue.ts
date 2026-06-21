import { useState } from 'react';

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
  const obj: IUseValueNotState<T> = {
    get value() {
      return data;
    },
    set(value: T) {
      setData(value);
    }
  };

  if (state) return [data, obj];
  return obj;
}
export default useValue;
