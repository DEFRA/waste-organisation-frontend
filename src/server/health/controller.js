import { statusCodes } from '../common/constants/status-codes.js'

/**
 * A generic health-check endpoint. Used by the platform to check if the service is up and handling requests.
 */
export const healthController = (_request, h) => {
  console.log(
    'here: >>>> ',
    ' >> ',
    _request.headers.authorization,
    ' >> ',
    JSON.stringify(Object.keys(_request), null, 4)
  )
  return h.response({ message: 'success2' }).code(statusCodes.ok)
}
