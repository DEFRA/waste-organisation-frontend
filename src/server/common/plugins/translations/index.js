// function getBrowserLanguage(acceptLanguage = '') {
//   return acceptLanguage
//     .split(',')
//     .map((item) => {
//       const [locale, qualityValue = 'q=1'] = item.trim().split(';')

//       return {
//         language: locale.toLowerCase().split('-')[0],
//         quality: Number(qualityValue.replace('q=', '')) || 0
//       }
//     })
//     .sort((a, b) => b.quality - a.quality)
//     .find(({ language }) => language === 'en' || language === 'cy')
// }

export const translation = {
  plugin: {
    name: 'translation',
    register: async (server) => {
      server.ext('onPreHandler', (request, h) => {
        // console.log(
        //   'initial language header',
        //   request.headers['accept-language']
        // )

        // const browserLanguage = getBrowserLanguage(
        //   request.headers['accept-language']
        // )
        // console.log('browser language')
        // request.locale = browserLanguage?.language === 'cy' ? 'zz' : 'en'
        request.locale = 'en'
        return h.continue
      })
    }
  }
}
