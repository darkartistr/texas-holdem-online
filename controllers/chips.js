const { INITIAL_CHIPS_AMOUNT } = require('../config');
const mockDataStore = require('../utils/mockData');
const { asyncHandler, NotFoundError, ValidationError } = require('../utils/errors');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * @route   GET api/chips/free
 * @desc    Request free chips if user has zero chips remaining
 * @access  Private
 */
exports.handleFreeChipsRequest = asyncHandler(async (req, res) => {
  const user = mockDataStore.users.findById(req.user.id);
  
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (user.chipsAmount > 0) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_REQUEST, [
      { msg: 'You still have chips remaining' },
    ]);
  }

  const updatedUser = mockDataStore.users.update(req.user.id, {
    chipsAmount: user.chipsAmount + INITIAL_CHIPS_AMOUNT,
  });

  if (!updatedUser) {
    throw new Error('Failed to update user chips');
  }

  const userWithoutPassword = mockDataStore.users.getUserWithoutPassword(updatedUser);
  return sendSuccess(
    res,
    userWithoutPassword,
    SUCCESS_MESSAGES.CHIPS_ADDED,
    HTTP_STATUS.OK
  );
});
