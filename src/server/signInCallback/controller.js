import { paths } from '../../config/paths.js'

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const signInCallbackController = {
  handler(_request, h) {
    console.log(_request)

    return h.redirect(paths.SEARCH)
  }
}
