import { useMemo, useState } from 'react';

export interface useModalProps {
  visiableModal: boolean;
  state: {
    visiableModal: boolean;
    setVisiableModal: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

function useModal(): useModalProps {
  const [visiableModal, setVisiableModal] = useState(false);
  const hookReturn = useMemo(
    () => ({ visiableModal, state: { visiableModal, setVisiableModal } }),
    [visiableModal]
  );
  return hookReturn;
}

export default useModal;
