import { ReadContractConfig } from "@wagmi/core";
import { BigNumber, ContractInterface } from "ethers";
import { useState } from "react";
import { useContractRead } from "wagmi";

type CallData = {
    address: string;
    abi: ContractInterface;
}

type ContractNumberRead = {
    value: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

function useContractBigNumber({ address, abi }: CallData, methodName: string, args: ReadContractConfig, enabled: boolean): ContractNumberRead {
    const [out, setOut] = useState(-1);
    const { isLoading, error, refetch } = useContractRead(
        {
            addressOrName: address,
            contractInterface: abi,
        },
        methodName,
        {
            ...args,
            enabled,
            watch: true,
            onSuccess (data) {
                if ('_hex' in data) {
                    const num = data as unknown as BigNumber;
                    const id = num.toNumber();
    
                    setOut(id)
                }
            }
        },
    );

    return { value: out, isLoading, error, refetch };
}

export default useContractBigNumber;