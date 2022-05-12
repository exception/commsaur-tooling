import { ContractInterface } from 'ethers';
import abi from './commsaur_abi.json';

export const commsaurAddress: string = process.env.NODE_ENV === 'production' ? '0xbacb34bcf94442dba033e9cf7216888b8170f0ce' : '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const pfpAddress: string = process.env.NODE_ENV === 'production' ? '' : '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';