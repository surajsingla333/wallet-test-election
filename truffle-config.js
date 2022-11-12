const HDWalletProvider = require('@truffle/hdwallet-provider');
module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*" // Match any network id
        },
        matic: {
            provider: () => new HDWalletProvider("parent nasty again friend humble hand over exercise inhale crouch royal dignity", `https://rpc-mumbai.maticvigil.com/`),
            network_id: 80001,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
    }
};
