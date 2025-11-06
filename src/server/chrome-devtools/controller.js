import { constants } from 'http2'

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const chromeDevtoolsController = {
  handler(_request, h) {
    return h
      .response({ message: 'success' })
      .code(constants.HTTP_STATUS_NO_CONTENT)
  }
}
