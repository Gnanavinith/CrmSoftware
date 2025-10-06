import React from 'react';

const ClientDetails = ({ client, onClose, onEdit, onDelete }) => {
  if (!client) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getServiceLabel = (serviceValue) => {
    const serviceLabels = {
      'digital-marketing': 'Digital Marketing',
      'web-development': 'Web Development',
      'app-development': 'App Development',
      'seo-services': 'SEO Services',
      'social-media': 'Social Media Management',
      'content-creation': 'Content Creation',
      'branding': 'Branding & Design',
      'consulting': 'Business Consulting',
      'other': 'Other'
    };
    return serviceLabels[serviceValue] || serviceValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {getInitials(client.name)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-blue-100">{client.company}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                    {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900 font-medium">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900 font-medium">{client.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Industry</label>
                    <p className="text-gray-900 capitalize">{client.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Client Since</label>
                    <p className="text-gray-900">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              {client.contactPerson && (client.contactPerson.name || client.contactPerson.position || client.contactPerson.email) && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.contactPerson.name && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900 font-medium">{client.contactPerson.name}</p>
                      </div>
                    )}
                    {client.contactPerson.position && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Position</label>
                        <p className="text-gray-900">{client.contactPerson.position}</p>
                      </div>
                    )}
                    {client.contactPerson.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{client.contactPerson.email}</p>
                      </div>
                    )}
                    {client.contactPerson.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{client.contactPerson.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services */}
              {client.services && client.services.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {getServiceLabel(service)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              {client.address && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div className="text-gray-900">
                    {client.address.street && <p>{client.address.street}</p>}
                    {client.address.city && <p>{client.address.city}</p>}
                    {client.address.state && <p>{client.address.state}</p>}
                    {client.address.zipCode && <p>{client.address.zipCode}</p>}
                    {client.address.country && <p>{client.address.country}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onEdit(client);
                      onClose();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Client</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this client?')) {
                        onDelete(client._id);
                        onClose();
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Client</span>
                  </button>
                </div>
              </div>

              {/* Client Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">{formatDate(client.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-900">{formatDate(client.updatedAt)}</span>
                  </div>
                  
                  {client.projects && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Projects</span>
                      <span className="text-sm text-gray-900">{client.projects.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800 text-sm">
                      {client.email}
                    </a>
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
