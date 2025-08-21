"use client";

import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  XMarkIcon,
  CreditCardIcon,
  UserIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { paymentService, PaymentDetails } from "@/services/PaymentService";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onPaymentUpdate?: (paymentId: string, updates: any) => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentId,
  onPaymentUpdate,
}: PaymentDetailsModalProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "audit" | "refund">(
    "overview"
  );
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Payment status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "yellow", icon: ClockIcon },
    {
      value: "processing",
      label: "Processing",
      color: "blue",
      icon: ArrowPathIcon,
    },
    {
      value: "completed",
      label: "Completed",
      color: "green",
      icon: CheckCircleIcon,
    },
    { value: "failed", label: "Failed", color: "red", icon: XCircleIcon },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "gray",
      icon: XCircleIcon,
    },
    {
      value: "refunded",
      label: "Refunded",
      color: "orange",
      icon: ArrowPathIcon,
    },
  ];

  // Payment type configuration
  const typeConfig = {
    ENTRY_FEE: { label: "Entry Fee", color: "blue", icon: TrophyIcon },
    PRIZE_PAYOUT: {
      label: "Prize Payout",
      color: "green",
      icon: BanknotesIcon,
    },
    REFUND: { label: "Refund", color: "yellow", icon: ArrowPathIcon },
    WITHDRAWAL: { label: "Withdrawal", color: "purple", icon: BanknotesIcon },
    PLATFORM_FEE: {
      label: "Platform Fee",
      color: "gray",
      icon: CreditCardIcon,
    },
  };

  // Load payment details
  useEffect(() => {
    if (isOpen && paymentId) {
      loadPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const loadPaymentDetails = async () => {
    setLoading(true);
    try {
      const paymentDetails = await paymentService.getPaymentDetails(paymentId);
      setPayment(paymentDetails);
    } catch (error) {
      console.error("Failed to load payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    // Map API status to UI status
    const statusMap: Record<string, string> = {
      COMPLETED: "completed",
      PENDING: "pending",
      PROCESSING: "processing",
      FAILED: "failed",
      CANCELLED: "cancelled",
      REFUNDED: "refunded",
    };
    const mappedStatus = statusMap[status] || status;
    return (
      statusOptions.find((s) => s.value === mappedStatus) || statusOptions[0]
    );
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!payment || !newStatus) return;

    try {
      await paymentService.updatePaymentStatus({
        paymentId: payment.id,
        status: newStatus as any,
        reason: statusReason,
      });

      setPayment((prev) => (prev ? { ...prev, status: newStatus } : null));
      setShowStatusUpdate(false);
      setNewStatus("");
      setStatusReason("");

      if (onPaymentUpdate) {
        onPaymentUpdate(payment.id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  // Handle refund processing
  const handleRefund = async () => {
    if (!payment) return;

    try {
      await paymentService.processRefund({
        paymentId: payment.id,
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason,
      });

      // Reload payment details to show updated status
      await loadPaymentDetails();
      setShowRefundForm(false);
      setRefundAmount("");
      setRefundReason("");
    } catch (error) {
      console.error("Failed to process refund:", error);
    }
  };

  const statusConfig = payment ? getStatusConfig(payment.status) : null;
  const currentTypeConfig = payment
    ? typeConfig[payment.type as keyof typeof typeConfig]
    : null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium text-gray-900"
                    >
                      Payment Details
                    </Dialog.Title>
                    {payment && (
                      <p className="mt-1 text-sm text-gray-500">
                        Payment ID: {payment.id}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading payment details...
                    </p>
                  </div>
                ) : payment ? (
                  <div className="p-6">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            ${payment.amount.toFixed(2)} {payment.currency}
                          </div>
                          <div className="text-sm text-gray-500">Amount</div>
                        </div>
                        <div className="text-center">
                          {statusConfig && (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
                            >
                              <statusConfig.icon className="h-4 w-4 mr-1" />
                              {statusConfig.label}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            Status
                          </div>
                        </div>
                        <div className="text-center">
                          {currentTypeConfig && (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${currentTypeConfig.color}-100 text-${currentTypeConfig.color}-800`}
                            >
                              <currentTypeConfig.icon className="h-4 w-4 mr-1" />
                              {currentTypeConfig.label}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">Type</div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="-mb-px flex space-x-8">
                        {[
                          { id: "overview", label: "Overview", icon: EyeIcon },
                          {
                            id: "audit",
                            label: "Audit Trail",
                            icon: DocumentTextIcon,
                          },
                          {
                            id: "refund",
                            label: "Refund",
                            icon: ArrowPathIcon,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Payment Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Payment Information
                            </h4>
                            <dl className="space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Payment Method:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.paymentMethodCode || "Unknown"}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Transaction ID:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.pesePayTransactionId || "N/A"}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Created:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {new Date(payment.createdAt).toLocaleString()}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Updated:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {new Date(payment.updatedAt).toLocaleString()}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          {/* User Information */}
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              User Information
                            </h4>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {payment.user.firstName.charAt(0)}
                                  {payment.user.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.user.firstName}
                                  {payment.user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  @{payment.user.username}
                                </p>
                              </div>
                            </div>
                            <dl className="space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Email:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.user.email}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  User ID:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.user.id}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        {/* Tournament Information */}
                        {payment.tournament && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Tournament Information
                            </h4>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Tournament:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.tournament.title}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Game Type:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 capitalize">
                                  {payment.tournament.game.name}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Tournament ID:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.tournament.id}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        )}

                        {/* PesePay Integration */}
                        {payment.pesepayData && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              PesePay Integration
                            </h4>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Reference:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.pesepayData.reference}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">
                                  Method Code:
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {payment.pesepayData.paymentMethodCode}
                                </dd>
                              </div>
                              {payment.pesepayData.mobileMoneyNumber && (
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">
                                    Mobile Number:
                                  </dt>
                                  <dd className="text-sm font-medium text-gray-900">
                                    {payment.pesepayData.mobileMoneyNumber}
                                  </dd>
                                </div>
                              )}
                              {payment.pesepayData.failureReason && (
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">
                                    Failure Reason:
                                  </dt>
                                  <dd className="text-sm font-medium text-red-600">
                                    {payment.pesepayData.failureReason}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setShowStatusUpdate(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Update Status
                          </button>

                          {(payment.status === "completed" ||
                            payment.status === "COMPLETED") &&
                            payment.type === "ENTRY_FEE" && (
                              <button
                                onClick={() => setShowRefundForm(true)}
                                className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100"
                              >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                Process Refund
                              </button>
                            )}
                        </div>
                      </div>
                    )}

                    {activeTab === "audit" && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Audit Trail
                        </h4>
                        <div className="flow-root">
                          <ul className="-mb-8">
                            {payment.auditTrail.map((entry, entryIdx) => (
                              <li key={entry.id}>
                                <div className="relative pb-8">
                                  {entryIdx !==
                                  payment.auditTrail.length - 1 ? (
                                    <span
                                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                  <div className="relative flex space-x-3">
                                    <div>
                                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                        <ClockIcon
                                          className="h-5 w-5 text-white"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          {entry.action}
                                          {entry.previousStatus && (
                                            <span className="font-medium">
                                              from {entry.previousStatus} to
                                              {entry.newStatus}
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          by {entry.performedBy}
                                        </p>
                                        {entry.reason && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            {entry.reason}
                                          </p>
                                        )}
                                      </div>
                                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        {new Date(
                                          entry.createdAt
                                        ).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === "refund" && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Refund History
                        </h4>
                        {payment.refundHistory &&
                        payment.refundHistory.length > 0 ? (
                          <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                              {payment.refundHistory.map((refund) => (
                                <li key={refund.id} className="px-4 py-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        ${refund.amount.toFixed(2)} refund
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {refund.reason}
                                      </p>
                                    </div>
                                    <div className="flex items-center">
                                      <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          refund.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : refund.status === "failed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {refund.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500">
                                    Processed by {refund.processedBy} on
                                    {new Date(
                                      refund.createdAt
                                    ).toLocaleString()}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              No refunds processed for this payment
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Update Modal */}
                    {showStatusUpdate && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Update Payment Status
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                New Status
                              </label>
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select status...</option>
                                {statusOptions.map((status) => (
                                  <option
                                    key={status.value}
                                    value={status.value}
                                  >
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Reason (optional)
                              </label>
                              <textarea
                                value={statusReason}
                                onChange={(e) =>
                                  setStatusReason(e.target.value)
                                }
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Reason for status change..."
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={() => setShowStatusUpdate(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleStatusUpdate}
                              disabled={!newStatus}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Refund Form Modal */}
                    {showRefundForm && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Process Refund
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Refund Amount
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">
                                    $
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={refundAmount}
                                  onChange={(e) =>
                                    setRefundAmount(e.target.value)
                                  }
                                  placeholder={payment.amount.toFixed(2)}
                                  max={payment.amount}
                                  step="0.01"
                                  className="block w-full pl-7 pr-12 border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">
                                    {payment.currency}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Leave empty for full refund of $
                                {payment.amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Refund Reason
                              </label>
                              <textarea
                                value={refundReason}
                                onChange={(e) =>
                                  setRefundReason(e.target.value)
                                }
                                rows={3}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Reason for refund..."
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={() => setShowRefundForm(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleRefund}
                              disabled={!refundReason}
                              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                              Process Refund
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">Payment not found</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
