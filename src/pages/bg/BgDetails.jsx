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
  History,
  Landmark,
  Link2,
  Plus,
  Trash2,
  Unlink,
  Upload,
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
import ConfirmDialog from '../../components/common/ConfirmDialog'

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

  const number =
    Number(value)

  return Number.isFinite(number)
    ? number
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
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)


  // =========================================================
  // LINKED FIXED DEPOSITS
  // =========================================================

  const [
    linkedFds,
    setLinkedFds,
  ] = useState([])

  const [
    linksLoading,
    setLinksLoading,
  ] = useState(false)

  const [
    unlinkTarget,
    setUnlinkTarget,
  ] = useState(null)

  const [
    unlinkingId,
    setUnlinkingId,
  ] = useState(null)


  // =========================================================
  // DOCUMENTS
  // =========================================================

  const [
    documents,
    setDocuments,
  ] = useState([])

  const [
    documentsLoading,
    setDocumentsLoading,
  ] = useState(false)

  const [
    uploading,
    setUploading,
  ] = useState(false)

  const [
    deletingDocumentId,
    setDeletingDocumentId,
  ] = useState(null)

  const [
    uploadForm,
    setUploadForm,
  ] = useState({

    documentType:
      'Original BG',

    remarks:
      '',

    file:
      null,
  })


  // =========================================================
  // LOAD BG
  // =========================================================

  const loadBg =
    async () => {

      setLinksLoading(
        true
      )

      try {

        const data =
          await bgApi.getById(
            id
          )

        setBg(
          data
        )

        setLinkedFds(
          Array.isArray(
            data?.linkedFds
          )
            ? data.linkedFds
            : []
        )

      } catch (error) {

        console.error(
          'BG load error:',
          error
        )

        setBg(
          null
        )

        setLinkedFds(
          []
        )

        push(
          extractErrorMessage(
            error,
            'Could not load Bank Guarantee.'
          ),
          'error'
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
          'BG document load error:',
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

      const init =
        async () => {

          setLoading(
            true
          )

          try {

            await Promise.all([
              loadBg(),
              loadDocuments(),
            ])

          } finally {

            setLoading(
              false
            )
          }
        }

      init()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [id]
  )


  // =========================================================
  // FD TOTAL
  // =========================================================

  const totalLinkedAmount =
    useMemo(
      () => {

        return linkedFds.reduce(
          (
            total,
            item
          ) => {

            return (
              total +
              safeNumber(
                item.linkedAmount
              )
            )
          },
          0
        )
      },
      [
        linkedFds,
      ]
    )


  // =========================================================
  // UNLINK FD
  // =========================================================

  const handleConfirmUnlink =
    async () => {

      if (
        !unlinkTarget
      ) {
        return
      }


      const linkId =
        unlinkTarget.linkId ??
        unlinkTarget.id


      if (
        !linkId
      ) {

        push(
          'FD link ID is missing.',
          'error'
        )

        return
      }


      setUnlinkingId(
        linkId
      )


      try {

        await fdLinkApi.remove(
          linkId
        )

        push(
          `${
            getFdNumber(
              unlinkTarget
            )
          } unlinked successfully.`
        )

        setUnlinkTarget(
          null
        )

        await loadBg()

      } catch (error) {

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
  // DOCUMENT UPLOAD
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


        const input =
          document.getElementById(
            'bg-document-file'
          )

        if (
          input
        ) {

          input.value =
            ''
        }


        await loadDocuments()

      } catch (error) {

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

        /*
         * download() returns blob in the API version
         * we were using earlier.
         */
        const blob =
          await documentApi.download(
            doc.id
          )


        const fileBlob =
          blob instanceof Blob
            ? blob
            : new Blob(
                [blob],
                {
                  type:
                    doc.fileType ||
                    'application/octet-stream',
                }
              )


        const url =
          window.URL.createObjectURL(
            fileBlob
          )


        window.open(
          url,
          '_blank',
          'noopener,noreferrer'
        )


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
            'Could not view document.'
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

        const blob =
          await documentApi.download(
            doc.id
          )


        const fileBlob =
          blob instanceof Blob
            ? blob
            : new Blob(
                [blob],
                {
                  type:
                    doc.fileType ||
                    'application/octet-stream',
                }
              )


        const url =
          window.URL.createObjectURL(
            fileBlob
          )


        const anchor =
          document.createElement(
            'a'
          )


        anchor.href =
          url

        anchor.download =
          doc.fileName ||
          'document'


        document.body.appendChild(
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
          `${
            bg.groupCompanyName ||
            'Unassigned'
          } · ${
            bg.issuingBankName ||
            '—'
          }`
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

        <SummaryCard

          label="BG Amount"

          value={
            formatCurrency(
              bg.bgAmount
            )
          }
        />


        <SummaryCard

          label="Client"

          value={
            bg.clientName ||
            '—'
          }
        />


        <SummaryCard

          label="Expiry"

          value={
            formatDate(
              bg.expiryDate
            )
          }
        />


        <SummaryCard

          label="FD Margin Linked"

          value={
            formatCurrency(
              totalLinkedAmount
            )
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
          BANK GUARANTEE DETAILS
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
              '—'
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

            : linkedFds.length === 0

              ? (

                  <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-12 text-center">

                    <Link2
                      size={28}
                      className="mx-auto text-muted"
                    />

                    <p className="mt-3 font-medium text-ink-900">
                      No Fixed Deposit linked
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      This Bank Guarantee currently has no Fixed Deposit pledged against it.
                    </p>

                  </div>

                )

              : (

                  <>

                    <div className="mt-6 overflow-x-auto">

                      <table className="w-full min-w-[1100px] text-sm">

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
                              Available
                            </th>

                            <th className="py-3 pr-5">
                              Maturity
                            </th>

                            <th className="py-3 pr-5">
                              Linked Date
                            </th>

                            <th className="py-3 pr-5">
                              Status
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

                                const linkId =
                                  link.linkId ??
                                  link.id

                                return (

                                  <tr
                                    key={
                                      linkId
                                    }
                                    className="border-b border-border/70"
                                  >

                                    <td className="py-4 pr-5 font-mono font-semibold text-ink-900">

                                      {
                                        getFdNumber(
                                          link
                                        )
                                      }

                                    </td>


                                    <td className="py-4 pr-5">

                                      {
                                        getFdBankName(
                                          link
                                        )
                                      }

                                    </td>


                                    <td className="py-4 pr-5 num">

                                      {
                                        formatCurrency(
                                          getFdAmount(
                                            link
                                          )
                                        )
                                      }

                                    </td>


                                    <td className="py-4 pr-5 num font-semibold">

                                      {
                                        formatCurrency(
                                          getLinkedAmount(
                                            link
                                          )
                                        )
                                      }

                                    </td>


                                    <td className="py-4 pr-5 num">

                                      {
                                        formatCurrency(
                                          getAvailableAmount(
                                            link
                                          )
                                        )
                                      }

                                    </td>


                                    <td className="py-4 pr-5">

                                      {
                                        getFdMaturityDate(
                                          link
                                        )
                                          ? formatDate(
                                              getFdMaturityDate(
                                                link
                                              )
                                            )
                                          : '—'
                                      }

                                    </td>


                                    <td className="py-4 pr-5">

                                      {
                                        link.linkedDate
                                          ? formatDate(
                                              link.linkedDate
                                            )
                                          : '—'
                                      }

                                    </td>


                                    <td className="py-4 pr-5">

                                      {
                                        link.status
                                          ? (
                                              <StatusBadge
                                                status={
                                                  link.status
                                                }
                                              />
                                            )
                                          : '—'
                                      }

                                    </td>


                                    <td className="py-4 text-right">

                                      <button

                                        type="button"

                                        disabled={
                                          unlinkingId ===
                                          linkId
                                        }

                                        onClick={
                                          () =>
                                            setUnlinkTarget(
                                              link
                                            )
                                        }

                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                      >

                                        <Unlink
                                          size={15}
                                        />

                                        Unlink

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

                        This Bank Guarantee cannot be deleted while any Fixed Deposit is linked to it. Use <strong>Unlink</strong> first.

                      </p>

                    </div>


                    <div className="mt-4 flex justify-end">

                      <div className="rounded-xl bg-ink-50 px-5 py-4">

                        <p className="text-xs uppercase tracking-wide text-muted">
                          Total FD Margin Linked
                        </p>

                        <p className="mt-1 num text-xl font-semibold text-ink-900">

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

            {' · Expiry: '}

            {
              formatDate(
                bg.expiryDate
              )
            }

          </p>


          {
            Array.isArray(
              bg.amendments
            ) &&
            bg.amendments.length > 0

              ? (

                  <div className="mt-5 space-y-3">

                    {
                      bg.amendments.map(
                        (
                          amendment
                        ) => (

                          <div
                            key={
                              amendment.id
                            }
                            className="rounded-lg border border-border p-4"
                          >

                            <p className="font-medium text-ink-900">

                              {
                                amendment.amendmentNumber
                                  ? `Amendment ${amendment.amendmentNumber}`
                                  : 'Amendment'
                              }

                            </p>


                            <p className="mt-1 text-sm text-muted">

                              {
                                amendment.reason ||
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

              : (

                  <p className="mt-5 text-sm text-muted">
                    No amendments recorded yet.
                  </p>
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

              className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"

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
                        event.target.files?.[0] ??
                        null,
                    })
                  )
              }
            />

          </div>


          <div className="flex items-end">

            <Button

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


        {
          documentsLoading

            ? (

                <div className="mt-6">
                  <Loader />
                </div>

              )

            : documents.length === 0

              ? (

                  <p className="mt-6 text-sm text-muted">
                    No documents uploaded yet.
                  </p>

                )

              : (

                  <div className="mt-6 overflow-x-auto">

                    <table className="w-full min-w-[900px] text-sm">

                      <thead>

                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

                          <th className="py-3 pr-4">
                            File
                          </th>

                          <th className="py-3 pr-4">
                            Type
                          </th>

                          <th className="py-3 pr-4">
                            Remarks
                          </th>

                          <th className="py-3 pr-4">
                            Uploaded By
                          </th>

                          <th className="py-3 pr-4">
                            Date
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

                                <td className="py-4 pr-4 font-medium">
                                  {doc.fileName}
                                </td>


                                <td className="py-4 pr-4">
                                  {doc.documentType || '—'}
                                </td>


                                <td className="py-4 pr-4">
                                  {doc.remarks || '—'}
                                </td>


                                <td className="py-4 pr-4">
                                  {doc.uploadedBy || '—'}
                                </td>


                                <td className="py-4 pr-4">
                                  {formatDateTime(doc.uploadedAt)}
                                </td>


                                <td className="py-4">

                                  <div className="flex justify-end gap-1">

                                    <button

                                      type="button"

                                      onClick={
                                        () =>
                                          handleView(
                                            doc
                                          )
                                      }

                                      className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900"
                                    >

                                      <Eye size={16} />

                                    </button>


                                    <button

                                      type="button"

                                      onClick={
                                        () =>
                                          handleDownload(
                                            doc
                                          )
                                      }

                                      className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900"
                                    >

                                      <Download size={16} />

                                    </button>


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

                                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                                    >

                                      <Trash2 size={16} />

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
          ACTIVITY
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


        <p className="mt-5 text-sm text-muted">
          Bank Guarantee activity and audit changes are recorded in the Audit Log.
        </p>

      </Card>


      {/* ======================================================
          UNLINK CONFIRM
      ====================================================== */}

      <ConfirmDialog

        open={
          Boolean(
            unlinkTarget
          )
        }

        title="Are you sure?"

        message={
          unlinkTarget
            ? `This will unlink Fixed Deposit ${
                getFdNumber(
                  unlinkTarget
                )
              } from this Bank Guarantee. ${
                formatCurrency(
                  getLinkedAmount(
                    unlinkTarget
                  )
                )
              } will be released. The Fixed Deposit itself will not be deleted.`
            : ''
        }

        confirmText="Unlink"

        loadingText="Unlinking…"

        loading={
          Boolean(
            unlinkingId
          )
        }

        onCancel={
          () => {

            if (
              !unlinkingId
            ) {

              setUnlinkTarget(
                null
              )
            }
          }
        }

        onConfirm={
          handleConfirmUnlink
        }
      />

    </div>
  )
}


// =========================================================
// FD HELPERS
// =========================================================

function getFdNumber(
  link
) {

  return (
    link?.fdNo ??
    link?.fdNumber ??
    link?.fixedDepositNumber ??
    link?.fixedDeposit?.fdNumber ??
    '—'
  )
}


function getFdBankName(
  link
) {

  return (
    link?.bankName ??
    link?.fdBankName ??
    link?.fixedDeposit?.bankName ??
    link?.fixedDeposit?.bank?.bankName ??
    '—'
  )
}


function getFdAmount(
  link
) {

  return safeNumber(
    link?.fdAmount ??
    link?.fixedDepositAmount ??
    link?.fixedDeposit?.fdAmount
  )
}


function getLinkedAmount(
  link
) {

  return safeNumber(
    link?.linkedAmount ??
    link?.amount
  )
}


function getAvailableAmount(
  link
) {

  return safeNumber(
    link?.availableAmount ??
    link?.fdAvailableAmount
  )
}


function getFdMaturityDate(
  link
) {

  return (
    link?.maturityDate ??
    link?.fdMaturityDate ??
    link?.fixedDeposit?.fdMaturityDate ??
    null
  )
}


// =========================================================
// SUMMARY
// =========================================================

function SummaryCard({
  label,
  value,
}) {

  return (

    <Card>

      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-ink-900">
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
// DATETIME
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