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

  handleAccountsChanged: () => {
    window.location.reload()
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
      $('#ethPrice').html(priceText)
      return priceText
    } catch (err) {
      console.log(err)
    }
  },

  getAccountBalance: async (_price) => {
    try{
      const response = await window.web3.eth.getBalance(App.account) 
      let ethText = App.formatWeiToFloat(response, 5)
      $('#ethBalance').html(ethText)
      let usdText = parseFloat(_price) * parseFloat(ethText)
      $('#usdBalance').html(App.formatFloat(usdText,2).toString())
      return (ethText, usdText)
    } catch (err) {
      console.log(err)
    }
  },

  fundContractInEth: async () => {
    try{
      let _val = $('#inputEthValue').val()
      if(_val){
        _val = App.formatFloatToWei(_val)
        await App.fundMe.methods.fund().send({from: App.account, value: _val}) 
        window.location.reload()
      } else {
        alert("You are trying to fund empty value. Please, set the ETH amount to deposit.")
        return
      }
    } catch (err){
      console.log(err)
    }
  },

  fundContractInUsd: async () => {
    try{
      let _val = $('#inputUsdValue').val()
      if(_val){
        let _usd = await App.getEtherPrice()
        _val = parseFloat(_val) / parseFloat(_usd)
        _val = App.formatFloatToWei(_val)
        await App.fundMe.methods.fund().send({from: App.account, value: _val})
        window.location.reload()
      } else {
        alert("You are trying to fund empty value. Please, set the ETH amount to deposit.")
        return
      }
    } catch (err){
      console.log(err)
    }
  },

  getContractBalance: async () => {
    try{
      const response = await window.web3.eth.getBalance(App.contractAddress) 
      let ethText = App.formatWeiToFloat(response, 5)
      $('#ethContractBalance').html(ethText)

      let _price = await App.getEtherPrice()
      let usdText = parseFloat(_price) * parseFloat(ethText)
      $('#usdContractBalance').html(App.formatFloat(usdText,2).toString())
      return (ethText, usdText)
    } catch (err) {
      console.log(err)
    }
  },

  getFundedBalance: async () => {
    try{

      let address = $('#inputAmountByAddress').val()
      
      if(address){
        address = address.toString()

        let totalFunded =  await App.fundMe.methods.addressToAmountFunded(address).call(
          {from: App.account}
        )

        let ethText = App.formatWeiToFloat(totalFunded, 5)
        $('#ethFundAmount').html(ethText)

        let _price = await App.getEtherPrice()
        let usdText = parseFloat(_price) * parseFloat(ethText)
        $('#usdFundAmount').html(App.formatFloat(usdText, 2).toString())
        
        const amountFundedText = $("#amountFundedText")
        amountFundedText.show()

        return (ethText, usdText)
        
      } else {
        alert("Please, insert a proper Ethereum Address.")
      }
      
    } catch (err) {
      console.log(err)
    }
  },

  //withdrawFundsButton
  withdrawFunds: async () => {
    try{
      await App.fundMe.methods.withdraw().send({from: App.account}) 
      window.location.reload()
    } catch (err){
      console.log(err)
    }
  },

  render: async () => {
    //Prevent double render
    if(App.loading){
      return
    }

    //Update app loading state
    App.setLoading(true)

    //Render account into the "header" of the web page (span tag from the html)
    $('#account').html(App.account)

    
    let ethPrice = await App.getEtherPrice()
    await App.getAccountBalance(ethPrice)


    //Update app loading state
    App.setLoading(false)

    App.renderContract()
    App.renderOwner()

  },

  renderContract: async () => {
    await App.getContractBalance()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },

  userAccountClicked: () => {
    var data = $("#account").html()
    navigator.clipboard.writeText(data)
  },

  renderOwner: () => {
    const owner = $('#owner')
    if (App.isOwner) {
      owner.show()
    } else {
      owner.hide()
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

/* 
jQuery for loading window event 
(this will be invoked as soon as the window loads) 
*/
$(() => {
  $(window).load(() => {
    App.load()
  }) 
})