import { useState } from "react";
import { UserCircle, CheckCircle, Clock, Copy, Settings as SettingsIcon, Building, User, FileText } from "lucide-react";

const mockInvitations = [
  {
    id: 1,
    requester: 'Acme Inc.',
    type: 'Company',
    reason: 'Pre-approval for Mortgage Application',
    date: '2023-11-05',
  },
  {
    id: 2,
    requester: 'Jane Smith',
    type: 'Personal',
    reason: 'Screening for apartment rental',
    date: '2023-11-03',
  },
  {
    id: 3,
    requester: 'FinTech Global',
    type: 'Company',
    reason: 'Application for a new credit line',
    date: '2023-11-01',
  },
];

export default function Client() {
  const [activeTab, setActiveTab] = useState("invitation");

  const TabButton = ({ tabName, label }) => {
    // ... (This component remains unchanged)
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
          isActive
            ? "border-indigo-500 text-indigo-600"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* --- Header --- */}
      <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          FORT.ai
        </p>
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-700">John Doe</span>
          <UserCircle className="w-8 h-8 text-gray-400" />
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        {/* --- Tab Navigation --- */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex -mb-px space-x-6">
            <TabButton tabName="invitation" label="Invitations" />
            <TabButton tabName="completed" label="Completed Tasks" />
            <TabButton tabName="history" label="Blockchain History" />
            <TabButton tabName="settings" label="Settings" />
          </nav>
        </div>

        {/* --- Conditional Content Based on Active Tab --- */}
        <div>
          {activeTab === "invitation" && <InvitationView />}
          {activeTab === "completed" && <CompletedView />}
          {activeTab === "history" && <HistoryView />}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

const InvitationCard = ({ invitation, onAccept, onDecline }) => {
    const isCompany = invitation.type === 'Company';
    return (
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-sm p-6 flex flex-col space-y-4">
            {/* Card Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{invitation.requester}</h3>
                    <p className="text-sm text-gray-500">Request for: {invitation.reason}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    isCompany ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                }`}>
                    {isCompany ? <Building size={14} /> : <User size={14} />}
                    {invitation.type}
                </span>
            </div>

            {/* Card Footer with Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Received: {invitation.date}</p>
                <div className="flex items-center space-x-3">
                    <button onClick={onDecline} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        Decline
                    </button>
                    <button onClick={onAccept} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors">
                        Produce Data
                    </button>
                </div>
            </div>
        </div>
    );
};

const InvitationView = () => {
  // Manage the list of invitations in state
  const [invitations, setInvitations] = useState(mockInvitations);

  const handleAccept = (id) => {
    // For the demo, we just remove the invitation from the list
    setInvitations(invitations.filter(inv => inv.id !== id));
  };

  const handleDecline = (id) => {
    setInvitations(invitations.filter(inv => inv.id !== id));
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Invitations</h2>
      </div>

      {invitations.length > 0 ? (
        invitations.map(inv => (
          <InvitationCard
            key={inv.id}
            invitation={inv}
            onAccept={() => handleAccept(inv.id)}
            onDecline={() => handleDecline(inv.id)}
          />
        ))
      ) : (
        <div className="w-full max-w-2xl text-center py-16 px-8 bg-white border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No new invitations</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up! Check back later for new data requests.</p>
        </div>
      )}
    </div>
  );
};

const CompletedView = () => (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Completed Tasks</h2>
        <ul className="space-y-4">
            <li className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                    <p className="font-semibold text-gray-700">Credit Score Generation</p>
                    <p className="text-sm text-gray-500">Completed on: 2023-10-26</p>
                </div>
                <span className="text-green-500 flex items-center gap-2"><CheckCircle size={20} /> Verified</span>
            </li>
            <li className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                    <p className="font-semibold text-gray-700">Identity Verification</p>
                    <p className="text-sm text-gray-500">Completed on: 2023-10-22</p>
                </div>
                <span className="text-green-500 flex items-center gap-2"><CheckCircle size={20} /> Verified</span>
            </li>
        </ul>
    </div>
);

const HistoryView = () => (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">On-Chain Activity</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono flex items-center gap-2">
                            5G2E...Y37A <Copy size={14} className="cursor-pointer hover:text-indigo-600"/>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Append Score</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-10-26</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono flex items-center gap-2">
                            A8KJ...B2X9 <Copy size={14} className="cursor-pointer hover:text-indigo-600"/>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Opt-In</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-10-22</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const SettingsView = () => (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal details.</p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" defaultValue="John Doe" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" defaultValue="john.doe@example.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" />
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
                 <button className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800">
                    Change Password
                </button>
            </div>
        </div>
    </div>
);
