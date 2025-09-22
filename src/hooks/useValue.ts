import { useState } from 'react';

export interface IUseValueNotState<T> {
  _value: T;
  value: T;
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
  const obj = {
    _value: data,
    set(value: T) {
      this._value = value;
      setData(value);
    },
    get value() {
      return this._value;
    },
    set value(value) {
      this.set(value);
    }
  };

  if (state) return [data, obj];
  return obj;
}
export default useValue;
