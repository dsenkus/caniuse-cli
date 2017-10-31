#!/usr/bin/env node
const clc = require('cli-color')
const omelette = require('omelette')
const wrap = require('wordwrap')(80)

const data = require('caniuse-db/fulldata-json/data-2.0.json')
const agents = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr']
const defaultItemWidth = 6
const eras = [-3, -2, -1, 0, 1, 2, 3]

const firstArgument = ({fragment, before, reply }) => {
  let dataKeys = Object.keys(data['data']);

  let otherKeys = Object.keys(data['data']).reduce((keys, item) => {
      let newKeys = []

      let firefoxId = data['data'][item]['firefox_id']
      let keywords = data['data'][item]['keywords']

      if (firefoxId.length > 0) {
        newKeys.push(firefoxId)
      }

      keywords.split(',').forEach(key => {
        if (key.trim().length > 0) {
          newKeys.push(key.trim())
        }
      })

      return [].concat(keys, newKeys)
    })


  reply([].concat(dataKeys, otherKeys))
}

omelette`caniuse ${firstArgument}`.init()

const getAgentVersionByEra = (agent, era) => {
  try {
    return data['agents'][agent].version_list
      .find((item) => item.era == era).version
  } catch (error) {
    undefined
  }
}

const columnWidths = agents.reduce((collection ,agent) => {
  let agentAbbr = data['agents'][agent].abbr

  let width = agentAbbr.length > defaultItemWidth ? agentAbbr.length : defaultItemWidth

  // calculate max required width for agent
  let maxWidth = eras.reduce((max, era) => {
    try {
      let width = getAgentVersionByEra(agent, era).length
      return width > max ? width : max;
    } catch (error) {
      return max
    }
  })

  return {
    ...collection,
    [agent]: maxWidth > width ? maxWidth : width
  }
}, {})


const strRepeat = (str, qty) => {
  if (qty < 1) return ''
  var result = ''
  while (qty > 0) {
    if (qty & 1) result += str
    qty >>= 1, str += str
  }
  return result
}

const padCenter = (str, length, padStr) => {
  let padLen = length - str.length
  return strRepeat(padStr, Math.ceil(padLen/2)) + str + strRepeat(padStr, Math.floor(padLen/2))
}

const printTableHeader = () => {
  agents.forEach((agent) => {
    process.stdout.write(clc.black.bgWhite(padCenter(data['agents'][agent].abbr, columnWidths[agent], ' ')))
    process.stdout.write(' ')
  })

  process.stdout.write("\n")
}



const printTableRowItem = (agent, version, data) => {
  let text = padCenter(version, columnWidths[agent], ' ')

  if (data[0] === 'y') {
    process.stdout.write(clc.white.bgGreen(text))
  } else if (data[0] === 'p') {
    process.stdout.write(clc.white.bgYellow(text))
  } else {
    process.stdout.write(clc.white.bgRed(text))
  }
}

const printTableRow = (item, era) => {
  agents.forEach((agent, index) => {
    let version = getAgentVersionByEra(agent, era)
    if(version !== undefined) {
      let data = item['stats'][agent][version]
      printTableRowItem(agent, version, data)
    } else {
      process.stdout.write(padCenter('', 6, ' ')) // space between items
    }

    if(index < agents.length-1) {
      if(era === 0) {
        process.stdout.write(clc.bgBlackBright(' '))
      } else {
        process.stdout.write(' ')
      }
    }
  })

  process.stdout.write("\n")
}

const findResult = (name) => {
  let items = data['data']

  if (items.hasOwnProperty(name)) {
    return items[name]
  }

  let otherResults = Object.keys(data['data']).filter(key => {
    let keywords = data['data'][key]['keywords'].split(',').map(item => item.trim()).filter(item => item.length > 0)
    return data['data'][key]['firefox_id'] === name ||
      keywords.indexOf(name) >= 0
  })

  if (otherResults.length > 0) {
    return otherResults.reduce((list, key) => {
      return list.concat(data['data'][key])
    }, [])
  }

  return undefined
}

let name = process.argv[2]
let res = findResult(name)

const printItem = (item) => {
  console.log(clc.underline(wrap(item.title)))
  console.log()
  console.log(wrap(item.description))
  console.log()
  printTableHeader()
  eras.forEach((era) => printTableRow(item, era))
  console.log()
  console.log(wrap("Notes: " + item.notes))
}

if (res !== undefined) {
  if(Array.isArray(res)) {
    res.forEach(item => printItem(item)) 
  } else {
    printItem(res)
  }
} else {
  console.log("Nothing was found")
}
