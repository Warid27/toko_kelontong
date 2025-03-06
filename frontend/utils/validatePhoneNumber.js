export function validatePhoneNumber(phone) {
  // Remove all non-digit characters except the leading '+'
  let cleanedPhone = phone.replace(/[^\d+]/g, "");

  // Regex to match country code (1-3 digits) and number (1-15 digits)
  let regex = /^\+?[1-9]\d{0,2}[\d\s-]{1,18}$/;

  if (!regex.test(phone)) {
    return {
      isValid: false,
      message:
        "Invalid phone format. Use:\n✅ +1 xxx-xxxx-xxxx\n✅ +62 800-0909-20002\n✅ 62xxxxxxxxxx",
    };
  }

  // Extract the numeric part (excluding the leading '+')
  let numericPart = cleanedPhone.replace(/^\+/, "");

  // Ensure the total number part after the country code is max 15 digits
  let countryCodeMatch = numericPart.match(/^(\d{1,3})/);
  if (countryCodeMatch) {
    let countryCode = countryCodeMatch[0];
    let numberPart = numericPart.slice(countryCode.length);
    if (numberPart.length > 15) {
      return { isValid: false, message: "Phone number is too long." };
    }
  }

  return { isValid: true, message: "Valid phone number." };
}
