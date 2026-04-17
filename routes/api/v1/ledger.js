const express = require('express');
const { query, param, validationResult } = require('express-validator');
const validateToken = require('../../../middleware/auth');
const { sendValidationError } = require('../../../utils/response');
const { getLedger, getLedgerById } = require('../../../controllers/ledger');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }
  return next();
};

const ledgerListValidation = [
  query('type')
    .optional()
    .isString()
    .withMessage('type must be a string')
    .trim()
    .isIn(['deposit', 'withdrawal', 'bet', 'win', 'refund', 'bonus'])
    .withMessage('type must be one of: deposit, withdrawal, bet, win, refund, bonus'),
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('fromDate must be a valid ISO 8601 date'),
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('toDate must be a valid ISO 8601 date'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minAmount must be a non-negative number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxAmount must be a non-negative number'),
  query('search')
    .optional()
    .isString()
    .withMessage('search must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('search must be at most 200 characters'),
  query('cursor')
    .optional()
    .isString()
    .withMessage('cursor must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('cursor must not be empty'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query().custom((value, { req }) => {
    const { fromDate, toDate, minAmount, maxAmount } = req.query;

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      throw new Error('fromDate must be less than or equal to toDate');
    }

    if (minAmount !== undefined && maxAmount !== undefined) {
      if (Number(minAmount) > Number(maxAmount)) {
        throw new Error('minAmount must be less than or equal to maxAmount');
      }
    }

    return true;
  }),
];

const ledgerIdValidation = [
  param('id')
    .exists()
    .withMessage('id is required')
    .bail()
    .isString()
    .withMessage('id must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('id must not be empty'),
];

router.get('/', validateToken, ledgerListValidation, validate, getLedger);
router.get('/:id', validateToken, ledgerIdValidation, validate, getLedgerById);

module.exports = router;