import React, { useCallback, useState } from 'react';
import {
    useAccount,
    useContractRead,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { pfpAddress } from '../abis/commsaur';
import { Commsaur, useCommsaurContext } from './CommsaurProvider';
import pfpAbi from '../abis/commsaur_pfp_abi.json';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import LoadingSpinner from './LoadingSpinner';

type Props = {
    dino: Commsaur;
    setError: (error: string) => void;
};

function UnwrapButton({ dino, setError }: Props) {
    const { data: account } = useAccount();
    const [isApproved, setIsApproved] = useState(false);
    const addRecent = useAddRecentTransaction();
    const [transactionHash, setTransactionHash] = useState<string>();
    const [wasUnwrapped, setWasUnwrapped] = useState(false);
    const { toggleWrapped } = useCommsaurContext();

    const { isLoading: useTransactionSending } = useWaitForTransaction({
        hash: transactionHash,
        enabled: !!transactionHash,
        onSuccess() {
            toggleWrapped(dino.id, false);
            setWasUnwrapped(true);
        },
    });

    const { isLoading: isApprovedLoading } = useContractRead(
        {
            addressOrName: pfpAddress,
            contractInterface: pfpAbi,
        },
        'isApprovedForAll',
        {
            args: [account?.address, pfpAddress],
            enabled: !!account,
            onSuccess(data) {
                if (typeof data === 'boolean') {
                    setIsApproved(data);
                }
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const { isLoading: approvedWriting, write: approveContract } =
        useContractWrite(
            {
                addressOrName: pfpAddress,
                contractInterface: pfpAbi,
            },
            'setApprovalForAll',
            {
                args: [pfpAddress, true],
                onSuccess() {
                    setIsApproved(true);
                },
                onError(error) {
                    setError(error.message);
                },
            },
        );

    const { isLoading: unwrapping, write: unwrap } = useContractWrite(
        {
            addressOrName: pfpAddress,
            contractInterface: pfpAbi,
        },
        'safeTransferFrom(address,address,uint256)',
        {
            args: [account?.address, pfpAddress, dino.id],
            onSuccess(tx) {
                addRecent({
                    hash: tx.hash,
                    description: `Wrap Commsaur ${dino.id}`,
                });

                setTransactionHash(tx.hash);
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const doClick = useCallback(() => {
        if (!isApproved && !approvedWriting) {
            approveContract();
        }

        if (!useTransactionSending && isApproved) {
            unwrap();
        }
    }, [
        isApproved,
        approvedWriting,
        approveContract,
        useTransactionSending,
        unwrap,
    ]);

    return (
        <button
            onClick={doClick}
            disabled={isApprovedLoading || approvedWriting}
            className={`flex text-center items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
        >
            {wasUnwrapped && (
                <p className="font-bold text-md text-white">Dino unwrapped!</p>
            )}
            {(isApprovedLoading ||
                approvedWriting ||
                useTransactionSending ||
                unwrapping) && <LoadingSpinner />}
            {!isApprovedLoading && !isApproved && !approvedWriting && (
                <p className="font-bold text-md text-white">Approve Contract</p>
            )}
            {isApproved && !wasUnwrapped && !approvedWriting && (
                <p className="font-bold text-md text-white">Unwrap Commsaur</p>
            )}
        </button>
    );
}

export default UnwrapButton;
