import axiosClient from './axiosClient'


export const groupCompanyOverviewApi = {

  getOverview: (id) =>
    axiosClient
      .get(
        `/master/group-companies/${id}/overview`
      )
      .then(
        (response) =>
          response.data
      ),
}