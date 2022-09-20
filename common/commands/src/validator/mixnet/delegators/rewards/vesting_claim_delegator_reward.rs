// Copyright 2021 - Nym Technologies SA <contact@nymtech.net>
// SPDX-License-Identifier: Apache-2.0

use crate::context::SigningClient;
use clap::Parser;
use log::info;
use mixnet_contract_common::NodeId;
use validator_client::nymd::traits::{MixnetQueryClient, MixnetSigningClient};

#[derive(Debug, Parser)]
pub struct Args {
    #[clap(long)]
    pub mix_id: Option<NodeId>,

    #[clap(long)]
    pub identity_key: Option<String>,
}

pub async fn vesting_claim_delegator_reward(args: Args, client: SigningClient) {
    info!("Claim vesting delegator reward");

    let mix_id = match args.mix_id {
        Some(mix_id) => mix_id,
        None => {
            let identity_key = args
                .identity_key
                .expect("either mix_id or mix_identity has to be specified");
            let node_details = client
                .get_mixnode_details_by_identity(identity_key)
                .await
                .expect("contract query failed")
                .expect("mixnode with the specified identity doesnt exist");
            node_details.mix_id()
        }
    };

    let res = client
        .withdraw_delegator_reward_on_behalf(client.address().clone(), mix_id, None)
        .await
        .expect("failed to claim vesting delegator-reward");

    info!("Claiming vesting delegator reward: {:?}", res)
}