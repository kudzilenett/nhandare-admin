"use client";

import React, { useState, useEffect } from "react";
import {
  CogIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  ServerIcon,
  BellIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Mock data - replace with real API calls
const initialSettings = {
  platform: {
    name: "Nhandare Gaming Platform",
    description: "Zimbabwe's premier gaming platform",
    version: "1.0.0",
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsersPerTournament: 64,
    defaultTournamentDuration: 7,
  },
  security: {
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    twoFactorEnabled: false,
    passwordMinLength: 8,
  },
  payments: {
    currency: "USD",
    paymentMethods: ["pesepay", "ecocash", "onemoney"],
    transactionFee: 2.5,
    minimumWithdrawal: 10,
    maximumWithdrawal: 1000,
    autoApproveWithdrawals: false,
  },
  features: {
    tournaments: true,
    leaderboards: true,
    chat: true,
    notifications: true,
    analytics: true,
    moderation: true,
  },
  integrations: {
    pesepayEnabled: true,
    ecocashEnabled: true,
    onemoneyEnabled: true,
    emailService: "sendgrid",
    smsService: "twilio",
  },
};

const tabs = [
  { id: "platform", name: "Platform", icon: CogIcon },
  { id: "security", name: "Security", icon: ShieldCheckIcon },
  { id: "payments", name: "Payments", icon: CurrencyDollarIcon },
  { id: "features", name: "Features", icon: ChartBarIcon },
  { id: "integrations", name: "Integrations", icon: KeyIcon },
  { id: "system", name: "System", icon: ServerIcon },
];

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState("platform");
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check for changes
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
  }, [settings]);

  const handleSettingChange = (
    section: string,
    key: string,
    value: string | number | boolean | string[]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call the API
      console.log("Saving settings:", settings);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
  };

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platform.name}
            onChange={(e) =>
              handleSettingChange("platform", "name", e.target.value)
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="text"
            value={settings.platform.version}
            onChange={(e) =>
              handleSettingChange("platform", "version", e.target.value)
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={settings.platform.description}
          onChange={(e) =>
            handleSettingChange("platform", "description", e.target.value)
          }
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Users Per Tournament
          </label>
          <input
            type="number"
            value={settings.platform.maxUsersPerTournament}
            onChange={(e) =>
              handleSettingChange(
                "platform",
                "maxUsersPerTournament",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Default Tournament Duration (days)
          </label>
          <input
            type="number"
            value={settings.platform.defaultTournamentDuration}
            onChange={(e) =>
              handleSettingChange(
                "platform",
                "defaultTournamentDuration",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Maintenance Mode
            </h4>
            <p className="text-sm text-gray-500">
              Temporarily disable the platform for maintenance
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.platform.maintenanceMode}
            onChange={(e) =>
              handleSettingChange(
                "platform",
                "maintenanceMode",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Registration Enabled
            </h4>
            <p className="text-sm text-gray-500">Allow new users to register</p>
          </div>
          <input
            type="checkbox"
            checked={settings.platform.registrationEnabled}
            onChange={(e) =>
              handleSettingChange(
                "platform",
                "registrationEnabled",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Session Timeout (hours)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "sessionTimeout",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "maxLoginAttempts",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password Minimum Length
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "passwordMinLength",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Require Email Verification
            </h4>
            <p className="text-sm text-gray-500">
              Users must verify their email address
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.requireEmailVerification}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "requireEmailVerification",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Require Phone Verification
            </h4>
            <p className="text-sm text-gray-500">
              Users must verify their phone number
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.requirePhoneVerification}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "requirePhoneVerification",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-500">
              Enable 2FA for enhanced security
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.twoFactorEnabled}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "twoFactorEnabled",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            value={settings.payments.currency}
            onChange={(e) =>
              handleSettingChange("payments", "currency", e.target.value)
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="ZWL">ZWL</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Transaction Fee (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={settings.payments.transactionFee}
            onChange={(e) =>
              handleSettingChange(
                "payments",
                "transactionFee",
                parseFloat(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Withdrawal
          </label>
          <input
            type="number"
            value={settings.payments.minimumWithdrawal}
            onChange={(e) =>
              handleSettingChange(
                "payments",
                "minimumWithdrawal",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Withdrawal
          </label>
          <input
            type="number"
            value={settings.payments.maximumWithdrawal}
            onChange={(e) =>
              handleSettingChange(
                "payments",
                "maximumWithdrawal",
                parseInt(e.target.value)
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Auto-Approve Withdrawals
            </h4>
            <p className="text-sm text-gray-500">
              Automatically approve withdrawal requests
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.payments.autoApproveWithdrawals}
            onChange={(e) =>
              handleSettingChange(
                "payments",
                "autoApproveWithdrawals",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Methods
        </label>
        <div className="space-y-2">
          {["pesepay", "ecocash", "onemoney"].map((method) => (
            <div key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.payments.paymentMethods.includes(method)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...settings.payments.paymentMethods, method]
                    : settings.payments.paymentMethods.filter(
                        (m) => m !== method
                      );
                  handleSettingChange("payments", "paymentMethods", methods);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700 capitalize">
                {method}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.features).map(([feature, enabled]) => (
          <div key={feature} className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 capitalize">
                {feature.replace(/([A-Z])/g, " $1")}
              </h4>
              <p className="text-sm text-gray-500">
                Enable {feature} functionality
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) =>
                handleSettingChange("features", feature, e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Pesepay Integration
            </h4>
            <p className="text-sm text-gray-500">
              Enable Pesepay payment processing
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.integrations.pesepayEnabled}
            onChange={(e) =>
              handleSettingChange(
                "integrations",
                "pesepayEnabled",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              EcoCash Integration
            </h4>
            <p className="text-sm text-gray-500">
              Enable EcoCash payment processing
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.integrations.ecocashEnabled}
            onChange={(e) =>
              handleSettingChange(
                "integrations",
                "ecocashEnabled",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              OneMoney Integration
            </h4>
            <p className="text-sm text-gray-500">
              Enable OneMoney payment processing
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.integrations.onemoneyEnabled}
            onChange={(e) =>
              handleSettingChange(
                "integrations",
                "onemoneyEnabled",
                e.target.checked
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Service
          </label>
          <select
            value={settings.integrations.emailService}
            onChange={(e) =>
              handleSettingChange(
                "integrations",
                "emailService",
                e.target.value
              )
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">AWS SES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SMS Service
          </label>
          <select
            value={settings.integrations.smsService}
            onChange={(e) =>
              handleSettingChange("integrations", "smsService", e.target.value)
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="twilio">Twilio</option>
            <option value="africastalking">Africa&apos;s Talking</option>
            <option value="nexmo">Vonage (Nexmo)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ServerIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              System Information
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Environment: Production</p>
              <p>Database: PostgreSQL 14.5</p>
              <p>Cache: Redis 6.2</p>
              <p>Storage: AWS S3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Database Connection Pool
          </label>
          <input
            type="number"
            defaultValue={20}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cache TTL (seconds)
          </label>
          <input
            type="number"
            defaultValue={3600}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Enable Logging
            </h4>
            <p className="text-sm text-gray-500">
              Log system events and errors
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Enable Monitoring
            </h4>
            <p className="text-sm text-gray-500">
              Monitor system performance and health
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "platform":
        return renderPlatformSettings();
      case "security":
        return renderSecuritySettings();
      case "payments":
        return renderPaymentSettings();
      case "features":
        return renderFeatureSettings();
      case "integrations":
        return renderIntegrationSettings();
      case "system":
        return renderSystemSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform configuration and system settings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              hasChanges && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Settings tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
