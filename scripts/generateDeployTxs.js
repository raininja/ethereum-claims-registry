#!/bin/env node

const Transaction = require('ethereumjs-tx')
const EthUtils = require('ethereumjs-util')
const ls = require('ls')

const gasLimits = {
  EthereumClaimsRegistry: 505467,
  //RevokeAndPublish:
}

generateDeployTx = (code, name) => {
  const rawTx = {
    nonce: 0,
    gasPrice: 10000000000, // 10 Gwei
    gasLimit: gasLimits[name] || 800000,
    value: 0,
    data: code,
    v: 27,
    r: '0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
    s: '0x0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }
  const tx = new Transaction(rawTx)
  const res = {
    senderAddress: '0x' + tx.getSenderAddress().toString('hex'),
    rawTx: '0x' + tx.serialize().toString('hex'),
    costInEther: (parseInt(rawTx.gasPrice) * parseInt(rawTx.gasLimit)) / 1000000000000000000,
    contractAddress: '0x' + EthUtils.generateAddress('0x' + tx.getSenderAddress().toString('hex') , 0 ).toString('hex')
  }
  return res
}

generateAll = () => {
  let deployData = {}
  for (const file of ls('./build/contracts/*')) {
    if (file.name === 'Migrations') continue
    const artifact = require(process.cwd() + file.full.slice(1))
    deployData[file.name] = generateDeployTx(artifact.bytecode, file.name)

  }
  return deployData
}

module.exports = generateAll


if (require.main === module) {
  const deployData = generateAll()
  for (const name in deployData) {
    console.log('\n\x1b[31m ======= Contract:', name, '=======\x1b[0m')
    console.log('\x1b[34msenderAddress:\x1b[0m', deployData[name].senderAddress)
    console.log('\x1b[34mrawTx:\x1b[0m', deployData[name].rawTx)
    console.log('\x1b[34mcost (ether):\x1b[0m', deployData[name].costInEther)
    console.log('\x1b[34mcontractAddress:\x1b[0m', deployData[name].contractAddress)
  }
}