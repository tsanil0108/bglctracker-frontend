import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Trash2,
  Upload,
  History,
  Plus,
  Link2,
  Unlink,
  Landmark,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'

import {
  Input,
  Select,
} from '../../components/common/Field'

import {
  useToast,
} from '../../components/common/Toast'

import {
  bgApi,
} from '../../api/bgApi'

import {
  fdLinkApi,
} from '../../api/fdLinkApi'

import {
  documentApi,
} from '../../api/documentApi'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


const DOCUMENT_TYPES = [
  'Original BG',
  'Amendment',
  'Extension Letter',
  'Bank Advice',
  'Release Letter',
  'Invocation Letter',
  'Other',
]


function safeNumber(value) {

  const parsed =
    Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : 0
}


export default function BgDetails() {

  const { id } =
    useParams()


  const { push } =
    useToast()


  // =========================================================
  // BG
  // =========================================================

  const [
    bg,
    setBg,
  ] =
    useState(null)


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  // =========================================================
  // LINKED FD
  // =========================================================

  const [
    linkedFds,
    setLinkedFds,
  ] =
    useState([])


  const [
    linksLoading,
    setLinksLoading,
  ] =
    useState(false)


  const [
    unlinkingId,
    setUnlinkingId,
  ] =
    useState(null)


  // =========================================================
  // DOCUMENTS
  // =========================================================

  const [
    documents,
    setDocuments,
  ] =
    useState([])


  const [
    documentsLoading,
    setDocumentsLoading,
  ] =
    useState(false)


  const [
    uploadForm,
    setUploadForm,
  ] =
    useState({

      documentType:
        'Original BG',

      remarks:
        '',

      file:
        null,
    })


  const [
    uploading,
    setUploading,
  ] =
    useState(false)


  const [
    deletingDocumentId,
    setDeletingDocumentId,
  ] =
    useState(null)


  // =========================================================
  // LOAD BG
  // =========================================================

  const loadBg =
    async () => {

      try {

        const data =
          await bgApi.getById(
            id
          )


        setBg(
          data
        )


      } catch (error) {

        console.error(
          'BG load error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not load Bank Guarantee.'
          ),
          'error'
        )
      }
    }


  // =========================================================
  // LOAD LINKED FDS
  // =========================================================

  const loadLinkedFds =
    async () => {

      setLinksLoading(
        true
      )


      try {

        const data =
          await fdLinkApi.getByBg(
            id
          )


        console.log(
          'BG LINKED FDS:',
          data
        )


        setLinkedFds(
          Array.isArray(data)
            ? data
            : []
        )


      } catch (error) {

        console.error(
          'Linked FD load error:',
          error
        )


        setLinkedFds(
          []
        )


      } finally {

        setLinksLoading(
          false
        )
      }
    }


  // =========================================================
  // LOAD DOCUMENTS
  // =========================================================

  const loadDocuments =
    async () => {

      setDocumentsLoading(
        true
      )


      try {

        const data =
          await documentApi.list(
            'BG',
            id
          )


        setDocuments(
          Array.isArray(data)
            ? data
            : []
        )


      } catch (error) {

        console.error(
          'Document load error:',
          error
        )


      } finally {

        setDocumentsLoading(
          false
        )
      }
    }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(
    () => {

      const load =
        async () => {

          setLoading(
            true
          )


          try {

            await Promise.all([
              loadBg(),
              loadLinkedFds(),
              loadDocuments(),
            ])


          } finally {

            setLoading(
              false
            )
          }
        }


      load()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [id]
  )


  // =========================================================
  // LINK SUMMARY
  // =========================================================

  const totalLinkedAmount =
    useMemo(
      () =>

        linkedFds.reduce(
          (
            total,
            link
          ) =>

            total +
            safeNumber(
              link.linkedAmount ??
              link.amount
            ),

          0
        ),

      [
        linkedFds,
      ]
    )


  // =========================================================
  // UNLINK FD
  // =========================================================

  const handleUnlinkFd =
    async (
      link
    ) => {

      const fdNumber =
        link.fdNumber ??
        link.fixedDepositNumber ??
        link.fixedDeposit?.fdNumber ??
        link.fixedDeposit?.fdNumber ??
        'Fixed Deposit'


      const linkedAmount =
        safeNumber(
          link.linkedAmount ??
          link.amount
        )


      const confirmed =
        window.confirm(
          `Unlink ${fdNumber}?\n\n` +
          `${formatCurrency(linkedAmount)} will be released from this Bank Guarantee.\n\n` +
          `The Fixed Deposit itself will NOT be deleted.`
        )


      if (
        !confirmed
      ) {

        return
      }


      setUnlinkingId(
        link.id
      )


      try {

        await fdLinkApi.remove(
          link.id
        )


        push(
          `${fdNumber} unlinked successfully.`
        )


        /*
         * Refresh both.
         *
         * BG linked count
         * +
         * FD link list
         */
        await Promise.all([
          loadLinkedFds(),
          loadBg(),
        ])


      } catch (error) {

        console.error(
          'FD unlink error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not unlink Fixed Deposit.'
          ),
          'error'
        )


      } finally {

        setUnlinkingId(
          null
        )
      }
    }


  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const handleUpload =
    async () => {

      if (
        !uploadForm.file
      ) {

        push(
          'Please choose a file.',
          'error'
        )

        return
      }


      if (
        !uploadForm.documentType
      ) {

        push(
          'Please select document type.',
          'error'
        )

        return
      }


      setUploading(
        true
      )


      try {

        await documentApi.upload(

          'BG',

          id,

          uploadForm.documentType,

          uploadForm.file,

          uploadForm.remarks
        )


        push(
          'Document uploaded successfully.'
        )


        setUploadForm({

          documentType:
            'Original BG',

          remarks:
            '',

          file:
            null,
        })


        const fileInput =
          window.document.getElementById(
            'bg-document-file'
          )


        if (
          fileInput
        ) {

          fileInput.value =
            ''
        }


        await loadDocuments()


      } catch (error) {

        console.error(
          'Document upload error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not upload document.'
          ),
          'error'
        )


      } finally {

        setUploading(
          false
        )
      }
    }


  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleView =
    async (
      doc
    ) => {

      try {

        const response =
          await documentApi.view(
            doc.id
          )


        const contentType =
          response.contentType ||
          doc.fileType ||
          'application/octet-stream'


        const fileBlob =
          new Blob(
            [
              response.blob,
            ],
            {
              type:
                contentType,
            }
          )


        const url =
          window.URL.createObjectURL(
            fileBlob
          )


        const newWindow =
          window.open(
            url,
            '_blank',
            'noopener,noreferrer'
          )


        if (
          !newWindow
        ) {

          push(
            'Popup was blocked. Please allow popups to view the document.',
            'error'
          )


          window.URL.revokeObjectURL(
            url
          )

          return
        }


        setTimeout(
          () => {

            window.URL.revokeObjectURL(
              url
            )

          },
          60000
        )


      } catch (error) {

        push(
          extractErrorMessage(
            error,
            'Could not open document.'
          ),
          'error'
        )
      }
    }


  // =========================================================
  // DOWNLOAD DOCUMENT
  // =========================================================

  const handleDownload =
    async (
      doc
    ) => {

      try {

        const response =
          await documentApi.download(
            doc.id
          )


        const contentType =
          response.contentType ||
          doc.fileType ||
          'application/octet-stream'


        const fileBlob =
          new Blob(
            [
              response.blob,
            ],
            {
              type:
                contentType,
            }
          )


        const url =
          window.URL.createObjectURL(
            fileBlob
          )


        const anchor =
          window.document.createElement(
            'a'
          )


        anchor.href =
          url


        anchor.download =
          doc.fileName ||
          'document'


        window.document.body.appendChild(
          anchor
        )


        anchor.click()


        anchor.remove()


        window.URL.revokeObjectURL(
          url
        )


      } catch (error) {

        push(
          extractErrorMessage(
            error,
            'Could not download document.'
          ),
          'error'
        )
      }
    }


  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  const handleDeleteDocument =
    async (
      doc
    ) => {

      const confirmed =
        window.confirm(
          `Delete "${doc.fileName}"?`
        )


      if (
        !confirmed
      ) {

        return
      }


      setDeletingDocumentId(
        doc.id
      )


      try {

        await documentApi.remove(
          doc.id
        )


        push(
          'Document deleted.'
        )


        await loadDocuments()


      } catch (error) {

        push(
          extractErrorMessage(
            error,
            'Could not delete document.'
          ),
          'error'
        )


      } finally {

        setDeletingDocumentId(
          null
        )
      }
    }


  // =========================================================
  // PAGE STATES
  // =========================================================

  if (
    loading
  ) {

    return (
      <Loader />
    )
  }


  if (
    !bg
  ) {

    return (

      <div className="rounded-xl border border-border bg-white p-6 text-sm text-muted">

        Bank Guarantee not found.

      </div>
    )
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader

        eyebrow="Bank Guarantee"

        title={
          bg.bgNo
        }

        description={
          `${bg.groupCompanyName || 'Unassigned'} · ${bg.issuingBankName || '—'}`
        }

        actions={

          <Link
            to="/bg"
          >

            <Button
              variant="outline"
            >

              <ArrowLeft
                size={16}
              />

              Back

            </Button>

          </Link>
        }
      />


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

        <Summary

          label="BG Amount"

          value={
            formatCurrency(
              bg.bgAmount
            )
          }
        />


        <Summary

          label="Client"

          value={
            bg.clientName ||
            '—'
          }
        />


        <Summary

          label="Expiry"

          value={
            formatDate(
              bg.expiryDate
            )
          }
        />


        <Summary

          label="FD Margin Linked"

          value={
            formatCurrency(
              totalLinkedAmount
            )
          }

          highlight={
            totalLinkedAmount > 0
          }
        />


        <Card>

          <p className="text-xs uppercase tracking-wide text-muted">
            Status
          </p>


          <div className="mt-3">

            <StatusBadge
              status={
                bg.status
              }
            />

          </div>

        </Card>

      </div>


      {/* ======================================================
          BASIC DETAILS
      ====================================================== */}

      <Card className="mt-6">

        <h2 className="font-display text-xl font-semibold text-ink-900">
          Bank Guarantee Details
        </h2>


        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-4">

          <Info

            label="Group Company"

            value={
              bg.groupCompanyName ||
              'Unassigned'
            }
          />


          <Info

            label="Issuing Bank"

            value={
              bg.issuingBankName ||
              '—'
            }
          />


          <Info

            label="Client"

            value={
              bg.clientName ||
              '—'
            }
          />


          <Info

            label="Site / Project"

            value={
              bg.siteProject ||
              '—'
            }
          />


          <Info

            label="Guarantee Type"

            value={
              bg.guaranteeTypeCode ||
              '—'
            }
          />


          <Info

            label="Issue Date"

            value={
              formatDate(
                bg.issueDate
              )
            }
          />


          <Info

            label="Expiry Date"

            value={
              formatDate(
                bg.expiryDate
              )
            }
          />


          <Info

            label="Claim Expiry"

            value={
              formatDate(
                bg.claimExpiryDate
              )
            }
          />


          <Info

            label="Interest Rate"

            value={
              bg.interestRate != null
                ? `${bg.interestRate}%`
                : '—'
            }
          />


          <Info

            label="Bank Charges"

            value={
              formatCurrency(
                bg.bankCharges ||
                0
              )
            }
          />


          <Info

            label="Duration / Claim Period"

            value={
              bg.durationClaimPeriod ||
              '—'
            }
          />

        </div>

      </Card>


      {/* ======================================================
          LINKED FIXED DEPOSITS
      ====================================================== */}

      <Card className="mt-6">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="flex items-start gap-3">

            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-50 text-bg-700">

              <Landmark
                size={18}
              />

            </span>


            <div>

              <h2 className="font-display text-xl font-semibold text-ink-900">
                Linked Fixed Deposits
              </h2>


              <p className="mt-1 text-sm text-muted">
                Fixed Deposits pledged as margin against this Bank Guarantee.
              </p>

            </div>

          </div>


          <Link
            to="/fd-linking"
          >

            <Button
              type="button"
              variant="outline"
            >

              <Link2
                size={16}
              />

              Manage Links

            </Button>

          </Link>

        </div>


        {
          linksLoading

            ? (

                <div className="mt-6">

                  <Loader />

                </div>
              )

            : linkedFds.length ===
              0

              ? (

                  <div className="mt-6 rounded-xl border border-dashed border-border px-5 py-10 text-center">

                    <Link2
                      size={26}
                      className="mx-auto text-muted"
                    />


                    <p className="mt-3 text-sm font-medium text-ink-900">
                      No Fixed Deposit linked
                    </p>


                    <p className="mt-1 text-xs text-muted">
                      This Bank Guarantee currently has no Fixed Deposit pledged against it.
                    </p>

                  </div>
                )

              : (

                  <>

                    <div className="mt-6 overflow-x-auto">

                      <table className="min-w-full text-sm">

                        <thead>

                          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

                            <th className="py-3 pr-5">
                              FD Number
                            </th>

                            <th className="py-3 pr-5">
                              Bank
                            </th>

                            <th className="py-3 pr-5">
                              FD Amount
                            </th>

                            <th className="py-3 pr-5">
                              Linked Amount
                            </th>

                            <th className="py-3 pr-5">
                              Maturity
                            </th>

                            <th className="py-3 text-right">
                              Action
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          {
                            linkedFds.map(
                              (
                                link
                              ) => {

                                const fdNumber =
                                  getFdNumber(
                                    link
                                  )


                                const bankName =
                                  getFdBankName(
                                    link
                                  )


                                const fdAmount =
                                  getFdAmount(
                                    link
                                  )


                                const linkedAmount =
                                  getLinkedAmount(
                                    link
                                  )


                                const maturityDate =
                                  getFdMaturityDate(
                                    link
                                  )


                                return (

                                  <tr
                                    key={
                                      link.id
                                    }
                                    className="border-b border-border/70"
                                  >

                                    <td className="py-4 pr-5">

                                      <p className="font-medium text-ink-900">
                                        {fdNumber}
                                      </p>

                                    </td>


                                    <td className="py-4 pr-5">
                                      {bankName}
                                    </td>


                                    <td className="py-4 pr-5 num">
                                      {
                                        formatCurrency(
                                          fdAmount
                                        )
                                      }
                                    </td>


                                    <td className="py-4 pr-5">

                                      <span className="num font-semibold text-ink-900">

                                        {
                                          formatCurrency(
                                            linkedAmount
                                          )
                                        }

                                      </span>

                                    </td>


                                    <td className="py-4 pr-5">

                                      {
                                        maturityDate
                                          ? formatDate(
                                              maturityDate
                                            )
                                          : '—'
                                      }

                                    </td>


                                    <td className="py-4 text-right">

                                      <button

                                        type="button"

                                        disabled={
                                          unlinkingId ===
                                          link.id
                                        }

                                        onClick={
                                          () =>
                                            handleUnlinkFd(
                                              link
                                            )
                                        }

                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"

                                        title="Unlink Fixed Deposit"
                                      >

                                        <Unlink
                                          size={15}
                                        />

                                        {
                                          unlinkingId ===
                                          link.id
                                            ? 'Unlinking…'
                                            : 'Unlink'
                                        }

                                      </button>

                                    </td>

                                  </tr>
                                )
                              }
                            )
                          }

                        </tbody>

                      </table>

                    </div>


                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                      <p className="text-sm text-amber-900">

                        <strong>
                          Delete protection:
                        </strong>

                        {' '}

                        This Bank Guarantee cannot be deleted while any Fixed Deposit is linked to it.

                        {' '}

                        Use

                        {' '}

                        <strong>
                          Unlink
                        </strong>

                        {' '}

                        first.

                        {' '}

                        Unlinking removes only the BG ↔ FD relationship; the Fixed Deposit itself remains safe.

                      </p>

                    </div>


                    <div className="mt-4 flex justify-end">

                      <div className="rounded-lg bg-ink-50 px-4 py-3">

                        <p className="text-xs uppercase tracking-wide text-muted">
                          Total FD Margin Linked
                        </p>

                        <p className="mt-1 num text-lg font-semibold text-ink-900">
                          {
                            formatCurrency(
                              totalLinkedAmount
                            )
                          }
                        </p>

                      </div>

                    </div>

                  </>
                )
        }

      </Card>


      {/* ======================================================
          AMENDMENTS
      ====================================================== */}

      <Card className="mt-6">

        <div className="flex items-center justify-between gap-4">

          <h2 className="font-display text-xl font-semibold text-ink-900">
            Amendments
          </h2>


          <Button
            type="button"
            variant="accent"
          >

            <Plus
              size={16}
            />

            Add Amendment

          </Button>

        </div>


        <div className="mt-5 border-l border-border pl-5">

          <p className="font-medium text-ink-900">
            Original BG
          </p>


          <p className="mt-1 text-sm text-muted">

            Amount:{' '}

            {
              formatCurrency(
                bg.bgAmount
              )
            }

            {' · '}

            Expiry:{' '}

            {
              formatDate(
                bg.expiryDate
              )
            }

          </p>


          {
            !bg.amendments ||
            bg.amendments.length ===
            0

              ? (

                  <p className="mt-5 text-sm text-muted">
                    No amendments recorded yet.
                  </p>

                )

              : (

                  <div className="mt-5 space-y-4">

                    {
                      bg.amendments.map(
                        (
                          amendment
                        ) => (

                          <div

                            key={
                              amendment.id
                            }

                            className="rounded-lg border border-border p-3"
                          >

                            <p className="text-sm font-medium text-ink-900">
                              Amendment
                            </p>


                            <p className="mt-1 text-xs text-muted">

                              {
                                amendment.remarks ||
                                '—'
                              }

                            </p>

                          </div>
                        )
                      )
                    }

                  </div>
                )
          }

        </div>

      </Card>


      {/* ======================================================
          DOCUMENTS
      ====================================================== */}

      <Card className="mt-6">

        <div className="flex items-center gap-2">

          <FileText
            size={20}
            className="text-muted"
          />

          <h2 className="font-display text-xl font-semibold text-ink-900">
            Documents
          </h2>

        </div>


        {/* =====================================================
            UPLOAD FORM
        ===================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">

          <Select

            label="Document Type"

            value={
              uploadForm.documentType
            }

            onChange={
              (
                event
              ) =>

                setUploadForm(
                  (
                    current
                  ) => ({

                    ...current,

                    documentType:
                      event.target.value,
                  })
                )
            }
          >

            {
              DOCUMENT_TYPES.map(
                (
                  type
                ) => (

                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >

                    {type}

                  </option>
                )
              )
            }

          </Select>


          <Input

            label="Remarks"

            value={
              uploadForm.remarks
            }

            onChange={
              (
                event
              ) =>

                setUploadForm(
                  (
                    current
                  ) => ({

                    ...current,

                    remarks:
                      event.target.value,
                  })
                )
            }
          />


          <div>

            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              File
            </label>


            <input

              id="bg-document-file"

              type="file"

              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"

              onChange={
                (
                  event
                ) =>

                  setUploadForm(
                    (
                      current
                    ) => ({

                      ...current,

                      file:
                        event.target.files
                          ?.[0] ||
                        null,
                    })
                  )
              }

              className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-900"
            />


            <p className="mt-1 text-[11px] text-muted">
              PDF, JPG, PNG, DOC, DOCX, XLS, XLSX · Max 10 MB
            </p>

          </div>


          <div className="flex items-end">

            <Button

              type="button"

              variant="accent"

              className="w-full"

              disabled={
                uploading ||
                !uploadForm.file
              }

              onClick={
                handleUpload
              }
            >

              <Upload
                size={16}
              />

              {
                uploading
                  ? 'Uploading…'
                  : 'Upload'
              }

            </Button>

          </div>

        </div>


        {/* =====================================================
            DOCUMENT LIST
        ===================================================== */}

        {
          documentsLoading

            ? (

                <div className="mt-6">

                  <Loader />

                </div>

              )

            : documents.length ===
              0

              ? (

                  <div className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center">

                    <p className="text-sm text-muted">
                      No documents uploaded yet.
                    </p>

                  </div>

                )

              : (

                  <div className="mt-6 overflow-x-auto">

                    <table className="min-w-full text-sm">

                      <thead>

                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

                          <th className="py-3 pr-4">
                            File
                          </th>

                          <th className="py-3 pr-4">
                            Document Type
                          </th>

                          <th className="py-3 pr-4">
                            Remarks
                          </th>

                          <th className="py-3 pr-4">
                            Uploaded By
                          </th>

                          <th className="py-3 pr-4">
                            Uploaded At
                          </th>

                          <th className="py-3 text-right">
                            Actions
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          documents.map(
                            (
                              doc
                            ) => (

                              <tr

                                key={
                                  doc.id
                                }

                                className="border-b border-border/70"
                              >

                                <td className="py-3 pr-4">

                                  <div>

                                    <p className="font-medium text-ink-900">

                                      {
                                        doc.fileName
                                      }

                                    </p>


                                    <p className="mt-1 text-xs text-muted">

                                      {
                                        formatFileSize(
                                          doc.fileSize
                                        )
                                      }


                                      {
                                        doc.fileType
                                          ? ` · ${doc.fileType}`
                                          : ''
                                      }

                                    </p>

                                  </div>

                                </td>


                                <td className="py-3 pr-4">

                                  {
                                    doc.documentType ||
                                    '—'
                                  }

                                </td>


                                <td className="py-3 pr-4">

                                  {
                                    doc.remarks ||
                                    '—'
                                  }

                                </td>


                                <td className="py-3 pr-4">

                                  {
                                    doc.uploadedBy ||
                                    '—'
                                  }

                                </td>


                                <td className="py-3 pr-4">

                                  {
                                    formatDateTime(
                                      doc.uploadedAt
                                    )
                                  }

                                </td>


                                <td className="py-3">

                                  <div className="flex justify-end gap-1">

                                    {/* VIEW */}

                                    <button

                                      type="button"

                                      onClick={
                                        () =>
                                          handleView(
                                            doc
                                          )
                                      }

                                      className="rounded-lg p-2 text-muted transition hover:bg-ink-50 hover:text-ink-900"

                                      title="View document"
                                    >

                                      <Eye
                                        size={16}
                                      />

                                    </button>


                                    {/* DOWNLOAD */}

                                    <button

                                      type="button"

                                      onClick={
                                        () =>
                                          handleDownload(
                                            doc
                                          )
                                      }

                                      className="rounded-lg p-2 text-muted transition hover:bg-ink-50 hover:text-ink-900"

                                      title="Download document"
                                    >

                                      <Download
                                        size={16}
                                      />

                                    </button>


                                    {/* DELETE */}

                                    <button

                                      type="button"

                                      disabled={
                                        deletingDocumentId ===
                                        doc.id
                                      }

                                      onClick={
                                        () =>
                                          handleDeleteDocument(
                                            doc
                                          )
                                      }

                                      className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"

                                      title="Delete document"
                                    >

                                      <Trash2
                                        size={16}
                                      />

                                    </button>

                                  </div>

                                </td>

                              </tr>
                            )
                          )
                        }

                      </tbody>

                    </table>

                  </div>
                )
        }

      </Card>


      {/* ======================================================
          ACTIVITY HISTORY
      ====================================================== */}

      <Card className="mt-6">

        <div className="flex items-center gap-2">

          <History
            size={19}
            className="text-muted"
          />

          <h2 className="font-display text-xl font-semibold text-ink-900">
            Activity History
          </h2>

        </div>


        {
          !bg.activityHistory ||
          bg.activityHistory.length ===
          0

            ? (

                <p className="mt-5 text-sm text-muted">
                  No activity recorded yet.
                </p>

              )

            : (

                <div className="mt-5 divide-y divide-border">

                  {
                    bg.activityHistory.map(
                      (
                        activity,
                        index
                      ) => (

                        <div

                          key={
                            activity.id ||
                            index
                          }

                          className="flex items-start justify-between gap-4 py-4"
                        >

                          <div>

                            <p className="text-sm font-medium text-ink-900">

                              {
                                activity.action ||
                                activity.title ||
                                'Updated'
                              }

                            </p>


                            <p className="mt-1 text-xs text-muted">

                              {
                                activity.description ||
                                activity.message ||
                                '—'
                              }

                            </p>

                          </div>


                          <div className="text-right text-xs text-muted">

                            <p>

                              {
                                activity.username ||
                                activity.performedBy ||
                                '—'
                              }

                            </p>


                            <p className="mt-1">

                              {
                                formatDateTime(
                                  activity.createdAt ||
                                  activity.timestamp
                                )
                              }

                            </p>

                          </div>

                        </div>
                      )
                    )
                  }

                </div>
              )
        }

      </Card>

    </div>
  )
}


// =========================================================
// LINK RESPONSE HELPERS
//
// Backend DTO field name thoda alag hua to bhi UI chale.
// =========================================================

function getFdNumber(
  link
) {

  return (
    link.fdNumber ??
    link.fixedDepositNumber ??
    link.fixedDeposit?.fdNumber ??
    link.fd?.fdNumber ??
    '—'
  )
}


function getFdBankName(
  link
) {

  return (
    link.bankName ??
    link.fdBankName ??
    link.fixedDeposit?.bankName ??
    link.fixedDeposit?.bank?.bankName ??
    link.fd?.bankName ??
    '—'
  )
}


function getFdAmount(
  link
) {

  return safeNumber(

    link.fdAmount ??
    link.fixedDepositAmount ??
    link.fixedDeposit?.fdAmount ??
    link.fd?.fdAmount
  )
}


function getLinkedAmount(
  link
) {

  return safeNumber(
    link.linkedAmount ??
    link.amount
  )
}


function getFdMaturityDate(
  link
) {

  return (
    link.fdMaturityDate ??
    link.maturityDate ??
    link.fixedDeposit?.fdMaturityDate ??
    link.fd?.fdMaturityDate ??
    null
  )
}


// =========================================================
// SUMMARY
// =========================================================

function Summary({
  label,
  value,
  highlight = false,
}) {

  return (

    <Card>

      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>


      <p
        className={`mt-2 text-lg font-semibold ${
          highlight
            ? 'text-bg-700'
            : 'text-ink-900'
        }`}
      >

        {value}

      </p>

    </Card>
  )
}


// =========================================================
// INFO
// =========================================================

function Info({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>


      <p className="mt-1 text-sm font-medium text-ink-900">
        {value}
      </p>

    </div>
  )
}


// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(
  bytes
) {

  if (
    bytes === null ||
    bytes === undefined
  ) {

    return '—'
  }


  const size =
    Number(
      bytes
    )


  if (
    !Number.isFinite(
      size
    )
  ) {

    return '—'
  }


  if (
    size < 1024
  ) {

    return `${size} B`
  }


  if (
    size <
    1024 * 1024
  ) {

    return `${(
      size /
      1024
    ).toFixed(1)} KB`
  }


  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(1)} MB`
}


// =========================================================
// DATE TIME
// =========================================================

function formatDateTime(
  value
) {

  if (
    !value
  ) {

    return '—'
  }


  const date =
    new Date(
      value
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value
  }


  return date.toLocaleString(
    'en-IN',
    {

      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  )
}