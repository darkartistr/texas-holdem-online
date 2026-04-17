const mockDataStore = require('../utils/mockData');
const { asyncHandler, NotFoundError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @route   GET api/v1/ledger
 * @desc    Get player ledger entries (read-only)
 * @access  Private
 */
exports.getLedger = asyncHandler(async (req, res) => {
  const {
    type,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    search,
    cursor,
    limit,
  } = req.query;

  const result = mockDataStore.ledger.findAll({
    userId: req.user.id,
    type,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    search,
    cursor,
    limit,
  });

  return sendSuccess(
    res,
    result,
    'Ledger entries retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * @route   GET api/v1/ledger/:id
 * @desc    Get single ledger entry by id
 * @access  Private
 */
exports.getLedgerById = asyncHandler(async (req, res) => {
  const entry = mockDataStore.ledger.findById(req.params.id);

  if (!entry || entry.userId !== String(req.user.id)) {
    throw new NotFoundError('Ledger entry not found');
  }

  return sendSuccess(
    res,
    entry,
    'Ledger entry retrieved successfully',
    HTTP_STATUS.OK
  );
});
