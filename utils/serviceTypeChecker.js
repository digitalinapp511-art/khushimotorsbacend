// Service Type Checker - Identifies services that should generate tokens

// List of car services that SHOULD generate tokens (reversed logic)
export const CAR_SERVICE_NAMES = [
  "Car Washing",
  "Suspension Repair", 
  "General Repair",
  "AC Service",
  "Detailing Services",
  "Emergency Services"
];

// List of car service variations (case-insensitive matching)
export const CAR_SERVICE_PATTERNS = [
  /^car wash/i,
  /^carwashing/i,
  /^suspension repair/i,
  /^general repair/i,
  /^ac service/i,
  /^air conditioning/i,
  /^detailing/i,
  /^emergency/i,
  /^car repair/i,
  /^vehicle repair/i
];

/**
 * Check if a service SHOULD generate a token (specified car services)
 * @param {string} serviceName - Name of service
 * @returns {boolean} - true if service should generate token
 */
export const shouldGenerateToken = (serviceName) => {
  if (!serviceName || typeof serviceName !== 'string') {
    return false;
  }

  // Check exact matches
  if (CAR_SERVICE_NAMES.includes(serviceName.trim())) {
    return true;
  }

  // Check pattern matches
  return CAR_SERVICE_PATTERNS.some(pattern => pattern.test(serviceName.trim()));
};

/**
 * Check if a service should NOT generate a token (other services)
 * @param {string} serviceName - Name of service
 * @returns {boolean} - true if service should NOT generate token
 */
export const shouldSkipTokenGeneration = (serviceName) => {
  return !shouldGenerateToken(serviceName);
};

/**
 * Check if a service package is for a car service (should not generate token)
 * @param {Object} servicePackage - Service package object
 * @returns {boolean} - true if package should NOT generate token
 */
export const isCarServicePackage = async (servicePackageId) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const ServicePackage = (await import("../models/ServicePackage.js")).default;
    const Service = (await import("../models/Service.js")).default;
    
    // Get the service package with populated service
    const packageData = await ServicePackage.findById(servicePackageId).populate('serviceName');
    
    if (!packageData || !packageData.serviceName) {
      return false;
    }
    
    const serviceName = packageData.serviceName.name;
    return shouldSkipTokenGeneration(serviceName);
  } catch (error) {
    console.error("Error checking car service package:", error);
    return false;
  }
};

/**
 * Enhanced booking token generation with car service check
 * @param {Object} bookingData - Booking data
 * @returns {Object} - Updated booking data with or without token
 */
export const processBookingToken = async (bookingData) => {
  const { servicePackageId } = bookingData;
  
  // Check if this is a service that should generate token
  const shouldGenerate = await isCarServicePackage(servicePackageId);
  
  if (!shouldGenerate) {
    console.log("🚗 Non-car service detected - skipping token generation");
    return {
      ...bookingData,
      token: null // No token for non-car services
    };
  }
  
  // Generate token for specified car services
  const { generateBookingToken } = await import("../services/tokenService.js");
  const token = await generateBookingToken();
  
  console.log("🎫 Car service - generating token:", token);
  return {
    ...bookingData,
    token
  };
};
