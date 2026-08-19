import { content } from '../../../config/content.js'
import { statusCodes } from '../constants/status-codes.js'
import { paths } from '../../../config/paths.js'

function statusCodeMessage(statusCode) {
  switch (statusCode) {
    case statusCodes.notFound:
      return 'Page not found'
    case statusCodes.forbidden:
      return 'Forbidden'
    case statusCodes.unauthorized:
      return 'Unauthorized'
    case statusCodes.badRequest:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

export function catchAll(request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  const statusCode = response.output.statusCode

  if (statusCode >= statusCodes.internalServerError) {
    request.logger.error(response?.stack)
  }

  if (statusCode === statusCodes.unauthorized) {
    const unauthorizedContent = content.unauthorized(request)
    return h
      .view('error/unauthorized', {
        pageTitle: unauthorizedContent.title,
        heading: unauthorizedContent.heading,
        reasonsIntro: unauthorizedContent.reasonsIntro,
        reasons: unauthorizedContent.reasons,
        action: unauthorizedContent.action,
        signInButton: unauthorizedContent.signInButton,
        signInUrl: paths.signinDefraIdCallback
      })
      .code(statusCode)
  }

  if (statusCode === statusCodes.internalServerError) {
    const heading = 'Sorry, there is a problem with the service'
    return h
      .view('error/500', {
        pageTitle: heading,
        heading
      })
      .code(statusCode)
  }

  const errorMessage = statusCodeMessage(statusCode)

  return h
    .view('error/index', {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage
    })
    .code(statusCode)
}
