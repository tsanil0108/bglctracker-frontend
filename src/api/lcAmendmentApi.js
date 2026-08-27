import axiosClient from './axiosClient'


export const lcAmendmentApi = {

  // =====================================================
  // ADD AMENDMENT
  // POST /api/lc/{lcId}/amendments
  // =====================================================

  add: (
    lcId,
    payload
  ) =>
    axiosClient
      .post(
        `/lc/${lcId}/amendments`,
        payload
      )
      .then(
        (response) =>
          response.data
      ),


  // =====================================================
  // GET ALL AMENDMENTS OF LC
  // GET /api/lc/{lcId}/amendments
  // =====================================================

  getByLcId: (
    lcId
  ) =>
    axiosClient
      .get(
        `/lc/${lcId}/amendments`
      )
      .then(
        (response) =>
          response.data
      ),


  // =====================================================
  // DELETE AMENDMENT
  // DELETE /api/lc/{lcId}/amendments/{amendmentId}
  // =====================================================

  remove: (
    lcId,
    amendmentId
  ) =>
    axiosClient
      .delete(
        `/lc/${lcId}/amendments/${amendmentId}`
      )
      .then(
        (response) =>
          response.data
      ),
}