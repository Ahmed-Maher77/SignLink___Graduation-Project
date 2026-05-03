String? validatePhoneNumber(String? phone) {
  if (phone == null || phone.isEmpty) {
    return 'Please enter a phone number';
  }
  return null;
}
