import joi from 'joi'
import { paths, pathTo } from '../../config/paths.js'
import { content } from '../../config/content.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const sessionKey = 'manualEntryMovements'
const draftKey = 'manualEntryDraft'

const getMovements = (request) => {
  const movements = request.yar.get(sessionKey) || []
  return movements.filter((m) => m._movementFormValues)
}

const setMovements = (request, movements) =>
  request.yar.set(sessionKey, movements)

const getDraft = (request) =>
  request.yar.get(draftKey) || {
    movementFormValues: null,
    wasteItems: [],
    editIndex: null
  }

const setDraft = (request, draft) => request.yar.set(draftKey, draft)

const clearDraft = (request) => request.yar.clear(draftKey)

const physicalForms = ['Gas', 'Liquid', 'Solid', 'Mixed', 'Sludge', 'Powder']

const weightMetrics = ['Grams', 'Kilograms', 'Tonnes']

const meansOfTransport = ['Road', 'Rail', 'Sea', 'Air', 'Inland Waterway']

const requiredString = (label) =>
  joi
    .string()
    .trim()
    .required()
    .messages({
      'string.empty': `Enter ${label}`,
      'any.required': `Enter ${label}`
    })

const optionalString = () => joi.string().trim().allow('').optional()

const movementSchema = joi.object({
  receiverSiteName: requiredString('the receiver site name'),
  receiptAddress: requiredString('the receipt address'),
  receiptPostcode: requiredString('the receipt postcode'),
  receiverAuthorisationNumber: optionalString(),
  receiverRegPositionStatements: optionalString(),
  receiverEmail: requiredString('the receiver email address')
    .email({ tlds: false })
    .messages({ 'string.email': 'Enter a valid receiver email address' }),
  receiverPhone: requiredString('the receiver phone number'),
  'dateReceived-day': joi
    .number()
    .integer()
    .min(1)
    .max(31)
    .required()
    .messages({
      'number.base': 'Date received must include a day',
      'number.min': 'Date received must include a day',
      'number.max': 'Date received must include a day',
      'any.required': 'Date received must include a day'
    }),
  'dateReceived-month': joi
    .number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Date received must include a month',
      'number.min': 'Date received must include a month',
      'number.max': 'Date received must include a month',
      'any.required': 'Date received must include a month'
    }),
  'dateReceived-year': joi
    .number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Date received must include a year',
      'number.min': 'Enter a valid year',
      'number.max': 'Enter a valid year',
      'any.required': 'Date received must include a year'
    }),
  consignmentCode: optionalString(),
  reasonForNoConsignmentCode: optionalString(),
  specialHandling: optionalString(),
  carrierRegNumber: optionalString(),
  carrierReasonForNoRegNumber: optionalString(),
  carrierOrgName: optionalString(),
  carrierAddress: optionalString(),
  carrierPostcode: optionalString(),
  carrierEmail: optionalString()
    .email({ tlds: false })
    .messages({ 'string.email': 'Enter a valid carrier email address' }),
  carrierPhone: optionalString(),
  carrierTransport: optionalString()
    .valid('', ...meansOfTransport)
    .messages({ 'any.only': 'Select a valid means of transport' }),
  carrierVehicleReg: optionalString(),
  brokerOrgName: optionalString(),
  brokerAddress: optionalString(),
  brokerPostcode: optionalString(),
  brokerEmail: optionalString()
    .email({ tlds: false })
    .messages({ 'string.email': 'Enter a valid broker email address' }),
  brokerPhone: optionalString(),
  brokerRegNumber: optionalString()
})

const wasteItemSchema = joi.object({
  ewcCodes: requiredString('at least one EWC code'),
  wasteDescription: requiredString('a waste description'),
  physicalForm: joi
    .string()
    .trim()
    .required()
    .valid(...physicalForms)
    .messages({
      'any.required': 'Select a physical form',
      'string.empty': 'Select a physical form',
      'any.only': 'Select a valid physical form'
    }),
  numberOfContainers: joi.number().integer().min(1).required().messages({
    'number.base': 'Enter the number of containers',
    'number.min': 'Number of containers must be 1 or more',
    'any.required': 'Enter the number of containers'
  }),
  typeOfContainers: requiredString('the type of containers'),
  weightMetric: joi
    .string()
    .trim()
    .required()
    .valid(...weightMetrics)
    .messages({
      'any.required': 'Select a weight metric',
      'string.empty': 'Select a weight metric',
      'any.only': 'Select a valid weight metric'
    }),
  weightAmount: joi.number().positive().required().messages({
    'number.base': 'Enter the weight amount',
    'number.positive': 'Weight amount must be greater than 0',
    'any.required': 'Enter the weight amount'
  }),
  weightIsEstimate: joi
    .string()
    .required()
    .valid('estimate', 'actual')
    .messages({
      'any.required': 'Select whether the weight is an estimate or actual',
      'any.only': 'Select whether the weight is an estimate or actual'
    }),
  containsPops: joi.string().required().valid('yes', 'no').messages({
    'any.required': 'Select whether the waste contains POPs',
    'any.only': 'Select whether the waste contains POPs'
  }),
  popsComponents: joi.when('containsPops', {
    is: 'yes',
    then: joi.string().trim().required().messages({
      'string.empty': 'Enter the POPs components',
      'any.required': 'Enter the POPs components'
    }),
    otherwise: joi.string().trim().allow('').optional()
  }),
  popsSource: joi.when('containsPops', {
    is: 'yes',
    then: joi.string().trim().required().messages({
      'string.empty': 'Enter the source of POPs components',
      'any.required': 'Enter the source of POPs components'
    }),
    otherwise: joi.string().trim().allow('').optional()
  }),
  containsHazardous: joi.string().required().valid('yes', 'no').messages({
    'any.required': 'Select whether the waste contains hazardous materials',
    'any.only': 'Select whether the waste contains hazardous materials'
  }),
  hazCodes: joi.when('containsHazardous', {
    is: 'yes',
    then: joi.string().trim().required().messages({
      'string.empty': 'Enter the hazardous waste codes',
      'any.required': 'Enter the hazardous waste codes'
    }),
    otherwise: joi.string().trim().allow('').optional()
  }),
  hazComponents: joi.when('containsHazardous', {
    is: 'yes',
    then: joi.string().trim().required().messages({
      'string.empty': 'Enter the hazardous components',
      'any.required': 'Enter the hazardous components'
    }),
    otherwise: joi.string().trim().allow('').optional()
  }),
  hazSource: joi.when('containsHazardous', {
    is: 'yes',
    then: joi.string().trim().required().messages({
      'string.empty': 'Enter the source of hazardous components',
      'any.required': 'Enter the source of hazardous components'
    }),
    otherwise: joi.string().trim().allow('').optional()
  }),
  disposalCode: joi
    .string()
    .trim()
    .required()
    .pattern(/^[RD]\d{1,2}$/)
    .messages({
      'any.required': 'Select a disposal or recovery code',
      'string.empty': 'Select a disposal or recovery code',
      'string.pattern.base': 'Select a valid disposal or recovery code'
    }),
  disposalAmount: joi.number().positive().required().messages({
    'number.base': 'Enter the disposal or recovery amount',
    'number.positive': 'Disposal or recovery amount must be greater than 0',
    'any.required': 'Enter the disposal or recovery amount'
  }),
  disposalMetric: joi
    .string()
    .trim()
    .required()
    .valid(...weightMetrics)
    .messages({
      'any.required': 'Select a disposal or recovery metric',
      'string.empty': 'Select a disposal or recovery metric',
      'any.only': 'Select a valid disposal or recovery metric'
    }),
  disposalIsEstimate: joi
    .string()
    .required()
    .valid('estimate', 'actual')
    .messages({
      'any.required':
        'Select whether the disposal or recovery amount is an estimate or actual',
      'any.only':
        'Select whether the disposal or recovery amount is an estimate or actual'
    })
})

const formatValidationErrors = (error) => {
  const errors = {}
  const errorList = []

  for (const detail of error.details) {
    const field = detail.path[0] ?? detail.context?.key
    if (field && !errors[field]) {
      errors[field] = { text: detail.message }
      errorList.push({ text: detail.message, href: `#${field}` })
    }
  }

  return { errors, errorList }
}

const parseEwcCodes = (raw) =>
  raw
    .split(/[,;]/)
    .map((c) => c.replace(/[^0-9]/g, ''))
    .filter(Boolean)

const parseRegStatements = (raw) => {
  if (!raw) return []
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}

const parseComponentCodes = (raw) => {
  if (!raw) return []
  return raw
    .split(';')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const [code, c] = e.split('=').map((s) => s.trim())
      return { code, concentration: c?.match(/^[0-9.]+$/) ? Number(c) : c }
    })
}

const parseComponentNames = (raw) => {
  if (!raw) return []
  return raw
    .split(';')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const [name, c] = e.split('=').map((s) => s.trim())
      return { name, concentration: c?.match(/^[0-9.]+$/) ? Number(c) : c }
    })
}

const parseHazCodes = (raw) => {
  if (!raw) return []
  return raw
    .split(/[,;]/)
    .map((c) => c.trim().replace(/^HP([0_ ]*)([1-9][0-9]*)$/, 'HP_$2'))
}

const buildWasteItemData = (payload) => {
  const item = {
    ewcCodes: parseEwcCodes(payload.ewcCodes),
    wasteDescription: payload.wasteDescription,
    physicalForm: payload.physicalForm,
    numberOfContainers: payload.numberOfContainers,
    typeOfContainers: payload.typeOfContainers,
    weight: {
      metric: payload.weightMetric,
      amount: payload.weightAmount,
      isEstimate: payload.weightIsEstimate === 'estimate'
    },
    containsPops: payload.containsPops === 'yes',
    containsHazardous: payload.containsHazardous === 'yes',
    disposalOrRecoveryCodes: [
      {
        code: payload.disposalCode,
        weight: {
          metric: payload.disposalMetric,
          amount: payload.disposalAmount,
          isEstimate: payload.disposalIsEstimate === 'estimate'
        }
      }
    ]
  }

  if (payload.containsPops === 'yes') {
    item.pops = {
      components: parseComponentCodes(payload.popsComponents),
      sourceOfComponents: payload.popsSource
    }
  }

  if (payload.containsHazardous === 'yes') {
    item.hazardous = {
      hazCodes: parseHazCodes(payload.hazCodes),
      components: parseComponentNames(payload.hazComponents),
      sourceOfComponents: payload.hazSource
    }
  }

  return item
}

const buildMovement = (movementFormValues, wasteItemForms, organisationId) => {
  const payload = movementFormValues

  const dateReceived = new Date(
    payload['dateReceived-year'],
    payload['dateReceived-month'] - 1,
    payload['dateReceived-day']
  )

  const wasteItems = wasteItemForms.map(buildWasteItemData)

  const movement = {
    receiver: {
      siteName: payload.receiverSiteName,
      emailAddress: payload.receiverEmail,
      phoneNumber: payload.receiverPhone
    },
    receipt: {
      address: {
        fullAddress: payload.receiptAddress,
        postcode: payload.receiptPostcode
      }
    },
    dateTimeReceived: dateReceived.toISOString(),
    submittingOrganisation: {
      defraCustomerOrganisationId: organisationId
    },
    wasteItems
  }

  if (payload.receiverAuthorisationNumber) {
    movement.receiver.authorisationNumber = payload.receiverAuthorisationNumber
  }

  if (payload.receiverRegPositionStatements) {
    movement.receiver.regulatoryPositionStatements = parseRegStatements(
      payload.receiverRegPositionStatements
    )
  }

  if (payload.consignmentCode) {
    movement.hazardousWasteConsignmentCode = payload.consignmentCode
  }

  if (payload.reasonForNoConsignmentCode) {
    movement.reasonForNoConsignmentCode = payload.reasonForNoConsignmentCode
  }

  if (payload.specialHandling) {
    movement.specialHandlingRequirements = payload.specialHandling
  }

  const hasCarrier =
    payload.carrierOrgName || payload.carrierRegNumber || payload.carrierAddress
  if (hasCarrier) {
    movement.carrier = {
      organisationName: payload.carrierOrgName || undefined,
      registrationNumber: payload.carrierRegNumber || undefined,
      reasonForNoRegistrationNumber:
        payload.carrierReasonForNoRegNumber || undefined,
      address: {
        fullAddress: payload.carrierAddress || undefined,
        postcode: payload.carrierPostcode || undefined
      },
      emailAddress: payload.carrierEmail || undefined,
      phoneNumber: payload.carrierPhone || undefined,
      meansOfTransport: payload.carrierTransport || undefined,
      vehicleRegistration: payload.carrierVehicleReg || undefined
    }

    if (payload.carrierReasonForNoRegNumber && !payload.carrierRegNumber) {
      movement.carrier.registrationNumber = ''
    }
  }

  const hasBroker =
    payload.brokerOrgName || payload.brokerRegNumber || payload.brokerAddress
  if (hasBroker) {
    movement.brokerOrDealer = {
      organisationName: payload.brokerOrgName || undefined,
      registrationNumber: payload.brokerRegNumber || undefined,
      address: {
        fullAddress: payload.brokerAddress || undefined,
        postcode: payload.brokerPostcode || undefined
      },
      emailAddress: payload.brokerEmail || undefined,
      phoneNumber: payload.brokerPhone || undefined
    }
  }

  const firstItem = wasteItemForms[0] || {}
  movement._summary = {
    receiverSiteName: payload.receiverSiteName,
    dateReceived: `${payload['dateReceived-day']}/${payload['dateReceived-month']}/${payload['dateReceived-year']}`,
    wasteDescription: firstItem.wasteDescription || '',
    weight: `${firstItem.weightAmount || ''} ${firstItem.weightMetric || ''}`,
    wasteItemCount: wasteItemForms.length
  }

  movement._movementFormValues = { ...payload }
  movement._wasteItemForms = wasteItemForms.map((f) => ({ ...f }))

  return movement
}

const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/')
  return `${day}/${month.padStart(2, '0')}/${year}`
}

const buildMovementViewItems = (movements, organisationId) =>
  movements.map((m, index) => {
    const editUrl = pathTo(paths.manualEntryEdit, {
      organisationId,
      index: `${index || '_'}`
    }).replace('/_', '/0')
    const addItemUrl = pathTo(paths.manualEntryAddItem, {
      organisationId,
      index: `${index || '_'}`
    }).replace('/_', '/0')
    const duplicateUrl = pathTo(paths.manualEntryDuplicate, { organisationId })
    const removeUrl = pathTo(paths.manualEntryRemove, { organisationId })

    const wasteItemRows = (m._wasteItemForms || []).map((item, itemIdx) => [
      { text: `${itemIdx + 1}` },
      { text: item.ewcCodes },
      { text: item.wasteDescription },
      { text: `${item.weightAmount} ${item.weightMetric}` }
    ])

    return {
      number: index + 1,
      summary: m._summary,
      dateFormatted: formatDate(m._summary.dateReceived),
      editUrl,
      addItemUrl,
      duplicateUrl,
      removeUrl,
      index,
      wasteItemRows,
      wasteItemHead: [
        { text: '#' },
        { text: 'EWC codes' },
        { text: 'Description' },
        { text: 'Weight' }
      ]
    }
  })

const buildWasteItemTableRows = (wasteItems, editUrlBase, removeUrl) =>
  wasteItems.map((item, index) => [
    { text: `${index + 1}` },
    { text: item.ewcCodes },
    { text: item.wasteDescription },
    { text: `${item.weightAmount} ${item.weightMetric}` },
    {
      html: `<a class="govuk-link" href="${editUrlBase}/${index}">Edit</a> | <form action="${removeUrl}" method="POST" class="app-inline-form"><input type="hidden" name="itemIndex" value="${index}"><button type="submit" class="govuk-link app-link-button">Remove</button></form>`
    }
  ])

const buildMovementFormViewModel = (
  request,
  values,
  errors,
  errorList,
  editIndex
) => {
  const organisationName = request?.auth?.credentials?.currentOrganisationName
  const organisationId = request.auth.credentials.currentOrganisationId
  const isEditing = editIndex !== undefined
  const pageContent = content.manualEntryAdd(request, organisationName)

  const actionUrl = isEditing
    ? pathTo(paths.manualEntryEdit, { organisationId, index: `${editIndex}` })
    : pathTo(paths.manualEntryAdd, { organisationId })

  const buttonText = isEditing
    ? 'Save and continue'
    : pageContent.continueAction
  const title = isEditing ? 'Edit movement details' : pageContent.title

  return {
    pageTitle: errorList?.length ? `Error: ${title}` : title,
    heading: { ...pageContent.heading, text: title },
    sections: pageContent.sections,
    action: { url: actionUrl, text: buttonText },
    backLink: pathTo(paths.manualEntry, { organisationId }),
    values: values ?? {},
    errors: errors ?? {},
    errorList: errorList ?? [],
    errorTitle: pageContent.error.title,
    physicalForms,
    weightMetrics,
    meansOfTransport
  }
}

const buildWasteItemFormViewModel = (
  request,
  values,
  errors,
  errorList,
  editItemIndex
) => {
  const organisationName = request?.auth?.credentials?.currentOrganisationName
  const organisationId = request.auth.credentials.currentOrganisationId
  const isEditing = editItemIndex !== undefined
  const pageContent = content.manualEntryWasteItemAdd(request, organisationName)

  const actionUrl = isEditing
    ? pathTo(paths.manualEntryWasteItemEdit, {
        organisationId,
        itemIndex: `${editItemIndex}`
      })
    : pathTo(paths.manualEntryWasteItemAdd, { organisationId })

  const buttonText = isEditing ? 'Save waste item' : pageContent.continueAction
  const title = isEditing ? 'Edit waste item' : pageContent.title

  return {
    pageTitle: errorList?.length ? `Error: ${title}` : title,
    heading: { ...pageContent.heading, text: title },
    action: { url: actionUrl, text: buttonText },
    backLink: pathTo(paths.manualEntryWasteItems, { organisationId }),
    values: values ?? {},
    errors: errors ?? {},
    errorList: errorList ?? [],
    errorTitle: pageContent.error.title,
    physicalForms,
    weightMetrics
  }
}

const movementTestValues = {
  receiverSiteName: 'Greenfield Waste Recycling Centre',
  receiptAddress: '14 Industrial Park Road\nBirmingham\nWest Midlands',
  receiptPostcode: 'B12 0QR',
  receiverAuthorisationNumber: 'EA/EPR/WP3934AB',
  receiverRegPositionStatements: '',
  receiverEmail: 'intake@greenfieldrecycling.co.uk',
  receiverPhone: '0121 456 7890',
  'dateReceived-day': '19',
  'dateReceived-month': '3',
  'dateReceived-year': '2026',
  consignmentCode: 'HWC-2026-00451',
  reasonForNoConsignmentCode: '',
  specialHandling: '',
  carrierOrgName: 'Swift Haulage Ltd',
  carrierRegNumber: 'CBDU375918',
  carrierReasonForNoRegNumber: '',
  carrierAddress: '7 Logistics Way\nCoventry',
  carrierPostcode: 'CV3 4GH',
  carrierEmail: 'ops@swifthaulage.co.uk',
  carrierPhone: '024 7612 3456',
  carrierTransport: 'Road',
  carrierVehicleReg: 'KX72 BNF',
  brokerOrgName: '',
  brokerRegNumber: '',
  brokerAddress: '',
  brokerPostcode: '',
  brokerEmail: '',
  brokerPhone: ''
}

const wasteItemTestValues = {
  ewcCodes: '170405, 200301',
  wasteDescription: 'Mixed ferrous metals and municipal solid waste',
  physicalForm: 'Solid',
  numberOfContainers: '3',
  typeOfContainers: 'SKIP',
  weightMetric: 'Tonnes',
  weightAmount: '8.5',
  weightIsEstimate: 'estimate',
  containsPops: 'no',
  popsComponents: '',
  popsSource: '',
  containsHazardous: 'no',
  hazCodes: '',
  hazComponents: '',
  hazSource: '',
  disposalCode: 'R4',
  disposalAmount: '8.5',
  disposalMetric: 'Tonnes',
  disposalIsEstimate: 'estimate'
}

export const listController = {
  handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName
    const organisationId = request.auth.credentials.currentOrganisationId
    const pageContent = content.manualEntry(request, organisationName)
    const movements = getMovements(request)

    const movementItems = buildMovementViewItems(movements, organisationId)

    return h.view('manualEntry/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      movements,
      movementItems,
      addUrl: pathTo(paths.manualEntryAdd, { organisationId }),
      submitUrl: pathTo(paths.manualEntry, { organisationId }),
      addAction: pageContent.addAction,
      submitAction: pageContent.submitAction,
      emptyMessage: pageContent.emptyMessage,
      backLink: paths.nextAction
    })
  }
}

export const submitController = {
  handler(request, h) {
    const organisationId = request.auth.credentials.currentOrganisationId
    const movements = getMovements(request)

    logger.info(
      `Submitting ${movements.length} movements: ${JSON.stringify(movements)}`
    )

    request.yar.flash('movementCount', movements.length)
    setMovements(request, [])

    return h.redirect(pathTo(paths.manualEntryConfirmation, { organisationId }))
  }
}

export const addController = {
  get: {
    handler(request, h) {
      setDraft(request, {
        movementFormValues: null,
        wasteItems: [],
        editIndex: null
      })
      return h.view(
        'manualEntry/add',
        buildMovementFormViewModel(request, movementTestValues)
      )
    }
  },
  post: {
    options: {
      validate: {
        payload: movementSchema,
        options: { abortEarly: false, stripUnknown: true },
        failAction(request, h, error) {
          const { errors, errorList } = formatValidationErrors(error)
          return h
            .view(
              'manualEntry/add',
              buildMovementFormViewModel(
                request,
                request.payload,
                errors,
                errorList
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const organisationId = request.auth.credentials.currentOrganisationId
      const draft = getDraft(request)
      draft.movementFormValues = { ...request.payload }
      setDraft(request, draft)

      return h.redirect(pathTo(paths.manualEntryWasteItems, { organisationId }))
    }
  }
}

export const editController = {
  get: {
    handler(request, h) {
      const index = Number(request.params.index)
      const movements = getMovements(request)

      if (index < 0 || index >= movements.length) {
        const organisationId = request.auth.credentials.currentOrganisationId
        return h.redirect(pathTo(paths.manualEntry, { organisationId }))
      }

      const movement = movements[index]
      setDraft(request, {
        movementFormValues: movement._movementFormValues,
        wasteItems: movement._wasteItemForms || [],
        editIndex: index
      })

      return h.view(
        'manualEntry/add',
        buildMovementFormViewModel(
          request,
          movement._movementFormValues,
          undefined,
          undefined,
          index
        )
      )
    }
  },
  post: {
    options: {
      validate: {
        payload: movementSchema,
        options: { abortEarly: false, stripUnknown: true },
        failAction(request, h, error) {
          const { errors, errorList } = formatValidationErrors(error)
          const index = Number(request.params.index)
          return h
            .view(
              'manualEntry/add',
              buildMovementFormViewModel(
                request,
                request.payload,
                errors,
                errorList,
                index
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const organisationId = request.auth.credentials.currentOrganisationId
      const draft = getDraft(request)
      draft.movementFormValues = { ...request.payload }
      setDraft(request, draft)

      return h.redirect(pathTo(paths.manualEntryWasteItems, { organisationId }))
    }
  }
}

export const wasteItemsController = {
  get: {
    handler(request, h) {
      const organisationName =
        request?.auth?.credentials?.currentOrganisationName
      const organisationId = request.auth.credentials.currentOrganisationId
      const pageContent = content.manualEntryWasteItems(
        request,
        organisationName
      )
      const draft = getDraft(request)

      const editUrlBase = pathTo(paths.manualEntryWasteItemEdit, {
        organisationId,
        itemIndex: '_'
      }).replace('/_', '')
      const removeUrl = pathTo(paths.manualEntryWasteItemRemove, {
        organisationId
      })
      const tableHead = pageContent.table.headings.map((text) => ({ text }))
      const tableRows = buildWasteItemTableRows(
        draft.wasteItems,
        editUrlBase,
        removeUrl
      )

      return h.view('manualEntry/waste-items', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        wasteItems: draft.wasteItems,
        tableHead,
        tableRows,
        addUrl: pathTo(paths.manualEntryWasteItemAdd, { organisationId }),
        saveUrl: pathTo(paths.manualEntryWasteItems, { organisationId }),
        addAction: pageContent.addAction,
        saveAction: pageContent.saveAction,
        emptyMessage: pageContent.emptyMessage,
        backLink: pathTo(paths.manualEntryAdd, { organisationId })
      })
    }
  },
  post: {
    handler(request, h) {
      const organisationId = request.auth.credentials.currentOrganisationId
      const draft = getDraft(request)

      if (draft.wasteItems.length === 0) {
        return h.redirect(
          pathTo(paths.manualEntryWasteItems, { organisationId })
        )
      }

      const movement = buildMovement(
        draft.movementFormValues,
        draft.wasteItems,
        organisationId
      )
      const movements = getMovements(request)

      if (draft.editIndex !== null && draft.editIndex < movements.length) {
        movements[draft.editIndex] = movement
      } else {
        movements.push(movement)
      }

      setMovements(request, movements)
      clearDraft(request)

      return h.redirect(pathTo(paths.manualEntry, { organisationId }))
    }
  }
}

export const wasteItemAddController = {
  get: {
    handler(request, h) {
      return h.view(
        'manualEntry/add-waste-item',
        buildWasteItemFormViewModel(request, wasteItemTestValues)
      )
    }
  },
  post: {
    options: {
      validate: {
        payload: wasteItemSchema,
        options: { abortEarly: false, stripUnknown: true },
        failAction(request, h, error) {
          const { errors, errorList } = formatValidationErrors(error)
          return h
            .view(
              'manualEntry/add-waste-item',
              buildWasteItemFormViewModel(
                request,
                request.payload,
                errors,
                errorList
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const organisationId = request.auth.credentials.currentOrganisationId
      const draft = getDraft(request)
      draft.wasteItems.push({ ...request.payload })
      setDraft(request, draft)

      return h.redirect(pathTo(paths.manualEntryWasteItems, { organisationId }))
    }
  }
}

export const wasteItemEditController = {
  get: {
    handler(request, h) {
      const itemIndex = Number(request.params.itemIndex)
      const draft = getDraft(request)

      if (itemIndex < 0 || itemIndex >= draft.wasteItems.length) {
        const organisationId = request.auth.credentials.currentOrganisationId
        return h.redirect(
          pathTo(paths.manualEntryWasteItems, { organisationId })
        )
      }

      return h.view(
        'manualEntry/add-waste-item',
        buildWasteItemFormViewModel(
          request,
          draft.wasteItems[itemIndex],
          undefined,
          undefined,
          itemIndex
        )
      )
    }
  },
  post: {
    options: {
      validate: {
        payload: wasteItemSchema,
        options: { abortEarly: false, stripUnknown: true },
        failAction(request, h, error) {
          const { errors, errorList } = formatValidationErrors(error)
          const itemIndex = Number(request.params.itemIndex)
          return h
            .view(
              'manualEntry/add-waste-item',
              buildWasteItemFormViewModel(
                request,
                request.payload,
                errors,
                errorList,
                itemIndex
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const organisationId = request.auth.credentials.currentOrganisationId
      const itemIndex = Number(request.params.itemIndex)
      const draft = getDraft(request)

      if (itemIndex >= 0 && itemIndex < draft.wasteItems.length) {
        draft.wasteItems[itemIndex] = { ...request.payload }
        setDraft(request, draft)
      }

      return h.redirect(pathTo(paths.manualEntryWasteItems, { organisationId }))
    }
  }
}

export const wasteItemRemoveController = {
  options: {
    validate: {
      payload: joi.object({
        itemIndex: joi.number().integer().min(0).required()
      }),
      options: { stripUnknown: true }
    }
  },
  handler(request, h) {
    const organisationId = request.auth.credentials.currentOrganisationId
    const draft = getDraft(request)
    const itemIndex = request.payload.itemIndex

    if (itemIndex >= 0 && itemIndex < draft.wasteItems.length) {
      draft.wasteItems.splice(itemIndex, 1)
      setDraft(request, draft)
    }

    return h.redirect(pathTo(paths.manualEntryWasteItems, { organisationId }))
  }
}

export const addItemController = {
  handler(request, h) {
    const organisationId = request.auth.credentials.currentOrganisationId
    const index = Number(request.params.index)
    const movements = getMovements(request)

    if (index < 0 || index >= movements.length) {
      return h.redirect(pathTo(paths.manualEntry, { organisationId }))
    }

    const movement = movements[index]
    setDraft(request, {
      movementFormValues: movement._movementFormValues,
      wasteItems: movement._wasteItemForms || [],
      editIndex: index
    })

    return h.redirect(pathTo(paths.manualEntryWasteItemAdd, { organisationId }))
  }
}

export const duplicateController = {
  options: {
    validate: {
      payload: joi.object({
        index: joi.number().integer().min(0).required()
      }),
      options: { stripUnknown: true }
    }
  },
  handler(request, h) {
    const organisationId = request.auth.credentials.currentOrganisationId
    const movements = getMovements(request)
    const index = request.payload.index

    if (index >= 0 && index < movements.length) {
      const copy = JSON.parse(JSON.stringify(movements[index]))
      movements.splice(index + 1, 0, copy)
      setMovements(request, movements)
    }

    return h.redirect(pathTo(paths.manualEntry, { organisationId }))
  }
}

export const removeController = {
  options: {
    validate: {
      payload: joi.object({
        index: joi.number().integer().min(0).required()
      }),
      options: { stripUnknown: true }
    }
  },
  handler(request, h) {
    const organisationId = request.auth.credentials.currentOrganisationId
    const movements = getMovements(request)
    const index = request.payload.index

    if (index >= 0 && index < movements.length) {
      movements.splice(index, 1)
      setMovements(request, movements)
    }

    return h.redirect(pathTo(paths.manualEntry, { organisationId }))
  }
}

export const confirmationController = {
  handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName
    const pageContent = content.manualEntryConfirmation(
      request,
      organisationName
    )

    const [movementCount] = request.yar.flash('movementCount')

    return h.view('manualEntry/confirmation', {
      pageTitle: pageContent.title,
      content: pageContent.content,
      movementCount: movementCount || 0,
      returnAction: {
        text: pageContent.returnLink,
        link: paths.nextAction
      }
    })
  }
}
