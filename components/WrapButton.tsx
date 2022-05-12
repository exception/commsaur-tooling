import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import React, { useCallback, useState } from 'react';
import {
    useAccount,
    useContractRead,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { commsaurAddress, pfpAddress } from '../abis/commsaur';
import { Commsaur } from './CommsaurProvider';
import LoadingSpinner from './LoadingSpinner';
import abi from '../abis/commsaur_abi.json';
import pfpAbi from '../abis/commsaur_pfp_abi.json';

type Props = {
    dino: Commsaur;
    acknowledged: boolean;
    setShowWarning: (shown: boolean) => void;
    setError: (error: string) => void;
};

function WrapButton({ acknowledged, dino, setShowWarning, setError }: Props) {
    const [wrapping, setWrapping] = useState(false);
    const { data: account } = useAccount();
    const [isApproved, setIsApproved] = useState(false);
    const addRecent = useAddRecentTransaction();
    const [transactionHash, setTransactionHash] = useState<string>();

    const { isLoading: useTransactionSending, isSuccess: wasWrapped } =
        useWaitForTransaction({
            hash: transactionHash,
            enabled: !!transactionHash,
            onSuccess() {
                setWrapping(false);
                dino.wrapped = true;
            },
        });

    const { isLoading: isApprovedLoading } = useContractRead(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'isApprovedForAll',
        {
            args: [account?.address, commsaurAddress],
            enabled: acknowledged,
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

    const { isLoading: approveLoading, write } = useContractWrite(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'setApprovalForAll',
        {
            args: [commsaurAddress, true],
            onSuccess() {
                setIsApproved(true);
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const {
        data: wrapData,
        error: wrapError,
        isLoading: wrapLoading,
        write: wrapDinoCall,
    } = useContractWrite(
        {
            addressOrName: commsaurAddress,
            contractInterface: pfpAbi,
        },
        'safeTransferFrom(address,address,uint256)',
        {
            args: [account?.address, pfpAddress, dino.id],
            onSuccess(tx) {
                console.log('added', tx);
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
        if (!acknowledged) {
            setShowWarning(true);
            return;
        }

        setError('');

        if (!isApproved && !isApprovedLoading) {
            write();
        } else if (isApproved && !wrapLoading) {
            wrapDinoCall();
        }
    }, [
        acknowledged,
        isApproved,
        isApprovedLoading,
        write,
        wrapLoading,
        wrapDinoCall,
        setShowWarning,
        setError,
    ]);

    return (
        <button
            disabled={wrapping && (isApprovedLoading || approveLoading)}
            onClick={doClick}
            className={`text-center items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
        >
            {wasWrapped && (
                <p className="font-bold text-md text-white">Dino Wrapped!</p>
            )}
            {!acknowledged && !wasWrapped && (
                <p className="font-bold text-md text-white">Wrap into PFP</p>
            )}
            {wrapping &&
                (isApprovedLoading ||
                    approveLoading ||
                    useTransactionSending) && (
                    <p>
                        <LoadingSpinner />
                    </p>
                )}
            {acknowledged &&
                !isApprovedLoading &&
                !isApproved &&
                !approveLoading && (
                    <p className="font-bold text-md text-white">
                        Approve Contract
                    </p>
                )}
            {acknowledged && isApproved && !approveLoading && (
                <p className="font-bold text-md text-white">Wrap now!</p>
            )}
        </button>
    );
}

export default WrapButton;
