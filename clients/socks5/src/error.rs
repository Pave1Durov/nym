use nym_client_core::error::ClientCoreError;

#[derive(thiserror::Error, Debug)]
pub enum Socks5ClientError {
    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Failed to load config for: {0}")]
    FailedToLoadConfig(String),

    // TODO: add more details here
    #[error("Failed to validate the loaded config")]
    ConfigValidationFailure,

    #[error("Failed local version check, client and config mismatch")]
    FailedLocalVersionCheck,

    #[error("Fail to bind address")]
    FailToBindAddress,

    #[error("client-core error: {0}")]
    ClientCoreError(#[from] ClientCoreError),
}
