export default {
  sendMail: jest.fn().mockImplementation(() => Promise.resolve({ messageId: 333 })),
};
