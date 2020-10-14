const axios = {
  post: jest.fn(() => Promise.resolve({ data: {} })),
};
module.exports = axios;
