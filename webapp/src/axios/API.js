import constants from '@/config/constants';
import axios from 'axios';
import store from '@/redux/store';
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_TOO_MANY_REQUESTS,
  HTTP_UNAUTHORIZED,
  HTTP_UNPROCESSABLE_ENTITY
} from '@/config/ResponseStatus';

const URL = constants.BASE_API;

async function API(config) {
    config.headers = {
      //
    };

  //interceptors handle network error
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    function (error) {
      if (!error.response) {
        error.response = {
          data: 'network error',
          status: 500
        };
      }

      if (accessToken) {
        const statusReq = error.response.status;

        // Handle HTTP Unauthorized status when accessToken is available
        if (statusReq == HTTP_UNAUTHORIZED) {
          store.dispatch(clearToken());
        } else if (statusReq != HTTP_UNPROCESSABLE_ENTITY) {
          let status = HTTP_INTERNAL_SERVER_ERROR;
          if (statusReq == HTTP_FORBIDDEN) {
            status = HTTP_FORBIDDEN;
          }
          if (statusReq == HTTP_NOT_FOUND) {
            status = HTTP_NOT_FOUND;
          }
          if (statusReq == HTTP_TOO_MANY_REQUESTS) {
            status = HTTP_TOO_MANY_REQUESTS;
          }

          // Dispatch error status to the store
          store.dispatch(setState({ errorAPI: status }));
        }
      }

      return Promise.reject(error);
    }
  );

  config.baseURL = URL;
  return axios(config);
}

export default API;