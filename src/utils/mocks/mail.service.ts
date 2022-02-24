export default {
  sendMail: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
};
