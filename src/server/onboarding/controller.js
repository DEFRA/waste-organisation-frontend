import { paths } from '../../config/paths.js'

const userId = 'TODO - get from request'

export const onboardingGetController = {
  async handler(request, h) {
    const [company] = await waitFor({
      func: async () => await request.backendApi.getOrganisations(userId),
      waitTime: 500,
      iteration: 10,
      delay: 50
    })

    if (!request.query?.organsiationId) {
      return h.redirect(`${paths.onboarding}?organsiationId=${company.id}`)
    }

    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${company.name} a waste receiver?`,
      action: paths.isWasteReceiver,
      errors: null
    })
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
