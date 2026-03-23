import { clone } from '@hapi/hoek'

const pageSettings = {
  pageTitle: 'Checking your file...',
  heading: 'Checking your file...',
  pageRefreshTimeInSeconds: 2
}

export const uploadAndWaitController = {
  async handler(request, h) {
    const { uploadId, uploadUrl } = clone(request.yar.get('upload') || {})

    request.logger.info(
      `Waiting for upload uploadId: ${uploadId} - uploadUrl: ${uploadUrl}`
    )
    return h.view('uploadAndWait/pending', {
      ...pageSettings,
      isProcessing: true
    })
  }
}
