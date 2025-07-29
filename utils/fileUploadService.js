// fileUploadService.js - Dedicated service for handling file uploads with multipart/form-data
import { apiClient } from './api';

/**
 * Upload a file using multipart/form-data
 * This is a separate service specifically for file uploads that require multipart/form-data
 * All other API calls should use application/json
 */
export async function uploadFile(fileUri, fileType, endpoint, additionalFields = {}) {
  try {
    // Get the filename from the URI
    const filename = fileUri.split('/').pop() || 'file.jpg';
    
    // Create FormData for the file upload
    const formData = new FormData();
    
    // Append the file
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: fileType || 'image/jpeg',
    });
    
    // Append additional fields
    Object.keys(additionalFields).forEach(key => {
      formData.append(key, additionalFields[key]);
    });
    
    // Use the apiClient to make the request
    const response = await apiClient.uploadFile(endpoint, formData);
    
    if (!response.success) {
      throw new Error(response.error || 'Upload failed');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload a profile photo
 * This is a specific implementation for profile photo uploads
 */
export async function uploadProfilePhoto(photoUri, email) {
  try {
    return await uploadFile(
      photoUri,
      'image/jpeg',
      '/req/user/profile-photo',
      { email }
    );
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Upload a meeting attachment
 */
export async function uploadMeetingAttachment(fileUri, fileType, meetingId) {
  try {
    return await uploadFile(
      fileUri,
      fileType,
      `/req/meetings/${meetingId}/attachments`,
      { meetingId }
    );
  } catch (error) {
    console.error('Error uploading meeting attachment:', error);
    throw error;
  }
}