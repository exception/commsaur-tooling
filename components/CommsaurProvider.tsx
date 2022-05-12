import React, {
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAccount } from 'wagmi';
import { commsaurAddress } from '../abis/commsaur';
import abi from '../abis/commsaur_abi.json';
import useContractBigNumber from '../hooks/useContractBigNumber';

export type Commsaur = {
    id: number;
    wrapped?: boolean;
    url: string;
};

type CommsaurContext = {
    herd: Commsaur[];
    originalSize: number;
    reset: () => void;
    error: Error | null;
    isLoading: boolean;
};

const CommsaurCtx = React.createContext<CommsaurContext | null>(null);

type Props = {
    children: ReactNode;
};

function CommsaurProvider({ children }: Props) {
    const { data: account } = useAccount();
    const [saurAmount, setSaurAmount] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const [lastId, setLastId] = useState(-1);

    const [idx, setIdx] = useState(0);
    const [herd, setHerd] = useState<Commsaur[]>([]);

    const {
        value,
        isLoading: balanceLoading,
        error: balanceError,
        refetch,
    } = useContractBigNumber(
        {
            address: commsaurAddress,
            abi,
        },
        'balanceOf',
        {
            args: account?.address,
        },
        !!account && saurAmount == 0,
    );

    const {
        value: currentId,
        isLoading: currentLoading,
        error: currentError,
    } = useContractBigNumber(
        {
            address: commsaurAddress,
            abi,
        },
        'tokenOfOwnerByIndex',
        {
            args: [account?.address, idx],
        },
        !!account && saurAmount > 0 && value != -1 && idx < saurAmount,
    );

    const reset = useCallback(() => {
        refetch();
        setError(null);
        setIdx(0);
        setHerd([]);
    }, [refetch]);

    useEffect(() => {
        if (balanceError) {
            setError(balanceError);
            return;
        }

        if (!balanceLoading && !balanceError) {
            setSaurAmount(value);
        }
    }, [value, balanceLoading, balanceError]);

    useEffect(() => {
        if (currentError) {
            setError(currentError);
            return;
        }

        if (currentId == lastId) return;

        if (!currentLoading && !currentError) {
            setLastId(currentId);
            setHerd((old) => [
                ...old,
                {
                    id: currentId,
                    wrapped: false,
                    url: `https://commsaur.mypinata.cloud/ipfs/Qme4mFVx1y2sqzTEDBvHTCnhFZJaaFP2ULXj6Rb5Xx32ui/${currentId}.jpeg`,
                },
            ]);
            setIdx((old) => old + 1);
        }
    }, [currentId, currentLoading, currentError, idx, saurAmount, lastId]);

    const ctx: CommsaurContext = {
        herd,
        originalSize: saurAmount,
        reset,
        error,
        isLoading: balanceLoading,
    };

    return <CommsaurCtx.Provider value={ctx}>{children}</CommsaurCtx.Provider>;
}

export function useCommsaurContext() {
    const ctx = useContext(CommsaurCtx);
    if (ctx == null) {
        throw new Error(
            'useCommsaurContext must be called within a CommsaurProvider',
        );
    }

    return ctx;
}

export default CommsaurProvider;
