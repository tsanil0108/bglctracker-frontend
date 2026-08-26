import axiosClient from './axiosClient'


export const reportExportApi = {

  download: async ({
    type,
    format = 'xlsx',
    groupCompanyId = null,
  }) => {

    const response =
      await axiosClient.get(
        '/reports/export',
        {
          params: {
            type,
            format,
            groupCompanyId:
              groupCompanyId || undefined,
          },

          responseType:
            'blob',
        }
      )


    return response
  },
}