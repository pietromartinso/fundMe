App = {
  contractAddress: "0x2321d1f815421f0bcb65017db18e06744abf3abc",
  contractABI: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "addressToAmountFunded",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fund",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "funders",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "ethAmount",
          "type": "uint256"
        }
      ],
      "name": "getConversionRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVersion",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ],
  loading: false,
  isOwner: false,
  contracts: {},
  fundMe: null,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

 loadWeb3: async () => {
    //Additional check probably introduced by Gregory fom Dapp University
    if(window.ethereum){ //Metamask está instalado?
    
      if(window.web3){ //foi possível instanciar o web3?
        window.web3 = new Web3(ethereum); //instanciando a variável web3 da janela
      } else {
        alert('MetaMask found but no Web3 found.');
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    try{
      await window.ethereum.enable()
      window.ethereum.on("accountsChanged", App.handleAccountsChanged)
    } catch (err){
      console.log(err)
    }
  },


  loadAccount: async () => {

    const accounts = await window.web3.eth.getAccounts()
    
    if(accounts != 0){
      App.account = accounts[0]
    } else {
      App.account = "No account address found."
    }

  },

  loadContract: async () => {
    //using web3 version > 1.0.0 (current 1.7.0)
    App.fundMe = await new window.web3.eth.Contract(App.contractABI, App.contractAddress)

    App.isOwner = await App.verifyIsOwner()
  },

  verifyIsOwner: async () => {
    try{
      const response = await App.fundMe.methods.owner().call({from: window.userAddress})
      if(response == App.account){
        return true
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }
  },

  getEtherPrice: async () => {
    try{
      const response = await App.fundMe.methods.getPrice().call({from: window.userAddress})
      let priceText = App.formatWeiToFloat(response, 2)
      document.getElementById("ethPrice").innerText = priceText
      return priceText
    } catch (err) {
      console.log(err)
    }
  },

  getAccountBalance: async () => {
    try{
      const response = await window.web3.eth.getBalance(App.account)
      return response
    } catch (err) {
      console.log(err)
    }
  },

  getContractBalance: async () => {
    try{
      const response = await window.web3.eth.getBalance(App.contractAddress) 
      let ethText = App.formatWeiToFloat(response, 5)
      document.getElementById("ethContractBalance").innerText = ethText

      let _price = await App.getEtherPrice()
      let usdText = parseFloat(_price) * parseFloat(ethText)
      document.getElementById("usdContractBalance").innerText = App.formatFloat(usdText,2).toString()
      
      return (ethText, usdText)
    } catch (err) {
      console.log(err)
    }
  },
  
  handleAccountsChanged: () => {
    window.location.reload()
  },

  handleClickEth: async () => {
    try{
      let _val = document.getElementById("inputEthValue").value
      if(_val){
        App.renderFundEthLoading(true)
        _val = App.formatFloatToWei(_val)
        await App.fundMe.methods.fund().send({from: App.account, value: _val})
        App.renderFundEthLoading(false) 
        window.location.reload()
      } else {
        alert("You are trying to fund empty value. Please, set the ETH amount to deposit.")
        return
      }
    } catch (err){
      window.location.reload()
      console.log(err)
    }
  },

  handleClickUsd: async () => {
    try{
      let _val = document.getElementById("inputUsdValue").value
      if(_val){
        App.renderFundUsdLoading(true)
        let _usd = await App.getEtherPrice()
        _val = parseFloat(_val) / parseFloat(_usd)
        _val = App.formatFloatToWei(_val)
        await App.fundMe.methods.fund().send({from: App.account, value: _val})
        App.renderFundUsdLoading(false)
        window.location.reload()
      } else {
        alert("You are trying to fund empty value. Please, set the ETH amount to deposit.")
        return
      }
    } catch (err){
      window.location.reload()
      console.log(err)
    }
  },

  handleClickFind: async () => {
    App.renderConsultLoading(true)
    try{
      let address = document.getElementById("inputAmountByAddress").value
      
      if(address){
        address = address.toString()

        let totalFunded =  await App.fundMe.methods.addressToAmountFunded(address).call(
          {from: App.account}
        )

        let ethText = App.formatWeiToFloat(totalFunded, 5)
        document.getElementById("ethFundAmount").innerText = ethText

        let _price = await App.getEtherPrice()
        let usdText = parseFloat(_price) * parseFloat(ethText)
        document.getElementById("usdFundAmount").innerText = App.formatFloat(usdText, 2).toString()
        
        document.getElementById("amountFundedText").classList.remove("hidden")
        
        App.renderConsultLoading(false)
        return (ethText, usdText)
      } else {
        App.renderConsultLoading(false)
        alert("Please, insert a proper Ethereum Address.")
      }
    } catch (err) {
      App.renderConsultLoading(false)
      alert("Please, insert a proper Ethereum Address.")
      console.log(err)
    }
  },

  handleDeleteFundedBalance: () => {
    document.getElementById("amountFundedText").classList.add("hidden")
    document.getElementById("inputAmountByAddress").value = ""
  },

  handleClickWithdraw: async () => {
    try{
      App.renderWithdrawLoading(true)
      await App.fundMe.methods.withdraw().send({from: App.account})
      App.renderWithdrawLoading(false)
      window.location.reload()
    } catch (err){
      alert("Could not withdraw funds.")
      window.location.reload()
      console.log(err)
    }
  },

  handleAccountClicked: () => {
    var data = document.getElementById("account").innerText
    
    navigator.clipboard.writeText(data)
  },

  render: async () => {

    //Update app loading state
    App.renderLoading(true)

    //Render account into the "header" of the web page (span tag from the html)
    document.getElementById("account").innerText = App.account

    await App.renderUserBalance()

    //Update app loading state
    App.renderLoading(false)

    await App.renderOwnerArea()

  },
  
  renderUserBalance: async () => {
    try{
      const response = await App.getAccountBalance() 
      let _price = await App.getEtherPrice()
      let ethText = App.formatWeiToFloat(response, 5)
      document.getElementById("ethBalance").innerText = ethText
      let usdText = parseFloat(_price) * parseFloat(ethText)
      document.getElementById("usdBalance").innerText = App.formatFloat(usdText,2).toString()
      return (ethText, usdText)
    } catch (err) {
      console.log(err)
    }
  },

  renderLoading: (boolean) => {
    const content = document.getElementById("content")
    const loader = document.getElementById("loader")

    if (boolean) {
      loader.classList.remove("hidden")
      content.classList.add("hidden")
    } else {
      content.classList.remove("hidden")
      loader.classList.add("hidden")
    }
  },

  renderConsultLoading: (boolean) => {    
    const consultPending = document.getElementById("consultPending")
    const consultAddressContent = document.getElementById("consultAddressContent")

    if (boolean) {
      consultPending.classList.remove("hidden")
      consultAddressContent.classList.add("hidden")
    } else {
      consultAddressContent.classList.remove("hidden")
      consultPending.classList.add("hidden")
    }
  },

  renderFundEthLoading: (boolean) => {
    const fundEthPending = document.getElementById("fundEthPending")
    const fundEthContent = document.getElementById("fundEthContent")

    if (boolean) {
      fundEthPending.classList.remove("hidden")
      fundEthContent.classList.add("hidden")
    } else {
      fundEthContent.classList.remove("hidden")
      fundEthPending.classList.add("hidden")
    }
  },
  
  renderFundUsdLoading: (boolean) => {    
    const fundUsdPending = document.getElementById("fundUsdPending")
    const fundUsdContent = document.getElementById("fundUsdContent")

    if (boolean) {
      fundUsdPending.classList.remove("hidden")
      fundUsdContent.classList.add("hidden")
    } else {
      fundUsdContent.classList.remove("hidden")
      fundUsdPending.classList.add("hidden")
    }
  },

  renderWithdrawLoading: (boolean) => {
    const withdrawPending = document.getElementById("withdrawPending")
    const withdrawContent = document.getElementById("withdrawContent")

    if (boolean) {
      withdrawPending.classList.remove("hidden")
      withdrawContent.classList.add("hidden")
    } else {
      withdrawContent.classList.remove("hidden")
      withdrawPending.classList.add("hidden")
    }
  },

  renderOwnerArea: async () => {
    const owner = document.getElementById("owner")
    try{

      if (App.isOwner) {
        await App.getContractBalance()
        owner.classList.remove("hidden")
      } else {
        owner.classList.add("hidden")
      }
    } catch (err){
      console.log(err)
    }
  },

  formatWeiToFloat: (val, precision) => {
    let res = (parseInt(val) / (10 ** 18)).toString()
    let i = res.indexOf(".")
    res = res.substring(0, i+precision+1)
    return res
  },
  
  formatFloatToWei: (val) =>  {
    return (parseFloat(val) * (10 ** 18))
  },
  
  formatFloat: (val, precision) => {
    val = val.toString()
    let i = val.indexOf(".")
    val = val.substring(0, i+precision+1)
    return parseFloat(val)
  },
}

window.onload = async () => {
  App.load()
}