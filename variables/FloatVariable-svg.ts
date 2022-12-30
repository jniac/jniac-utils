// zero-dep utility files

type FloatVariableInfo = {
  min: number
  max: number
  size: number
  array: ArrayLike<number>
}

type SvgStringParams = Partial<{
  tab: string
  tabBaseCount: number
  viewMargin: number
  viewWidth: number
  viewHeight: number
  view: {
    margin: number
    width: number
    height: number
  }
}>

const resolveParams = (params: SvgStringParams) => {
  const {
    tab = '  ', 
    tabBaseCount = 0,
    view = {
      margin: params.viewMargin ?? 8,
      width: params.viewWidth ?? 1280,
      height: params.viewHeight ?? 720,
    },
  } = params
  return { tab, tabBaseCount, view }  
}

/**
 * Return a lambda to insert lines to the given array ("lines") with some options.
 */
const bindLine = (lines: string[], tab: string, tabBaseCount: number) => {
  return (tabCount: number, str: string | string[]) => {
    const array = Array.isArray(str) ? str : [str]
    for (const str of array) {
      lines.push(`${tab.repeat(tabBaseCount + tabCount)}${str}`)
    }
  }
}

const createTextMiddleLeft = (x: number, y: number, text: string) => {
  const height = 12
  return [
    `<rect x="${x - 2}" y="${y - height / 2}" width="100" height="${height}" fill="#fff" opacity=".8"></rect>`,
    `<text class="small" dominant-baseline="middle" x=${x} y=${y}>${text}</text>`,
  ]
}

export const createDataGroup = (info: FloatVariableInfo, params: SvgStringParams = {}) => {
  // Expand:
  const {
    min, 
    max,
    size,
    array,
  } = info

  // Setup:
  const { tab, tabBaseCount, view } = resolveParams(params)
  const lines: string[] = []
  const line = bindLine(lines, tab, tabBaseCount)

  // Compute lines:
  const delta = max - min
  const scaleX = (view.width - 2 * view.margin) / size
  const scaleY = (view.height - 2 * view.margin) / (delta || 1)
  line(0, `<g transform="translate(${view.margin} ${view.margin + max * scaleY})">`)
  for (let index = 0; index < size; index++) {
    const value = array[index]
    let y = 0, h = 0
    if (value >= 0) {
      y = -value
      h = value
    } else {
      y = 0
      h = -value
    }
    line(1, `<rect opacity=".1" x="${index * scaleX}" y="${y * scaleY}" width="${scaleX}" height="${h * scaleY}"></rect>`)
    line(1, `<circle cx="${(index + .5) * scaleX}" cy="${-value * scaleY}" r="${.25 * scaleX}"></circle>`)
    line(1, `<rect x="${index * scaleX}" y="${-value * scaleY - .5}" width="${scaleX}" height="1"></rect>`)
  }
  line(0, `</g>`)

  return lines
}

export const toSvgString = (info: FloatVariableInfo, params: SvgStringParams = {}) => {
  // Expand:
  const {
    min, 
    max,
  } = info
  
  // Setup:
  const { tab, tabBaseCount, view } = resolveParams(params)
  const lines: string[] = []
  const line = bindLine(lines, tab, tabBaseCount)

  // Compute lines:
  line(0, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view.width} ${view.height}">`)
  line(1, `
    <style>
      .small {
        font-size: 8px;
      }
    </style>
  `)
  line(1, createDataGroup(info, params))
  line(1, `<rect fill="none" stroke="#0003" x="${view.margin}" y="${view.margin}" width="${view.width - 2 * view.margin}" height="${view.height - 2 * view.margin}"></rect>`)
  line(1, createTextMiddleLeft(view.margin + 16, view.margin, `max: ${max}`))
  line(1, createTextMiddleLeft(view.margin + 16, view.height - view.margin, `min: ${min}`))
  line(0, `</svg>`)

  // Concatenate & return:
  return lines.join('\n')
}

export const toSvgDocumentString = (info: FloatVariableInfo, params: SvgStringParams = {}) => {
  const { min, max, size } = info
  const delta = max - min
  const title = `graph[${size}] min: ${min.toFixed(1)} max: ${max.toFixed(1)} (${delta.toFixed(1)})`
  return /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url(https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap);
    body, body * {
      position: relative;
      margin: 0;
      box-sizing: border-box;
    }
    body {
      height: 100vh;
      padding: 8px;
      font-family: 'Fira Code', monospace;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  ${toSvgString(info, { tab: '  ', tabBaseCount: 1 })}
</body>
</html>
`
}