import React, { useContext, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import Big from 'big.js';
import { CurrencyFormField } from '@nymproject/react/currency/CurrencyFormField';
import { ModalListItem } from 'src/components/Modals/ModalListItem';
import { SimpleModal } from 'src/components/Modals/SimpleModal';
import { DecCoin } from '@nymproject/types';
import { ConfirmTx } from 'src/components/ConfirmTX';
import { useGetFee } from 'src/hooks/useGetFee';
import { decCoinToDisplay, validateAmount } from 'src/utils';
import { simulateUpdateBond, simulateVestingUpdateBond } from 'src/requests';
import { TSimulateUpdateBondArgs, TUpdateBondArgs } from 'src/types';
import { AppContext, TBondedMixnode } from 'src/context';
import { TPoolOption } from '../../TokenPoolSelector';

export const UpdateBondAmountModal = ({
  node,
  onUpdateBond,
  onClose,
  onError,
}: {
  node: TBondedMixnode;
  onUpdateBond: (data: TUpdateBondArgs, tokenPool: TPoolOption) => Promise<void>;
  onClose: () => void;
  onError: (e: string) => void;
}) => {
  const { bond: currentBond, proxy, stakeSaturation, uncappedStakeSaturation } = node;

  const { fee, getFee, resetFeeState, feeError } = useGetFee();
  const [newBond, setNewBond] = useState<DecCoin | undefined>();
  const [errorAmount, setErrorAmount] = useState(false);

  const { printBalance, printVestedBalance } = useContext(AppContext);

  useEffect(() => {
    if (feeError) {
      onError(feeError);
    }
  }, [feeError]);

  const handleConfirm = async () => {
    if (!newBond) {
      return;
    }
    const tokenPool = proxy ? 'locked' : 'balance';
    await onUpdateBond(
      {
        currentPledge: currentBond,
        newPledge: newBond,
        fee: fee?.fee,
      },
      tokenPool,
    );
  };

  const handleAmountChanged = async (value: DecCoin) => {
    const { amount } = value;
    setNewBond(value);
    if (!amount || !Number(amount)) {
      setErrorAmount(true);
    } else if (Big(amount).eq(currentBond.amount)) {
      setErrorAmount(true);
    } else {
      const validAmount = await validateAmount(amount, '1');
      if (!validAmount) {
        setErrorAmount(true);
        return;
      }
      setErrorAmount(false);
    }
  };

  const handleOnOk = async () => {
    if (!newBond) {
      return;
    }
    if (!proxy) {
      await getFee<TSimulateUpdateBondArgs>(simulateUpdateBond, {
        currentPledge: currentBond,
        newPledge: newBond,
      });
    } else {
      await getFee<TSimulateUpdateBondArgs>(simulateVestingUpdateBond, {
        currentPledge: currentBond,
        newPledge: newBond,
      });
    }
  };

  const newBondToDisplay = () => {
    const coin = decCoinToDisplay(newBond as DecCoin);
    return `${coin.amount} ${coin.denom}`;
  };

  if (fee)
    return (
      <ConfirmTx
        open
        header="Change bond details"
        fee={fee}
        onClose={onClose}
        onPrev={resetFeeState}
        onConfirm={handleConfirm}
      >
        <ModalListItem label="New bond details" value={newBondToDisplay()} divider />
        <ModalListItem label="Change bond details" value={`${currentBond.amount} ${currentBond.denom}`} divider />
      </ConfirmTx>
    );

  return (
    <SimpleModal
      open
      header="Change bond amount"
      subHeader="Add or reduce amount of tokens on your node"
      okLabel="Next"
      onOk={handleOnOk}
      okDisabled={errorAmount || !newBond}
      onClose={onClose}
    >
      <Stack gap={3}>
        <Box display="flex" gap={1}>
          <CurrencyFormField
            autoFocus
            label="New bond amount"
            denom={currentBond.denom}
            onChanged={(value) => {
              handleAmountChanged(value);
            }}
            fullWidth
            validationError={errorAmount ? 'Please enter a valid amount' : undefined}
          />
        </Box>

        <Box>
          <ModalListItem
            fontWeight={600}
            label={proxy ? 'Locked account balance' : 'Account balance'}
            value={proxy ? printVestedBalance || '-' : printBalance}
            divider
          />
          <ModalListItem label="Current bond amount" value={`${currentBond.amount} ${currentBond.denom}`} divider />
          {uncappedStakeSaturation ? (
            <ModalListItem
              label="Node saturation"
              value={`${uncappedStakeSaturation}%`}
              sxValue={{ color: 'error.main' }}
              divider
            />
          ) : (
            <ModalListItem label="Node saturation" value={`${stakeSaturation}%`} divider />
          )}
          <ModalListItem label="Est. fee for this operation will be calculated in the next page" value="" divider />
        </Box>
      </Stack>
    </SimpleModal>
  );
};
