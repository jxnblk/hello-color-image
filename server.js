
const fs = require('fs')
const http = require('http')
const url = require('url')
const querystring = require('querystring')
const chroma = require('chroma-js')
const hello = require('hello-color').default
const bikeshed = require('@jxnblk/bikeshed')
const PNG = require('pngjs').PNG


const handleRequest = (req, res) => {
  const { query } = url.parse(req.url, true)
  const base = query.c ? '#' + query.c : bikeshed()
  const result = hello(base, {
    saturation: 1 / 8,
    contrast: 3,
    hues: 5,
  })

  const width = 400
  const height = 300
  const scale = chroma.scale([ result.color, result.base ])

  res.setHeader('Content-Type', 'image/png')
  fs.createReadStream(__dirname + '/src.png')
    .pipe(new PNG())
    .on('parsed', function () {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2
          const { data } = this

          const r = scale(data[idx] / 255).rgb()[0]
          const g = scale(data[idx + 1] / 255).rgb()[1]
          const b = scale(data[idx + 2] / 255).rgb()[2]

          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b

          data[idx+3] = 0xff
        }
      }

      this.pack().pipe(res)
    })
}

const server = http.createServer(handleRequest)

server.listen(3000, () => {
  console.log('Listening on 3000')
})

