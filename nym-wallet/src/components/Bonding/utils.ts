import { Gateway, MixNode, MixNodeCostParams } from '@nymproject/types';
import { GatewayData, MixnodeAmount, MixnodeData } from '../../pages/bonding/types';
import { toPercentFloatString } from '../../utils';

export function mixnodeToTauri(data: MixnodeData): MixNode {
  return {
    ...data,
    mix_port: data.mixPort,
    http_api_port: data.httpApiPort,
    verloc_port: data.verlocPort,
    sphinx_key: data.sphinxKey,
    identity_key: data.identityKey,
  };
}

export function costParamsToTauri(data: MixnodeAmount): MixNodeCostParams {
  return {
    profit_margin_percent: toPercentFloatString(data.profitMargin),
    interval_operating_cost: {
      amount: data.operatorCost.amount.toString(),
      denom: data.operatorCost.denom,
    },
  };
}

export function gatewayToTauri(data: GatewayData): Gateway {
  return {
    ...data,
    host: data.host,
    version: data.version,
    mix_port: data.mixPort,
    clients_port: data.clientsPort,
    sphinx_key: data.sphinxKey,
    identity_key: data.identityKey,
    location: data.location,
  };
}
