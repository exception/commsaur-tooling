import { BigNumber } from 'ethers';
import React, {
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { commsaurAddress, pfpAddress } from '../abis/commsaur';
import abi from '../abis/commsaur_abi.json';
import pfpAbi from '../abis/commsaur_pfp_abi.json';
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
};

const CommsaurCtx = React.createContext<CommsaurContext | null>(null);

type Props = {
    children: ReactNode;
};

function CommsaurProvider({ children }: Props) {
    const { data: account } = useAccount();
    const [wrappedAmount, setWrappedAmount] = useState(0);
    const [saurAmount, setSaurAmount] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const [idx, setIdx] = useState(0);
    const [pfpIdx, setPfpIdx] = useState(0);
    const [herd, setHerd] = useState<Commsaur[]>([]);

    useContractRead(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'balanceOf',
        {
            args: account?.address,
            enabled: !!account,
            onSuccess(data) {
                const bId = data as unknown as BigNumber;
                const id = bId.toNumber();
                setSaurAmount(id);
            },
            onError(error) {
                setError(error);
            },
        },
    );

    useContractRead(
        {
            addressOrName: pfpAddress,
            contractInterface: pfpAbi,
        },
        'balanceOf',
        {
            args: account?.address,
            enabled: !!account,
            onSuccess(data) {
                const bId = data as unknown as BigNumber;
                const id = bId.toNumber();
                setWrappedAmount(id);
            },
            onError(error) {
                setError(error);
            },
        },
    );

    const { refetch: refetchWrapped } = useContractRead(
        {
            addressOrName: pfpAddress,
            contractInterface: pfpAbi,
        },
        'tokenOfOwnerByIndex',
        {
            args: [account?.address, pfpIdx],
            enabled: !!account && wrappedAmount > 0 && pfpIdx < wrappedAmount,
            onSuccess(data) {
                const bId = data as unknown as BigNumber;
                const id = bId.toNumber();
                setHerd((old) => [
                    ...old,
                    {
                        id,
                        wrapped: true,
                        url: `https://commsaur.mypinata.cloud/ipfs/QmU8QgaDxi8s3y9PhjYL9a5oeEUkQvGeHP1U7irqjuXaPu/${id}.png`,
                    },
                ]);
                setPfpIdx((old) => old + 1);
            },
            onError(error) {
                setError(error);
            },
        },
    );

    const { refetch } = useContractRead(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'tokenOfOwnerByIndex',
        {
            args: [account?.address, idx],
            enabled: !!account && saurAmount > 0 && idx < saurAmount,
            onSuccess(data) {
                const bId = data as unknown as BigNumber;
                const id = bId.toNumber();
                setHerd((old) => [
                    ...old,
                    {
                        id: id,
                        wrapped: false,
                        url: `https://commsaur.mypinata.cloud/ipfs/Qme4mFVx1y2sqzTEDBvHTCnhFZJaaFP2ULXj6Rb5Xx32ui/${id}.jpeg`,
                    },
                ]);
                setIdx((old) => old + 1);
            },
            onError(error) {
                setError(error);
            },
        },
    );

    const reset = useCallback(() => {
        setError(null);
        refetch();
        refetchWrapped();
        setIdx(0);
        setPfpIdx(0);
        setHerd([]);
    }, [refetch, refetchWrapped]);

    const ctx: CommsaurContext = {
        herd: herd.sort((a, b) => a.id - b.id),
        originalSize: saurAmount + wrappedAmount,
        reset,
        error,
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
