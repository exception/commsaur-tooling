import React from 'react';
import { Commsaur } from './CommsaurProvider';

type Props = {
    dino: Commsaur;
};

function UnwrapButton({ dino }: Props) {
    return (
        <button
            className={`text-center items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
        >
            <p className="font-bold text-md text-white">Unwrap Commsaur</p>
        </button>
    );
}

export default UnwrapButton;
