class SubscriberModel {
  final String fullName;
  final String userID;
  final String accountName;
  final String accountPrice;
  final String accountStatus;
  final int activeDaysLeft;
  final String accountExpirationDate;
  final String agentName;
  final String userIP;
  final String mobileNumber;
  final String city;
  final String address;
  final String email;
  final String accountImagePath;
  final String serviceStatusColor;
  final String lastUpdated;
  final bool isLive;

  SubscriberModel({
    required this.fullName,
    required this.userID,
    required this.accountName,
    required this.accountPrice,
    required this.accountStatus,
    required this.activeDaysLeft,
    required this.accountExpirationDate,
    required this.agentName,
    required this.userIP,
    required this.mobileNumber,
    required this.city,
    required this.address,
    required this.email,
    required this.accountImagePath,
    required this.serviceStatusColor,
    required this.lastUpdated,
    this.isLive = true,
  });

  // Default initial snapshot
  factory SubscriberModel.initial() {
    return SubscriberModel(
      fullName: 'سيد جعفر',
      userID: 's.jafar116',
      accountName: 'Plus',
      accountPrice: '35,000 IQD',
      accountStatus: 'فعال',
      activeDaysLeft: 10,
      accountExpirationDate: '01/11/2026 07:45:27 م',
      agentName: 'fgs116',
      userIP: '100.119.255.188',
      mobileNumber: '07725624087',
      city: 'العراق',
      address: 'بغداد',
      email: 's.jafar@earthlink.iq',
      accountImagePath: 'https://user.earthlink.iq/accountImages/138.png',
      serviceStatusColor: 'Green',
      lastUpdated: 'الآن',
      isLive: true,
    );
  }

  // Parse Earthlink GetUserDataAr JSON
  factory SubscriberModel.fromJson(Map<String, dynamic> json) {
    String extract(String key, String fallback) {
      if (json[key] != null && json[key] is Map && json[key]['value'] != null) {
        return json[key]['value'].toString();
      }
      return fallback;
    }

    final daysStr = extract('activeDaysLeft', '10');
    final days = int.tryParse(daysStr) ?? 10;

    return SubscriberModel(
      fullName: extract('fullName', 'سيد جعفر'),
      userID: extract('userID', 's.jafar116'),
      accountName: extract('accountName', 'Plus'),
      accountPrice: extract('accountPrice', '35,000 IQD'),
      accountStatus: extract('accountStatus', 'فعال'),
      activeDaysLeft: days,
      accountExpirationDate: extract('accountExpirationDate', '01/11/2026 07:45:27 م'),
      agentName: extract('agentName', 'fgs116'),
      userIP: extract('userIP', '100.119.255.188'),
      mobileNumber: extract('mobileNumber', '07725624087'),
      city: extract('city', 'العراق'),
      address: extract('address', 'بغداد'),
      email: extract('email', 's.jafar@earthlink.iq'),
      accountImagePath: extract('accountImagePath', 'https://user.earthlink.iq/accountImages/138.png'),
      serviceStatusColor: extract('serviceStatusColor', 'Green'),
      lastUpdated: DateTime.now().toLocal().toString().split('.')[0],
      isLive: true,
    );
  }
}
