import { paths, pathTo } from '../../config/paths.js'
import boom from '@hapi/boom'

const fetchOrgs = async (backendApi, userId) => {
  // TODO think about tests for this?
  let orgs = await backendApi.getOrganisations(userId)
  orgs = orgs?.filter(
    (o) => o.isWasteReceiver === undefined || o.isWasteReceiver === null
  )
  if (orgs === null || orgs.length === 0) {
    return null
  }
  return orgs
}

export const onboardingGetController = {
  async handler(request, h) {
    const organisations = await waitFor({
      // TODO check that the id is the user id and we shouldn't be using one of the other referency looking things in the token data...
      func: () => fetchOrgs(request.backendApi, request.auth.credentials.id),
      waitTime: 500,
      iteration: 2,
      delay: 50
    })

    if (organisations === null) {
      return h.view('isWasteReceiver/index', {
        pageTitle: 'TODO ???????????????',
        question: `TODO ??????????????`,
        action: paths.isWasteReceiver,
        errors: null
      })
    }

    // TODO how do we go around the loop of organisations??? and terminate the loop???
    const [firstOrganisation] = organisations

    return h.redirect(pathTo(paths.isWasteReceiver, firstOrganisation))
  }
}

export const isWasteReceiverGetController = {
  async handler(request, h) {
    // TODO fix this ...
    const r = await request.backendApi.getOrganisations(
      request.auth.credentials.id
    )

    const [company] = r.filter(
      (o) => o.organisationId === request?.params?.organisationId
    )

    if (company) {
      return h.view('onboarding/isWasteReceiver', {
        pageTitle: 'Report receipt of waste',
        question: `Is ${company.name} a waste receiver?`,
        organisationId: company.organisationId,
        action: paths.isWasteReceiver,
        errors: null
      })
    } else {
      throw boom.notFound('You Broke it', 'Seomthoing')
    }
  }
}

export const isWasteReceiverPostController = {
  async handler(request, h) {
    await request.backendApi.saveOrganisation(
      request.auth.credentials.id,
      request.payload.organisationId,
      {
        isWasteReceiver: request.payload.isWasteReceiver === 'yes'
      }
    )
    return h.redirect(paths.addWasteReceiver)
  }
}

export const waitFor = async ({
  func,
  waitTime,
  iteration,
  delay,
  startTime = Date.now()
}) => {
  iteration--

  const currentTime = Date.now()
  const timeElapsed = currentTime - startTime

  if (iteration <= 0 || timeElapsed > waitTime) {
    return null
  }

  const response = await func()

  if (response) {
    return response
  }

  await new Promise((resolve) => setTimeout(resolve, delay))

  return waitFor({
    func,
    waitTime,
    iteration,
    delay,
    startTime
  })
}
