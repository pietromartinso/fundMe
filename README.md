# A simple funding contract

This little project was built in order to practice Solidity's smart contracts
usage of oracles by codification, build, deployment and interaction/execution,
via Remix & web3.js.

## FundMe.sol

This smart contract was written at Remix IDE and deployed to Rinkeby testnet:

- Basically it allows funders to donate amounts of ETH that are higher then
  US$ 50,00 based on ChainLink's ETH/USD price feeds.

- It keeps track of what account and how much funds were sent to the contract.

- Only the owner of the contract can withdraw funds, but anyone can check
  how much ETH was sent by a specific account

## app.js + index.html

Via web3.js, the objective here is to build the wiring blocks of code that
bond the Smart Contract with the front-end.

Basically, it works by invoking MetaMask as provider to sign transactions and
publish it into Rinkeby.

On the other hand, it implements the code that handle events and update
information and possible actions for a specific account.

At the front-end, some operations were designed to be shown only for the
owner account, like the consult of amount of ETH donated per account.

### Dependencies & SETUP

1 - Must have MetaMask installed (doesn't need truffle, ganache, etc);
2 - Used web3.js version 1.7.0 (some methods are different from versions > 1.x.x)
3 - Bootstrap, Tailwind and jQuery are being used as well.

---

Code can be refactored to decouple some information or to divide
responsibilities in some places. All suggestions are welcome.
