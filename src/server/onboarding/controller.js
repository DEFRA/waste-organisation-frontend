import { paths, pathTo } from '../../config/paths.js'
import boom from '@hapi/boom'

const fetchOrgs = async (backendApi, userId) => {
  // TODO think about tests for this?
  const wasteRecivers = await backendApi.getOrganisations(userId)

  const unaskedWasteRecivers = wasteRecivers?.filter(
    (wr) => wr.isWasteReceiver === undefined || wr.isWasteReceiver === null
  )

  const isWasteRecivers = wasteRecivers?.filter(
    (wr) => wr.isWasteReceiver === true
  )

  const isNotWasteRecivers = wasteRecivers?.filter(
    (wr) => wr.isWasteReceiver === false
  )

  return {
    unaskedWasteRecivers,
    wasteRecivers,
    isWasteRecivers,
    isNotWasteRecivers
  }
}

export const onboardingGetController = {
  async handler(request, h) {
    const organisations = await waitFor({
      // TODO check that the id is the user id and we shouldn't be using one of the other referency looking things in the token data...
      func: () => fetchOrgs(request.backendApi, request.auth.credentials.id),
      isDone: (data) => data.unaskedWasteRecivers !== null,
      waitTime: 500,
      iteration: 2,
      delay: 50
    })

    if (!organisations) {
      // no response: error case
      return h.view('isWasteReceiver/index', {
        pageTitle: 'TODO ???????????????',
        question: `TODO ??????????????`,
        action: paths.isWasteReceiver,
        errors: null
      })
    }

    if (organisations.unaskedWasteRecivers[0]) {
      // Ask if waste reciver
      return h.redirect(
        pathTo(paths.isWasteReceiver, organisations.unaskedWasteRecivers[0])
      )
    }

    if (organisations.isWasteRecivers[0]) {
      // return to list page
      return h.redirect(paths.dashboard)
    }

    if (organisations.isNotWasteRecivers[0]) {
      // return to go away page
      return h.redirect(paths.cannotUseService)
    }

    return h.view('isWasteReceiver/index', {
      pageTitle: 'TODO ???????????????',
      question: `TODO ??????????????`,
      action: paths.isWasteReceiver,
      errors: null
    })
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
      throw boom.notFound('Oranisation not found')
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
  isDone,
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

  if (isDone(response)) {
    return response
  }

  await new Promise((resolve) => setTimeout(resolve, delay))

  return waitFor({
    func,
    isDone,
    waitTime,
    iteration,
    delay,
    startTime
  })
}
