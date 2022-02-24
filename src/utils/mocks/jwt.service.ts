export const returnValues = {
  SIGN_RESULT: 'aaaa',
};

export default {
  sign: jest.fn().mockImplementation(() => returnValues.SIGN_RESULT),
};
