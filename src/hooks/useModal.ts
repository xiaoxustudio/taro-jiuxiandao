import { useRef } from 'react';

export interface useModalProps {
  okData: any;
}

function useModal(): useModalProps {
  const okData = useRef<Record<string, any>>({});

  return { okData };
}
export default useModal;
