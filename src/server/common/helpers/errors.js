import { authentication } from '../../authentication/content.js'
import { errors } from '../../error/content.js'
import { statusCodes } from '../constants/status-codes.js'
import { paths } from '../../../config/paths.js'

function errorPageContent(request, statusCode) {
  switch (statusCode) {
    case statusCodes.notFound:
      return errors.notFound(request)
    case statusCodes.forbidden:
      return errors.forbidden(request)
    case statusCodes.badRequest:
      return errors.badRequest(request)
    default:
      return errors.unexpected(request)
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
    const unauthorizedContent = authentication.unauthorized(request)
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
    const content = errors.internalServerError(request)
    return h
      .view('error/500', {
        pageTitle: content.title,
        heading: content.heading,
        body: content.body
      })
      .code(statusCode)
  } else {
    const content = errorPageContent(request, statusCode)
    return h
      .view('error/index', {
        pageTitle: content.pageTitle,
        heading: statusCode,
        message: content.message
      })
      .code(statusCode)
  }
}
