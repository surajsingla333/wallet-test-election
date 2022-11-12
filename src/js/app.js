App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  networkId: '0',

  receiver: "0x81aedab1980e7695e058f8b5c03e54b0a914a8b1",

  init: function () {
    setTimeout(() => {
      return window.addEventListener('load', App.initWeb3())
    }, 5000)

  },

  initWeb3: async function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      console.log("1")
      // If a web3 instance is already provided by Meta Mask.
      // App.web3Provider = web3.currentProvider;
      // web3 = new Web3(web3.currentProvider);

      // App.web3Provider = window.ethereum.provider;
      // web3 = new Web3(window.ethereum.provider);

      // await window.ethereum.provider.enable();

      App.web3Provider = window.ethereum.provider;

      console.log("window.ethereum.provider , ", window.ethereum.provider)
      // web3 = new Web3(window.ethereum.provider);
      web3 = new Web3(window.ethereum.provider);
      console.log({web3})

      // await window.ethereum.provider.enable();

      // setTimeout(() => {

      //   console.log("1 ", window.safle)
      // }, 5000)


      // window.addEventListener('load', window.ethereum.provider.enable())
      // window.addEventListener('load', () => { console.log("1 ", window.safle) })


      console.log("2")


      console.log({ web3 })


      // // web3.eth.personal.getAccounts()
      // web3.eth.getAccounts()
      //   .then((r) => { console.log("r ", r) })
      // // .eth.getAccounts((e) => { console.log({ e }) })

    } else {
      // Specify default instance if no web3 instance provided
      // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      App.web3Provider = window.ethereum.provider
      web3 = new Web3(App.web3Provider);
    }

    const accounts = await web3.eth.getAccounts()
    console.log({ accounts })
    App.account =accounts[0]

    App.networkId = await web3.eth.net.getId();

    console.log({ networkId: App.networkId })

    // // const estimateGas = await web3.eth.estimateGas({from:"0x76f28a6112a3f6eb1201786b9044704b19926963" , to:"0xd5801e2abf410ccfd11e7b92906a33bdb28b8162" , data: "0x0121b93f0000000000000000000000000000000000000000000000000000000000000001"})
    // const estimateGas = await web3.eth.estimateGas({to:"0xd5801e2abf410ccfd11e7b92906a33bdb28b8162"})
    // console.log({estimateGas})

    // return App.render();
    return App.initContract();
  },

  initContract: function () {

    $.getJSON("Election.json", function (election) {
      try {

        console.log("!@FFD")
        console.log(election)

        const deployedNetwork = election.networks[App.networkId];

        App.contracts.Election = new web3.eth.Contract(
          election.abi,
          deployedNetwork && deployedNetwork.address,
        );

      } catch (e) {
        console.log({ e })
      }

      return App.render();

    })

    // $.getJSON("Election.json", function (election) {
    //   // Instantiate a new truffle contract from the artifact
    //   App.contracts.Election = TruffleContract(election);
    //   // Connect provider to interact with contract
    //   App.contracts.Election.setProvider(App.web3Provider);

    //   // App.listenForEvents();

    //   return App.render();
    // });
  },

  // Listen for events emitted from the contract
  // listenForEvents: function () {
  //   App.contracts.Election.deployed().then(function (instance) {
  //     // Restart Chrome if you are unable to receive this event
  //     // This is a known issue with Metamask
  //     // https://github.com/MetaMask/metamask-extension/issues/2393
  //     instance.votedEvent({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function (error, event) {
  //       console.log("event triggered", event)
  //       // Reload when a new vote is recorded
  //       App.render();
  //     });
  //   });
  // },

  render: async function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    console.log("IN RENDER ")
    loader.show();
    content.hide();

    // setTimeout(async () => {
    console.log("@@@ web3.eth", { "ETH ": web3.eth })

    // const candidatesCount = App.contracts.Election.methods.candidatesCount().call()

    
    // App.contracts.Election.deployed()
    electionInstance = App.contracts.Election.methods
    App.contracts.Election.methods.candidatesCount().call()
    // .then(function (instance) {
    //   electionInstance = instance;
    //   return electionInstance.candidatesCount();
    // })
    .then(function (candidatesCount) {
      console.log({ candidatesCount })
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).call().then(function (candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return false
      // electionInstance.voters(App.account);
    }).then(function (hasVoted) {
      // Do not allow a user to vote
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.log("INSIDE CATCH ", error)
      console.warn(error);
    });
  },

  sendTxn: function(){
    web3.eth.sendTransaction(
      {from: App.account,
        to: App.receiver,
        value: "8000000000"
      }
    ).then((res) => {
      console.log({res})
    })
  },

  castVote: function () {
    var candidateId = $('#candidatesSelect').val();

    

    App.contracts.Election.methods.vote(candidateId).send({ from: App.account })
    // App.contracts.Election.deployed().then(function (instance) {
    //   return instance.vote(candidateId, { from: App.account });
    // })
    .then(function (result) {
      
      console.log({result})
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
