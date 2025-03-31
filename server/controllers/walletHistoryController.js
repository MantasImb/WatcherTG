const { ethers } = require("ethers")
const { fetchHistory } = require("../external-api/scanners")
const { createError } = require("../database/error")
const formatFunctionName = require("../utilities/formatFunctionName")

function formatHistory(history) {
  let formatted = []
  for (const item of history) {
    let method = formatFunctionName(item)
    let newRecord = {
      method: method,
      value: ethers.utils.formatEther(item.value).slice(0, 6),
      timestamp: item.timeStamp,
      from: item.from,
      to: item.to,
      hash: item.hash,
      bonus: {
        block: item.blockNumber,
        gas: item.gasUsed,
        gasPrice: item.gasPrice,
        gasUsed: item.gasUsed,
        status: item.txreceipt_status,
        isError: item.isError,
        nonce: item.nonce,
      },
    }

    formatted.push(newRecord)
  }
  return formatted
}

async function getHistory(req, res) {
  try {
    let { trackedCA, chainId } = req.query
    let history = await fetchHistory(trackedCA, chainId)
    let formatted
    formatted = formatHistory(history)
    res.json(formatted)
  } catch (error) {
    createError(error)
    res.sendStatus(404)
  }
}

module.exports = { getHistory }
