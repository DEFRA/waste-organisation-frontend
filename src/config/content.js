export const content = {
  ukPermit: () => ({
    title: 'ukPermit',
    heading:
      'Do you operate one or more licensed or permitted waste receiving sites?',
    questions: {
      yes: 'Yes',
      no: 'No'
    },
    error: {
      title: 'There is a problem',
      message: '[REAL TEXT GOES HERE]'
    },
    continueAction: 'Continue'
  }),
  cannotUseService: () => ({
    title: 'Sorry, you cannot use the service',
    heading: 'Sorry, you cannot use the service',
    description:
      'Based on your answer, you cannot use this service as you do not operate any businesses or organisations that receive waste.',
    link: {
      href: '/',
      text: 'Find out more about Digital waste tracking'
    }
  })
}
