'use strict'
module.exports = rtfToBbcode

function outputTemplate (doc, defaults, content) {
  return content
}

function rtfToBbcode (doc, options) {
  const defaults = Object.assign({
    disableFonts: true,

    font: doc.style.font || {name: 'Times', family: 'roman'},
    fontSize: doc.style.fontSize || 24,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    foreground: {red: 0, blue: 0, green: 0},
    background: {red: 255, blue: 255, green: 255},
    firstLineIndent: doc.style.firstLineIndent || 0,
    indent: 0,
    align: 'left',
    valign: 'normal',

    paraBreaks: '\n\n',
    paraTag: 'p',
    template: outputTemplate
  }, options || {})
  const content = doc.content.map(para => renderPara(para, defaults)).filter(html => html != null).join(defaults.paraBreaks)
  return defaults.template(doc, defaults, content)
}

const genericFontMap = {
  roman: 'serif',
  swiss: 'sans-serif',
  script: 'cursive',
  decor: 'fantasy',
  modern: 'sans-serif',
  tech: 'monospace',
  bidi: 'serif'
}

function colorEq (aa, bb) {
  return aa.red === bb.red && aa.blue === bb.blue && aa.green === bb.green
}

function styleTags (chunk, defaults) {
  let open = ''
  let close = ''
  if (chunk.style.italic != null && chunk.style.italic !== defaults.italic) {
    open += '[i]'
    close = '[/i]' + close
  }
  if (chunk.style.bold != null && chunk.style.bold !== defaults.bold) {
    open += '[b]'
    close = '[/b]' + close
  }
  if (chunk.style.strikethrough != null && chunk.style.strikethrough !== defaults.strikethrough) {
    open += '[s]'
    close = '[/s]' + close
  }
  if (chunk.style.underline != null && chunk.style.underline !== defaults.underline) {
    open += '[u]'
    close = '[/u]' + close
  }
  if (chunk.style.valign != null && chunk.style.valign !== defaults.valign) {
    if (chunk.style.valign === 'super') {
      open += '[sup]'
      close = '[/sup]' + close
    } else if (chunk.style.valign === 'sub') {
      open += '[sup]'
      close = '[/sup]' + close
    }
  }
  if (chunk.style.foreground != null && !colorEq(chunk.style.foreground, defaults.foreground)) {
    let r = chunk.style.foreground.red.toString(16); if (r.length === 1) r = '0' + r
    let g = chunk.style.foreground.green.toString(16); if (g.length === 1) r = '0' + r
    let b = chunk.style.foreground.blue.toString(16); if (b.length === 1) r = '0' + r
    open += `[color=#${r}${g}${b}]`
    close = '[/close]' + close
  }
  if (chunk.style.indent != null && chunk.style.indent !== defaults.indent) {
    open += `[indent]`
    close = `[/indent]` + close
  }
  if (chunk.style.align != null && chunk.style.align !== defaults.align) {
    if (chunk.style.align === 'left') {
      open += `[left]`
      close = `[/left]` + close
    } else if (chunk.style.align === 'right') {
      open += `[right]`
      close = `[/right]` + close
    } else if (chunk.style.align === 'center') {
      open += `[center]`
      close = `[/center]` + close
    }
  }
  if (chunk.style.fontSize != null && chunk.style.fontSize !== defaults.fontSize) {
    const size = String(chunk.style.fontSize).match(/^(\d*(?:[.]\d+)?)(em|px|pt)?$/)
    if (size) {
      let px = size[1]
      const unit = size[2] || 'px'
      if (unit === 'pt') {
        px *= 1.33333
      } else if (unit === 'em') {
        px *= 13.33333
      }
      let xen = Math.round((px - 5) / 2.8571)
      if (xen > 7) xen = 7
      if (xen !== 3) {
        open += `[size=${xen}]`
        close = '[/size]' + close 
      }
    }
  }
  if (!defaults.disableFonts && chunk.style.font != null && chunk.style.font.name !== defaults.font.name) {
    const name = chunk.style.font.name.replace(/-\w+$/, '')
    const family = genericFontMap[chunk.style.font.family]
    if (name !== 'ZapfDingbatsITC') {
      if (family) {
        open += `[font=${family}]`
        close = `[/font]` + close
      } else {
        open += `[font=${name}]`
        close = `[/font]` + close
      }
    }
  }
  return {open, close}
}

function renderPara (para, defaults) {
  if (!para.content || para.content.length === 0) return
  const tags = styleTags(para, defaults)
  const pdefaults = Object.assign({}, defaults)
  for (let item of Object.keys(para.style)) {
    if (para.style[item] != null) pdefaults[item] = para.style[item]
  }
  const paraTag = defaults.paraTag
  return `${tags.open}${para.content.map(span => renderSpan(span, pdefaults)).join('')}${tags.close}`
}

function renderSpan (span, defaults) {
  const tags = styleTags(span, defaults)
  return `${tags.open}${span.value}${tags.close}`
}
